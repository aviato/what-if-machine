import { fail } from "@sveltejs/kit";
import dotenv from "dotenv";
import { Pool } from "pg";
import type { PageServerLoad } from "./$types";
import { connectToDb, readAnswerById } from "$lib/db";

dotenv.config();

export interface AnswerPageData {
  id: string;
  query: string;
  content: string;
  imageUrl: string;
}

export const load: PageServerLoad = async ({ params }) => {
  const poolClient = await connectToDb();

  // get answer data from db
  // if data cannot be found, return 404
  const answerResponse = await readAnswerById(poolClient, params.slug);

  if (!answerResponse) {
    throw 500;
  }

  const answer = answerResponse.rows[0];

  poolClient.release();

  return {
    id: params.slug,
    query: answer.query as string,
    content: answer.content as string,
    imageUrl: `${process.env.CF_WORKER_URL}${params.slug}`,
  } as AnswerPageData;
};
