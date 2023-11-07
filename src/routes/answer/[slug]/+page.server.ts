import { fail } from "@sveltejs/kit";
import dotenv from "dotenv";
import { Pool } from "pg";
import type { PageServerLoad } from "./$types";
import { connectToDb, readAnswerById } from "$lib/db";
import { parseResponse } from "$lib/openAi";

dotenv.config();

export interface AnswerPageData {
  id: string;
  query: string;
  content: string;
  imageUrl: string;
  author?: string;
  caption?: string;
}

export const load: PageServerLoad = async ({ params }) => {
  const poolClient = await connectToDb();
  const answerResponse = await readAnswerById(poolClient, params.slug);

  if (!answerResponse) {
    throw 500;
  }

  const answer = answerResponse.rows[0];

  const { content, caption, author } = parseResponse(answer.content);
  poolClient.release();

  return {
    id: params.slug,
    query: answer.query as string,
    content: content || (answer.content as string),
    imageUrl: `${process.env.CF_WORKER_URL}${params.slug}`,
    caption,
    author,
  } as AnswerPageData;
};
