import dotenv from "dotenv";
dotenv.config();
import { createProdia } from "prodia";

function initClient() {
  if (!process.env.PRODIA_API_KEY) {
    throw new Error("A Prodia API key is required to generate images.");
  }

  const prodia = createProdia({
    apiKey: process.env.PRODIA_API_KEY,
  });
  return prodia;
}

const prodia = initClient();

export async function generateImage(prompt: string, options: {}) {
  try {
    const job = await prodia.generate({
      prompt,
      ...options,
    });

    return await prodia.wait(job);
  } catch (e) {
    console.error("There was a problem generating image with Prodia");
    console.error(e);
  }
}
