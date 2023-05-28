import { addWithTimestamp, db, getWithTimestamp } from './firebase'
import { collection, getDocs, addDoc, query, where, serverTimestamp } from "firebase/firestore";
import type { Message } from './messages';
import { writable } from 'svelte/store';


export interface Lesson {
  id: string;
  timestamp: Date;
  name: string;
  description: string;
  messages?: Message[];
};

export interface LessonWrite {
  name: string;
  description: string;
  courseId: string;
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
  
  const messages = await getWithTimestamp(snapshot) as Message[];
  lesson.messages = messages;
  return messages;
}

export async function addLesson(lesson: LessonWrite){
  return addWithTimestamp("lessons", lesson);
}