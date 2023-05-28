import { db } from './firebase'
import { collection, getDocs, onSnapshot, query, where } from "firebase/firestore";
import type { Message } from './messages';
import { writable } from 'svelte/store';


export interface Lesson {
  id: string;
  name: string;
  description: string;
  messages?: Message[];
};

export const lessons = writable<Lesson[]>([]);
export const selectedLesson = writable<Lesson>(undefined);

export async function getLessonMessages(lesson: Lesson) {
  if (lesson.messages) {
    return lesson.messages;
  }
  let snapshot = await getDocs(query(
    collection(db, "messages"),
    where("lessonId", "==", lesson.id)
  ));
  const messages = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Message));
  lesson.messages = messages;
  return messages;
}