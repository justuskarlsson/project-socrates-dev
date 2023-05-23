import { Configuration, OpenAIApi, type CreateCompletionResponse, ChatCompletionRequestMessageRoleEnum } from "openai";


const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
export const openai = new OpenAIApi(configuration);

// const model = "text-davinci-003"
export const model = "gpt-3.5-turbo"

// export async function getPrompt(conversation: Conversation) : Promise<Message> {

//   const response = await openai.createChatCompletion({
//     model: model,
//     messages: conversation.messages.map(({content, role}) => ({
//       content, 
//       role: role as ChatCompletionRequestMessageRoleEnum
//     })),
//     temperature: 0.7,
//     max_tokens: 512,
//     top_p: 1.0,
//     frequency_penalty: 0.0,
//     presence_penalty: 0.0,
//   });
//   console.log(response.data);
//   const content = response.data.choices[0].message?.content || "";
//   if (content.length == 0) {
//     throw new BadRequest("No valid choices in response from chat-gpt");
//   }

//   const message = new Message();
//   message.content = content;
//   message.role = 'assistant';
//   message.date = new Date();
//   return message;
// };