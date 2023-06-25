import { openai, model as defaultModel } from "$lib/server/server"
import type * as Req from '$lib/request_types'
import type { RequestEvent } from "./$types";



export async function POST(event: RequestEvent) {
  const body = await event.request.json() as Req.Chat;
  let model = body.model || defaultModel;

  // Make a streaming request to OpenAI
  const apiResponse = await openai.createChatCompletion({
    model: model,
    messages: body.messages,
    temperature: 0.7,
    max_tokens: 512,
    top_p: 1.0,
    frequency_penalty: 0.0,
    presence_penalty: 0.0,
    stream: true,
  }, { responseType: 'stream' }) as any;
  const readableStream = new ReadableStream({
    start(controller) {
      // Forward the data from the API to the client
      apiResponse.data.on('data', (data: any) => {
        controller.enqueue(data); // SSE format
      });

      // When the API request is done, close the stream
      apiResponse.data.on('end', () => {
        controller.enqueue('data: [DONE]\n\n'); // SSE format
        controller.close(); 
      });
    }
  });

  return new Response(readableStream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache'
    }
  });
}