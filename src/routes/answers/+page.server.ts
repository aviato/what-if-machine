import type { PageServerLoad } from "./$types";
import { connectToDb, readAllAnswers, readAnswerById } from "$lib/db";

export interface Answer {
  id: number;
  query: string;
  created_at: string;
}

export interface AnswersPageData {
  answers: Answer[];
}

export const load: PageServerLoad = async () => {
  const poolClient = await connectToDb();

  // get answer data from db
  // if data cannot be found, return 404
  const answersResponse = await readAllAnswers(poolClient);

  poolClient.release();

  return {
    answers: answersResponse?.rows,
  } as AnswersPageData;
};
