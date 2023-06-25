import { json } from "@sveltejs/kit"
import { openai } from "$lib/server/server"
import type { RequestEvent } from "./$types";

export async function GET(request: RequestEvent) {
  const res = await openai.listModels();
  return json({
    models: res.data
  });
}
