import { error } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";
import { connectToDb, readAnswerById } from "$lib/db";
import { parseResponse } from "$lib/openAi";
import { CF_WORKER_URL } from '$env/static/private';

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
    error(500, 'Something went wrong');
  }

  const answer = answerResponse.rows[0];

  const { content, caption, author } = parseResponse(answer.content);
  poolClient.release();

  return {
    id: params.slug,
    query: answer.query as string,
    content: content || (answer.content as string),
    imageUrl: `${CF_WORKER_URL}${params.slug}`,
    caption,
    author,
  } as AnswerPageData;
};
