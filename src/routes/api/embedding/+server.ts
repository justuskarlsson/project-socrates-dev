import type { RequestEvent, RequestHandler } from './$types';
import { openai, model } from "$lib/server/server"
import type * as  Req from '$lib/request_types';
import { getEmbedding } from '$lib/server/db';
import { json } from '@sveltejs/kit';

export async function POST(event: RequestEvent) {
    const body = await event.request.json() as {input: "string"};
    let embedding = await getEmbedding(body.input);
    return json({
        embedding,
    })
}
