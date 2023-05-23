import type { ChatCompletionRequestMessage, ChatCompletionRequestMessageRoleEnum } from 'openai'


export interface Message {
  role: ChatCompletionRequestMessageRoleEnum;
  content: string;
};

export interface Lesson {
  name: string;
  description: string;

};

export interface Course {
  name: string;
  lessons: Lesson[];

};