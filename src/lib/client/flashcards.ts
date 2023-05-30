import type { ChatCompletionRequestMessageRoleEnum } from 'openai'
import { db, addWithTimestamp } from './firebase'
import { writable } from 'svelte/store';
import { collection, addDoc } from "firebase/firestore";

export interface Flashcard {
  id: string;
  timestamp: Date;
  courseId: string;
  front: string;
  back: string;
  back_extra: string;
  reviews: Date[];
};
export interface FlashcardWrite {
  courseId: string;
  front: string;
  back: string;
  back_extra: string;
  reviews: Date[];
};

export const flashcards = writable<Flashcard[]>([]);

export async function addFlashcard(obj: FlashcardWrite) : 
Promise<Flashcard> {
  obj.reviews = [];
  let ref = await addWithTimestamp("flashcards", obj)
  return {
    id: ref.id,
    timestamp: new Date(),
    ...obj,
  };
}

