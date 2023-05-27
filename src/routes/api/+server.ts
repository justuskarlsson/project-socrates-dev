import { json } from "@sveltejs/kit"
import { openai } from "$lib/server/server"

export async function GET(request) {
  const res = await openai.listModels();
  return json({
    models: res.data
  });
}
