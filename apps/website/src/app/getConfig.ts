import { z } from "zod";

function errorMissingEnvironmentVariable(variableName: string) {
	throw new Error(`Missing environment variable: ${variableName}`);
}

function getProcessEnvironmentVariable(variableName: string): string {
	const variable = process.env[variableName];
	if (variable == undefined) errorMissingEnvironmentVariable(variableName);
	return variable!;
}

const environmentSchema = z.literal("development").or(z.literal("production"));

export default function getConfig() {
	const dbConnectionString = getProcessEnvironmentVariable("DB_CONNECTION");
	const jwtSecret = getProcessEnvironmentVariable("JWT_SECRET");
	const stripeAPIKey = getProcessEnvironmentVariable("STRIPE_API_KEY");
	const stripeHookSecret = getProcessEnvironmentVariable("STRIPE_HOOK_KEY");
	const parsedEnvironment = environmentSchema.safeParse(
		getProcessEnvironmentVariable("NODE_ENV")
	);
	if (!parsedEnvironment.success)
		throw new Error(
			"Invalid environment variable: NODE_ENV must either be development or production!"
		);

	const emailUser = getProcessEnvironmentVariable("EMAIL_USER");
	const emailPassword = getProcessEnvironmentVariable("EMAIL_USER_PASSWORD");

	return {
		dbConnectionString,
		jwtSecret,
		stripeAPIKey,
		stripeHookSecret,
		environment: parsedEnvironment.data,
		emailCredentials: {
			user: emailUser,
			password: emailPassword
		}
	};
}
