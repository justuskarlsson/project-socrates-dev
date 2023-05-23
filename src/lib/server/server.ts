import { Configuration, OpenAIApi, type CreateCompletionResponse, ChatCompletionRequestMessageRoleEnum } from "openai";


const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
export const openai = new OpenAIApi(configuration);

// const model = "text-davinci-003"
export const model = "gpt-3.5-turbo"
