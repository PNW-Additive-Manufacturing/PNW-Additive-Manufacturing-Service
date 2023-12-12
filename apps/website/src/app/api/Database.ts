import postgres from 'postgres';

//TODO: very basic database connection (consider using pools later)
const sql = postgres({
  host: process.env.DATABASE_HOST!,
  port: Number(process.env.DATABASE_PORT!),
  database: process.env.DATABASE_NAME!,
  username: process.env.DATABASE_USERNAME!,
  password: process.env.DATABASE_PASSWORD!,
  max: 100,
  idle_timeout: 10
});


export default sql;