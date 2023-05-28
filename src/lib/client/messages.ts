import type { ChatCompletionRequestMessageRoleEnum } from 'openai'
import { db, addWithTimestamp } from './firebase'
import { writable } from 'svelte/store';
import { collection, addDoc } from "firebase/firestore";

export interface Message {
  id: string;
  timestamp: Date;
  lessonId: string;
  role: ChatCompletionRequestMessageRoleEnum;
  content: string;
};
export interface MessageWrite {
  lessonId: string;
  role: ChatCompletionRequestMessageRoleEnum;
  content: string;
};

export const messages = writable<Message[]>([]);

export async function addMessage(message: MessageWrite) : Promise<Message> {
  let ref = await addWithTimestamp("messages", message)
  return {
    id: ref.id,
    timestamp: new Date(),
    ...message,
  };
}

