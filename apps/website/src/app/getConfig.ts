import "server-only";
import path from "path";
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
	const hostURL = process.env["COOLIFY_FQDN"] ?? "http://localhost:3000";
	const uploadModelDir = getProcessEnvironmentVariable("MODEL_UPLOAD_DIR");
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
	const emailHost = getProcessEnvironmentVariable("EMAIL_HOST");

	return {
		dbConnectionString,
		jwtSecret,
		stripeAPIKey,
		stripeHookSecret,
		hostURL,
		joinHostURL(path: string): URL {
			return new URL(path, this.hostURL);
		},
		uploadModelDir,
		environment: parsedEnvironment.data,
		email: {
			user: emailUser,
			password: emailPassword,
			host: emailHost
		}
	};
}
