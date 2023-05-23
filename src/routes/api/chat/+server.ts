import { json } from "@sveltejs/kit"
import { openai, model } from "$lib/server/server"
import type * as Req from '$lib/request_types'

export async function GET(event) {
  const res = await openai.listModels();
  return json({
    response: 'Hello!',
  });
}



export async function POST(event) {
  const body = await event.request.json() as Req.Chat;

  const response = await openai.createChatCompletion({
    model: model,
    messages: body.messages,
    temperature: 0.7,
    max_tokens: 512,
    top_p: 1.0,
    frequency_penalty: 0.0,
    presence_penalty: 0.0,
  });
  const content = response.data.choices[0].message?.content || "";
  console.log(content);
  const answer: Req.ChatCompletionRequestMessage = {
    content,
    role: "assistant"
  };

  return json([answer]);

}
