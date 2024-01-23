import { openai, model as defaultModel } from "$lib/server/server"
import type * as Req from '$lib/request_types'
import type { RequestEvent } from "./$types";


export async function POST(event: RequestEvent) {
  const body = await event.request.json() as Req.Chat;
  let model = body.model || defaultModel;

  const stream = await openai.chat.completions.create({
    model: model,
    messages: body.messages,
    temperature: 0.7,
    max_tokens: 2048,
    top_p: 1.0,
    frequency_penalty: 0.0,
    presence_penalty: 0.0,
    stream: true,
  });

  const readableStream = new ReadableStream({
    async start(controller) {
      try {
        for await (const chunk of stream) {
          const data = JSON.stringify(chunk);
          controller.enqueue(`data: ${data}\n\n`);
        }
        controller.enqueue('data: [DONE]\n\n');
        controller.close();
      } catch (err) {
        console.error("Streaming error:", err);
        controller.error(err);
      }
    }
  });

  return new Response(readableStream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache'
    }
  });
}
