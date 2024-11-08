"use server";

import postgres from "postgres";
import getConfig from "../getConfig";

// TODO: https://github.com/porsager/postgres?tab=readme-ov-file#data-transformation
// Set PostgresSQl to use camelCase!

//TODO: very basic database connection (consider using pools later)
const envConfig = getConfig();
const sql = postgres(envConfig.dbConnectionString, {
	idle_timeout: 10,
	max: 1000
});

export default sql;
