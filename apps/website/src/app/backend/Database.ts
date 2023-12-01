import postgres from 'postgres';

const sql = postgres({
  host: process.env.DATABASE_HOST!,
  port: Number(process.env.DATABASE_PORT!),
  database: process.env.DATABASE_NAME!,
  username: process.env.DATABASE_USERNAME!,
  password: process.env.DATABASE_PASSWORD!,

});

export default sql;