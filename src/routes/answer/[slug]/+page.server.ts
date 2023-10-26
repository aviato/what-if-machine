import { fail } from "@sveltejs/kit";
import dotenv from "dotenv";
import { Pool } from "pg";
import type { PageServerLoad } from "./$types";

dotenv.config();

export interface AnswerProps {
  id: string;
  query: string;
  content: string;
}

// TODO update this with logic to pull images from cloud storage instead
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
  SELECT
    A.id AS answer_id,
    A.query,
    A.content,
    I.id AS image_id,
    I.images
  FROM answers A
  LEFT JOIN images I ON A.id = I.answer_id
  WHERE A.id = $1;
  `,
    [params.slug]
  );

  return {
    id: params.slug,
    query: rows[0].query as string,
    content: rows[0].content as string,
  } as AnswerProps;
};
