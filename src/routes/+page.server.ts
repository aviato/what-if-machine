import dotenv from 'dotenv';
import type { Actions } from './$types';
import { fail } from '@sveltejs/kit';
import { OpenAI } from 'openai';

dotenv.config();

const apiKey = process.env.OPENAI_API_KEY;

if (!apiKey) {
    throw new Error("You must provide an API key.");
}

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export const actions = {
    default: async (event) => {
        console.log({ event });
        const data = event.request.formData();

        if (!data) {
            return fail(400);
        }

        const question = (await data).get('question') as string;

        if (!question) {
            return fail(400, { question, missing: true });
        }

        const completion = await openai.chat.completions.create({
            messages: [{ role: 'system', content: `Using less than 50 words and in the tone of a master storyteller, answer this prompt: what if ${question}?` }],
            model: 'gpt-3.5-turbo',
        });

        if (!completion?.choices?.length) {
            return fail(400);
        }

        const imageResponse = await openai.images.generate({
            prompt: `${question} digital art`,
            n: 1,
            size: "256x256"
        });

        console.log(imageResponse)

        return {
            success: true,
            textResponse: completion.choices[0].message.content,
            imageResponse: imageResponse.data,
            question
        }
    }

} satisfies Actions;