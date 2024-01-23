import type { RequestEvent, RequestHandler } from './$types';
import { openai, model } from "$lib/server/server"
import type * as  Req from '$lib/request_types';
import { json } from '@sveltejs/kit';

async function getEmbeddingDirect(input: string): Promise<number[]> {
  const response = await openai.embeddings.create({
    model: "text-embedding-ada-002",
    input
  });
  return response.data[0].embedding;
}

export async function POST(event: RequestEvent) {
    const body = await event.request.json() as {input: "string"};
    let embedding = await getEmbeddingDirect(body.input);
    return json({
        embedding,
    })
}
