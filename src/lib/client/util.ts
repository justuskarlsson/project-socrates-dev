import type * as Req from '$lib/request_types'
import { Message } from './stores';

export const SYS_MESSAGE_TEACHER: Req.ChatCompletionRequestMessage = {
  role: "system",
  content: "You are a teacher. You should be factual but also pedagogic. If the student strays away from the topic of the lesson, you will try to steer him/her back. Don't be too long-winded in your responses. Format your answers in Markdown to better convey your meaning."
};

export const SYS_MESSAGE_HERMAN: Req.ChatCompletionRequestMessage = {
  role: "system",
  content: "You are a teacher from germany. Your accent shows in the way you spell words. You are concise and can come across as rude. Your name is Herman."
};

export function createLoadingPromise(loader: () => Promise<any>) {
  const resolver: { resolve?: () => void } = {};
  
  const loadingPromise = new Promise<void>((resolve) => {
    resolver.resolve = resolve;
  });

  loader().then(() => {
    resolver.resolve!();
  });

  return loadingPromise;
}


export function updateArrayItem(values: any[], item: any) {
  return [
    ...values.filter(f => f.id !== item.id),
    item
  ];
}

export async function* MessageStream(body: Req.Chat){
  const response = await fetch("/api/chat", {
    method: "POST",
    headers: {
    'Content-Type': 'text/event-stream'
    },
    body: JSON.stringify(body)
  });
  let answer = new Message({
    role: "assistant",
    content: "",
  });

  const reader = response.body!.pipeThrough(new TextDecoderStream()).getReader();
  while (true) {
    const {value, done} = await reader.read();
    if (done) break;
    const chunks = value.split("data: ");
    for (let i = 1; i < chunks.length; i++) {
      if (chunks[i].startsWith("[DONE]")) {
        break;
      }
      const data = JSON.parse(chunks[i]);
      const delta = data.choices[0].delta;
      if ("content" in delta) {
        yield delta.content as string;
      }
    }
  }
}