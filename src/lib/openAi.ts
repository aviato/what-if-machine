import dotenv from "dotenv";
dotenv.config();
import { OpenAI } from "openai";

export const promptWords = {
  positiveHighEnergy: [
    "bright",
    "vibrant",
    "dynamic",
    "spirited",
    "vivid",
    "lively",
    "energetic",
    "colorful",
    "joyful",
    "romantic",
    "expressive",
    "bright",
    "rich",
    "kaleidoscopic",
    "psychedelic",
    "saturated",
    "ecstatic",
    "brash",
    "exciting",
    "passionate",
    "hot",
  ],
  positiveLowEnergy: [
    "light",
    "peaceful",
    "calm",
    "serene",
    "soothing",
    "relaxed",
    "placid",
    "comforting",
    "cosy",
    "tranquil",
    "quiet",
    "pastel",
    "delicate",
    "graceful",
    "subtle",
    "balmy",
    "mild",
    "ethereal",
    "elegant",
    "tender",
    "soft",
    "light",
  ],
  negativeLowEnergy: [
    "muted",
    "bleak",
    "funereal",
    "somber",
    "melancholic",
    "mournful",
    "gloomy",
    "dismal",
    "sad",
    "pale",
    "washed-out",
    "desaturated",
    "grey",
    "subdued",
    "dull",
    "dreary",
    "depressing",
    "weary",
    "tired",
  ],
  negativeHighEnergy: [
    "dark",
    "ominous",
    "threatening",
    "haunting",
    "forbidding",
    "gloomy",
    "stormy",
    "doom",
    "apocalyptic",
    "sinister",
    "shadowy",
    "ghostly",
    "unnerving",
    "harrowing",
    "dreadful",
    "frightful",
    "shocking",
    "terror",
    "hideous",
    "ghastly",
    "terrifying",
  ],
};

const scifiAuthors = [
  "Frank Herbert",
  "Orson Scott Card",
  "Ray Bradbury",
  "William Gibson",
  "Dan Simmons",
  "Isaac Asimov",
  "Phillip K. Dick",
];

function getRandomScifiAuthor() {
  return scifiAuthors[Math.floor(Math.random() * scifiAuthors.length)];
}

export function parseResponse(text: string) {
  const authorIndex = text.indexOf("Written by:");
  const authorMatch = text.match(/Written by:\s(.*?)(?=%)/);
  const captionMatch = text.match(/%(.*?)\$/);
  const imagePromptMatch = text.match(/\$(.*?)~/);
  const moodMatch = text.match(/~(.*?)$/);
  const result: {
    author?: string;
    caption?: string;
    imagePrompt?: string;
    mood?: string;
    content?: string;
  } = {};

  if (authorMatch) {
    result.author = authorMatch[1].trim();
  }

  if (captionMatch) {
    result.caption = captionMatch[1].trim();
  }

  if (imagePromptMatch) {
    result.imagePrompt = imagePromptMatch[1].trim();
  }

  if (moodMatch) {
    result.mood = moodMatch[1].trim();
  }

  result.content = text.substring(0, authorIndex).trim();
  return result;
}

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
    const response = await openAi.chat.completions.create({
      messages: [
        {
          role: "system",
          content: `
Generate a short story in the writing style of ${getRandomScifiAuthor()} using the following prompt. The story must begin with a letter of the English Alphabet (no special characters like quotation marks as the first character). Prompt: ${userQuestion}.
Keep the content of the story less than 150 words.
After the last punctuation of the story, include "Written by: ", followed by a fake author's name (cannot be the same of the author whose style is being referenced).
After the authors name include the character % followed immediately by a short caption for the image less than 10 words. (no spaces between the % and the start of the caption).
After the caption include a $ character and after it insert the entire story summed up in one short sentence that can be used to generate an image using an API that takes a text prompt and generates and image (no spaces between the $ and the image prompt).
Example: If the story is about a sentient AI What if Machine, the prompt might be: "A sentient ai what if machine answers questions for the human race."
Lastly, after the caption, include the ~ character and analyze the story, placing it into one of the following categories and return your choice as the words joined together in camelcase: positive high energy, positive low energy, negative high energy, negative low energy.`,
        },
      ],
      model: "gpt-3.5-turbo",
      user: sessionId,
    });

    return response;
  } catch (e) {
    console.error("Error getting content from Open AI.");
    console.error(e);
  }
}

export async function generateImageAsBuffer(prompt: string, sessionId: string) {
  try {
    // get image data as base64 from openai api
    const openAiImageRes = await openAi.images.generate({
      prompt: `${prompt} in the style of Simon Stålenhag, Ornate, delicate, neat, precise,
      detailed, opulent, lavish, elegant,
      ornamented, fine, elaborate,
      accurate, intricate, meticulous,
      decorative, realistic, cybernetic, scifi, dark, ominous, threatening,
      haunting, forbidding, gloomy,
      stormy, doom, apocalyptic,
      sinister, shadowy, ghostly,
      unnerving, harrowing, dreadful,
      frightful`, // TODO: maybe keep a list of options like "digital art"
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
