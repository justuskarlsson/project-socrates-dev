import { json } from "@sveltejs/kit"
import { openai } from "$lib/server/server"

export async function GET(request) {
  const res = await openai.listModels();
  return json({
    message: 'GEbbaba',
    abc: res.data.data,
    port: process.env.PORT
  });
}
