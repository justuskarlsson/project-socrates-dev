import type { ChatCompletionRequestMessageRoleEnum } from 'openai'
import { db } from './firebase'
import { writable } from 'svelte/store';
import { collection, addDoc } from "firebase/firestore";

export interface Message {
  id?: string;
  lessonId: string;
  role: ChatCompletionRequestMessageRoleEnum;
  content: string;
};

export async function addMessage(message: Message) {
  let ref = await addDoc(collection(db, "messages"), message);
  message.id = ref.id;
  return message;
}

export const messages = writable<Message[]>([]);
