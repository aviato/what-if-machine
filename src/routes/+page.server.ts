import dotenv from "dotenv";
import type { Actions } from "./$types";
import { fail } from "@sveltejs/kit";
import { OpenAI } from "openai";
import { Pool, type PoolClient } from "pg";

dotenv.config();

// TODO: rename this to be more specific
const apiKey = process.env.OPENAI_API_KEY;
const workerUrl = process.env.CF_WORKER_URL;
const r2Secret = process.env.R2_SECRET;

// TODO: rename this to be more specific
if (!apiKey) {
  throw new Error("You must provide an API key.");
}

if (!workerUrl) {
  throw new Error("You must provide a worker URL.");
}

if (!r2Secret) {
  throw new Error("You must provide a R2 secret.");
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

    // TODO: Move this into helper function at some point
    async function insertAnswerAndImage(dbPoolClient: PoolClient) {
      try {
        const dbQueryText =
          "INSERT INTO Answers(query, content) VALUES($1, $2) RETURNING unique_id";
        const values = [question, completion.choices[0].message.content];

        // Run Answer INSERT and return ID
        const dbQueryResult = await dbPoolClient.query(dbQueryText, values);
        const answerUUID = dbQueryResult.rows[0].unique_id;

        console.log(dbQueryResult);

        try {
          // get image data as base64 from openai api
          const openAiImageRes = await openai.images.generate({
            prompt: `${question} digital art`,
            n: 1,
            size: "1024x1024",
            response_format: "b64_json",
          });

          // Convert b64 image to Buffer
          const imageData = Buffer.from(
            openAiImageRes.data[0].b64_json as string,
            "base64"
          );

          const r2ReqHeaders = new Headers();

          // Required for CF worker requests
          r2ReqHeaders.set(
            "X-Custom-Auth-Key",
            process.env.R2_SECRET as string
          );
          r2ReqHeaders.set("Content-Type", "image/jpeg");

          // Save image to cloud storage via cloudflare worker
          // https://developers.cloudflare.com/r2/api/workers/workers-api-usage/
          await fetch(`${process.env.CF_WORKER_URL}${answerUUID}` as string, {
            method: "PUT",
            headers: r2ReqHeaders,
            body: imageData,
          });

          return answerUUID;
        } catch (e) {
          console.error("Failed to save image to database");
          console.error(e);
        }
      } catch (e) {
        console.error(
          "Failed to save Answer to db. Please contact Administrator."
        );
      }
    }

    const res = await insertAnswerAndImage(poolClient);
    poolClient.release();

    return {
      answerId: res?.answerId,
      success: true,
    };
  },
} satisfies Actions;
