import type { ChatCompletionRequestMessageRoleEnum } from 'openai'
import { db, addWithTimestamp } from './firebase'
import { writable } from 'svelte/store';
import { collection, updateDoc, getDoc, getDocs, doc  } from "firebase/firestore";

export interface Flashcard {
  id: string;
  timestamp: Date;
  courseId: string;
  front: string;
  back: string;
  back_extra: string;
  prio: number;
  reviews: Date[];
};
export interface FlashcardWrite {
  courseId: string;
  front: string;
  back: string;
  back_extra: string;
  prio: number;
  reviews: Date[];
};

export const flashcards = writable<Flashcard[]>([]);

export async function addFlashcard(obj: FlashcardWrite) : 
Promise<Flashcard> {
  obj.reviews = [new Date()];
  obj.prio = 0;
  let ref = await addWithTimestamp("flashcards", obj)
  return {
    id: ref.id,
    timestamp: new Date(),
    ...obj,
  };
}

export async function updateFlashcard(obj: Flashcard){
  let { reviews, prio } = obj;
  let ref = doc(db, "flashcards", obj.id);
  await updateDoc(ref, {reviews, prio});
}

export async function patchFlashcards(){
  const table = collection(db, "flashcards")
  const snapshot = await getDocs(table);
  let cbs: Promise<any>[] = [];
  snapshot.forEach((d) => {
    // cbs.push(
    //   updateDoc(d.ref, {reviews: [d.data().timestamp.toDate()]})
    // );
    cbs.push(
      updateDoc(d.ref, {prio: 0})
    );
  })
  await Promise.all(cbs);
}