import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export { openai };

// export const model = "gpt-3.5-turbo"
export const model = "gpt-4o-mini"
// export const model = "gpt-4o"
