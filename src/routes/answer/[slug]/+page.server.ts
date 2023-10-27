import { fail } from "@sveltejs/kit";
import dotenv from "dotenv";
import { Pool } from "pg";
import type { PageServerLoad } from "./$types";

dotenv.config();

export interface AnswerPageData {
  id: string;
  query: string;
  content: string;
  imageUrl: string;
}

export const load: PageServerLoad = async ({ setHeaders, params }) => {
  const poolClient = new Pool({
    user: process.env.DB_USER,
    password: process.env.DB_PW,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
  });

  // There might be a better way to do this.
  poolClient.on("error", () => {
    return fail(500);
  });

  // get answer data from db
  // if data cannot be found, return 404
  const { rows } = await poolClient.query(
    `
  SELECT * FROM answers
  WHERE id = $1
  `,
    [params.slug]
  );

  return {
    id: params.slug,
    query: rows[0].query as string,
    content: rows[0].content as string,
    imageUrl: `${process.env.CF_WORKER_URL}${params.slug}`,
  } as AnswerPageData;
};
