import dotenv from "dotenv";
dotenv.config();
import { OpenAI } from "openai";

function initClient(): OpenAI {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("You must provide an API key.");
  }
  return new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
}

export const openAi = initClient();

export async function moderateContent(input: string) {
  try {
    return await openAi.moderations.create({ input });
  } catch (e) {
    console.error(
      "Could not check input against Open AI moderation end point."
    );
    console.error(e);
  }
}

export async function getAnswerContent(
  userQuestion: string,
  sessionId: string
) {
  try {
    return await openAi.chat.completions.create({
      messages: [
        {
          role: "system",
          content: `Using a three paragraph story arc - introduction, middle, conclusion - and less than 50 words; in the tone of a master storyteller, answer this prompt: what if ${userQuestion}?`,
        },
      ],
      model: "gpt-3.5-turbo",
      user: sessionId,
    });
  } catch (e) {
    console.error("Error getting content from Open AI.");
    console.error(e);
  }
}

export async function generateImageAsBuffer(prompt: string, sessionId: string) {
  try {
    // get image data as base64 from openai api
    const openAiImageRes = await openAi.images.generate({
      prompt: `${prompt} digital art`, // TODO: maybe keep a list of options like "digital art"
      n: 1,
      size: "1024x1024",
      response_format: "b64_json",
      user: sessionId,
    }); // Convert b64 image to Buffer

    // TODO: need a way of verifying the integrity of this data...
    return Buffer.from(openAiImageRes?.data[0]?.b64_json as string, "base64");
  } catch (e) {
    console.error("Failed to generate Open Ai image.");
    console.error(e);
  }
}
