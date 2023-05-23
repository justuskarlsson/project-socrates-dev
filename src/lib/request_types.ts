import type {ChatCompletionRequestMessage} from 'openai'


export interface Chat {
  messages: ChatCompletionRequestMessage [];
}

export type { ChatCompletionRequestMessage };

