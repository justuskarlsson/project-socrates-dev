import type {ChatCompletionRequestMessage} from 'openai'


export interface Chat {
  messages: ChatCompletionRequestMessage [];
  model?: string;
}

export type { ChatCompletionRequestMessage };

