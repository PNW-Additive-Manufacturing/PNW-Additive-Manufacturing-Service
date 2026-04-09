import postgres from "postgres";
import getConfig from "../getConfig";

// Unfortunately, a new SQL connection is made on each NextJS execution context. 

const envConfig = getConfig();
const sql = postgres(envConfig.dbConnectionString, {
    max: 10000,
    idle_timeout: 5
});

export default sql;
