import type { Actions } from './$types';

export const actions = {
    default: async (event) => {
        console.log({ event });
        const data = event.request.formData();
        const question = (await data).get('question');
        console.log("question: ", question)
    }
} satisfies Actions;