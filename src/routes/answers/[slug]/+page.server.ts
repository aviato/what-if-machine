import { fail } from "@sveltejs/kit";
import dotenv from "dotenv";
import { Client } from "pg";
import type { PageServerLoad } from "./$types";

dotenv.config();

const client = new Client({
  user: process.env.DB_USER,
  password: process.env.DB_PW,
  database: process.env.DB_NAME,
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
});

await client.connect();

export const load: PageServerLoad = async ({ params }) => {
  // get answer data from db
  // if data cannot be found, return 404
  const res = await client.query(`SELECT $1::text as message`, [
    "Hello world!",
  ]);

  console.log(res.rows[0].message);

  return {};
};
