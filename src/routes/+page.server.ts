import dotenv from "dotenv";
import type { Actions } from "./$types";
import { fail } from "@sveltejs/kit";
import { OpenAI } from "openai";
import { Pool, type PoolClient } from "pg";

dotenv.config();

const apiKey = process.env.OPENAI_API_KEY;

if (!apiKey) {
  throw new Error("You must provide an API key.");
}

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export const actions = {
  default: async (event) => {
    const data = event.request.formData();

    if (!data) {
      return fail(400);
    }

    const question = (await data).get("question") as string;

    if (!question) {
      return fail(400, { question, missing: true });
    }

    const completion = await openai.chat.completions.create({
      messages: [
        {
          role: "system",
          content: `Using a three paragraph story arc - introduction, middle, conclusion - and less than 50 words; in the tone of a master storyteller, answer this prompt: what if ${question}?`,
        },
      ],
      model: "gpt-3.5-turbo",
    });

    if (
      !completion?.choices?.length ||
      !completion.choices[0]?.message?.content
    ) {
      return fail(400);
    }

    const pool = new Pool({
      user: process.env.DB_USER,
      password: process.env.DB_PW,
      database: process.env.DB_NAME,
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT),
    });

    // There might be a better way to do this.
    pool.on("error", () => {
      return fail(500);
    });

    const poolClient = await pool.connect();

    async function insertAnswerAndImage(dbPoolClient: PoolClient) {
      try {
        const dbQueryText =
          "INSERT INTO Answers(query, content) VALUES($1, $2) RETURNING id";
        const values = [question, completion.choices[0].message.content];

        // Run Answer INSERT and return ID
        const dbQueryResult = await dbPoolClient.query(dbQueryText, values);
        const answerId = dbQueryResult.rows[0].id;

        try {
          // get image data as b64 from openai api
          // TODO: Reenable once cloud storage is up and running
          // const openAiImageRes = await openai.images.generate({
          //   prompt: `${question} digital art`,
          //   n: 1,
          //   size: "256x256",
          //   response_format: "b64_json",
          // });

          // const imageData = Buffer.from(
          //   openAiImageRes.data[0].b64_json as string,
          //   "base64"
          // );

          // Use AnswerID from above to insert the associate image(s)
          // TODO: remove this in favor of storing images in s3 or something similar
          // await dbPoolClient.query(dbQueryTextImage, imagesQueryValues);

          return answerId;
        } catch (e) {
          // Note: this is useless right now
          console.error("Failed to save image to database");
        }
      } catch (e) {
        console.error(
          "Failed to save Answer to db. Please contact Administrator."
        );
      }
    }

    // TODO: move this into a different file
    const res = await insertAnswerAndImage(poolClient);
    poolClient.release();

    return {
      answerId: res?.answerId,
      success: true,
    };
  },
} satisfies Actions;
