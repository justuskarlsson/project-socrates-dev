import type { RequestHandler } from './$types';
import { openai, model } from "$lib/server/server"
import type * as  Req from '$lib/request_types';

export const GET: RequestHandler = async () => {
    return new Response();
};

export async function POST(event) {
    const body = await event.request.json() as Req.Chat;
    openai.createEmbedding({
        input: "",
        model: ""
    })
    return new Response();
}
