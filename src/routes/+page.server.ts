import dotenv from "dotenv";
dotenv.config();

import type { Actions, PageServerLoad, RequestEvent } from "./$types";
import { fail } from "@sveltejs/kit";
import {
  connectToDb,
  createAnswer,
  createUser,
  readUserWarningsCount,
  updateUserWarningsCount,
} from "$lib/db";
import { saveImage } from "$lib/cloudflare";
import {
  generateImageAsBuffer,
  getAnswerContent,
  moderateContent,
} from "$lib/openAi";

// Upon initial load of home page, if user has 3 warnings already, send them to error page
// If session id cannot be found, create a user and assign them a session id.
// TODO: figure out if session id should have expiry time in this case.
export const load: PageServerLoad = async (e: RequestEvent) => {
  const poolClient = await connectToDb();
  const sessionIdCookie = e.cookies.get("X-What-If-Machine-Session-Id");
  if (sessionIdCookie) {
    const warningsCount = await readUserWarningsCount(
      poolClient,
      sessionIdCookie
    );

    if (typeof warningsCount !== "number" || warningsCount >= 3) {
      // don't even load the page, redirect to error page (not sure which one yet)
      fail(403);
    }
  } else {
    const sessionId = await createUser(poolClient);
    if (sessionId) {
      e.cookies.set("X-What-If-Machine-Session-Id", sessionId);
    }
  }
};

export const actions = {
  default: async (event) => {
    const sessionIdCookie = event.cookies.get("X-What-If-Session-Id");
    const data = event.request.formData();

    if (!sessionIdCookie) {
      return fail(403);
    }

    if (!data) {
      return fail(400);
    }

    const question = (await data).get("question") as string;

    if (!question) {
      return fail(400, { question, missing: true });
    }

    const poolClient = await connectToDb();

    const moderationResult = await moderateContent(question);
    const contentFlagged = moderationResult?.results[0]?.flagged;

    if (contentFlagged) {
      const warningsCount = await updateUserWarningsCount(
        poolClient,
        sessionIdCookie
      );

      // https://node-postgres.com/apis/pool#releasing-clients
      poolClient.release();

      return {
        success: false,
        warning: true,
        warningsCount,
      };
    }

    // completion is what openai calls this response.
    // see ref: https://platform.openai.com/docs/guides/gpt/chat-completions-api
    const completion = await getAnswerContent(question, sessionIdCookie);

    if (
      !completion?.choices?.length ||
      !completion.choices[0]?.message?.content
    ) {
      return fail(400);
    }

    const answerId = await createAnswer(poolClient, [
      question,
      // TODO: Yep... this isn't great. Is there a better way?
      completion?.choices[0].message.content as string,
    ]);

    const imageBuffer = await generateImageAsBuffer(question, sessionIdCookie);

    if (imageBuffer) {
      await saveImage(imageBuffer, answerId);
    }

    // https://node-postgres.com/apis/pool#releasing-clients
    poolClient.release();

    return {
      answerId,
      success: true,
      contentWarning: false,
    };
  },
} satisfies Actions;
