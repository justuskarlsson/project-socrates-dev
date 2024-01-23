import type { ChatCompletionMessageParam } from 'openai/resources/chat/completions'

export interface Chat {
  messages: ChatCompletionMessageParam [];
  model?: string;
}

export type ChatCompletionRequestMessage = ChatCompletionMessageParam;
