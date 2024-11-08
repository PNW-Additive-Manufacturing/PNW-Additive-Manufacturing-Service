import { readFileSync, rmSync } from "fs";
import cron from "node-cron";
import postgres from "postgres";
import {config as env_config} from "dotenv";

console.log("Hello, from AMS-CRON!");

env_config();

const databaseConnectionString = useEnvVariable("DB_CONNECTION");
const farmAPIUrl = useEnvVariable("FARM_API_URL");
const modelUploadPath = useEnvVariable("MODEL_UPLOAD_DIR");
// The amount of days a models data should persist until purged.
const modelLifespan = parseInt(useEnvVariable("MODEL_LIFESPAN"));

console.log(`Configuration:\nMODEL_UPLOAD_DIR: ${modelUploadPath}\nModel Lifespan: ${modelLifespan} (days)\nFarmAPI: ${farmAPIUrl}`);

// We CANNOT use the built-in camelCase transformations because our schema keys are not in snake_case! (Unfortunate)
const sql = postgres(databaseConnectionString, { transform: postgres.camel });

const analyzeModelsTask = cron.schedule("*/30 * * * * *", async () => {
	
	const unAnalyzedModel = await queryUnAnalyzedModel();
	
	if (unAnalyzedModel == null)
	{
		// We are caught up with all pending models!
		return;
	}

	let workingColorHex = unAnalyzedModel.monocolor as string ?? unAnalyzedModel.dicolora as string;
	if (workingColorHex[0] == "#")
	{
		workingColorHex = workingColorHex.substring(1);
	}

	// console.log(unAnalyzedModel);

	let previousError: any;
	
	for (let attempt = 1; attempt <= 4; attempt++)
	{
		try
		{
			const ownerEmailWithoutDomain = getEmailUsername(unAnalyzedModel.owneremail);

			let modelFile: Buffer;
			try
			{
				modelFile = readFileSync(`${modelUploadPath}/${ownerEmailWithoutDomain}/${unAnalyzedModel.id}.stl`);
			} 
			catch (err)
			{
				console.error(err);
				throw new Error("Issue occurred during Model Download");
			}

			// We have downloaded the STL, send it off to the FarmAPI to process and return the metadata!

			let result: {
				success: boolean,
				message?: string,
				weightInGrams: number,
				duration: string
			};

			// TODO: This will be changed in the future as different technologies (such as FDM, SLS) will be added as an option for individual parts.
			// We are providing a certain model of a printer to be a "generic" comparison between multiple machines which have small differences.
			const fetchURL = `${farmAPIUrl}/printers/Kachow/slice/info?fileName=${unAnalyzedModel.name}.stl&material=${unAnalyzedModel.filamentmaterial}&colorHex=${workingColorHex}&layerHeight=0.2&quantity=1&useSupports=false`;

			try
			{
				result = await fetch(fetchURL, { cache: "no-cache", method: "POST", body: modelFile }).then(res => res.json());

				if (!result.success) throw new Error(result.message!);
			}
			catch (err)
			{
				console.log(fetchURL);
				console.error(err);
				throw new Error("Issue occurred during Slicing");
			}

			// FarmAPI gave us back a presumably valid result, upload the model analysis to our database. 
	
			await sql`INSERT INTO ModelAnalysis (ModelId, EstimatedFilamentUsedInGrams, EstimatedDuration, MachineModel, MachineManufacturer) VALUES (${unAnalyzedModel.id}, ${result.weightInGrams}, ${result.duration}, 'X1C', 'BBL')`;
			
			console.log(`Model analysis on ${unAnalyzedModel.name} completed!`);
			return;
		}
		catch (err)
		{
			console.error(`An issue occurred analyzing model on attempt #${attempt}: ${unAnalyzedModel.name}\n${err}`);
			previousError = err;

			// Wait a few seconds, error may have been caused by connection issues, give it time to fix itself.
			await wait(5000);
		}
	}

	const errorContent = (previousError as Error)?.message ?? "Unknown";

	console.error(`Model analysis on ${unAnalyzedModel.name} has failed too many times:\n${errorContent}`);

	// We had no luck analyzing the model, we will mark it as a fail!
	await sql`INSERT INTO ModelAnalysis (ModelId, FailedReason, MachineModel, MachineManufacturer) VALUES (${unAnalyzedModel.id}, ${errorContent}, 'X1C', 'BBL')`;
});

// Run at midnight every day.
const deletePurgedTask = cron.schedule("* * * * *", async () => {

	try
	{
		const modelsPendingPurge = await queryModelsPendingPurge();

		for (let model of modelsPendingPurge)
		{
			try
			{
				const emailUsername = getEmailUsername(model.owneremail);
	
				await sql.begin(async trans =>
				{
					await trans`UPDATE Model SET IsPurged=true WHERE Id=${model.id}`;
					
					rmSync(`${modelUploadPath}/${emailUsername}/${model.id}.stl`, { force: true });
				});

				console.log(`Successfully purged: ${model.name}`);
			}
			catch (err)
			{
				console.error(`Failed to purge model: \"${model.name}\" Skipping...\n${err}`);
			}
		}
	}
	catch (err)
	{
		console.error(err);
	}
});

async function queryModelsPendingPurge()
{
	return await sql`SELECT m.Id, m.Name, m.OwnerEmail FROM Model m WHERE NOW() > m.UploadedAt + ${modelLifespan + ' days'}::interval LIMIT 100`;
}

async function queryUnAnalyzedModel()
{
	return (await sql`SELECT 
						m.OwnerEmail, 
						f.Material AS FilamentMaterial, 
						f.MonoColor, 
						f.DiColorA, 
						p.Quantity,
						f.DiColorB, 
						m.Id, 
						m.Name
					FROM Model m
					LEFT JOIN ModelAnalysis ma ON m.Id = ma.ModelId
					LEFT JOIN Part p ON m.Id = p.ModelId
					LEFT JOIN Filament f ON p.AssignedFilamentId = f.Id
					WHERE m.IsPurged = false 
						AND ma.ModelId IS NULL 
						AND p.Quantity IS NOT NULL
					ORDER BY p.Id
					LIMIT 1;
					`).at(0);
}

function useEnvVariable(name: string): string
{
	const variableValue = process.env[name];
	if (variableValue == null)
	{
		throw new Error(`${name} must be provided!`);
	}
	return variableValue;
}

function getEmailUsername(emailAddress: string)
{
	return emailAddress.split("@")[0];
}

function wait(ms: number)
{
	return new Promise(resolve => setTimeout(resolve, ms))
}
