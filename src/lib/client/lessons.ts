import { addWithTimestamp, db, getWithTimestamp } from './firebase'
import { collection, getDocs, addDoc, query, where, serverTimestamp } from "firebase/firestore";
import type { Message } from './messages';
import { writable } from 'svelte/store';
import type { Flashcard } from './flashcards';


export interface Lesson {
  id: string;
  timestamp: Date;
  name: string;
  description: string;
  courseId: string;
  messages?: Message[];
};

export interface LessonWrite {
  name: string;
  description: string;
  courseId: string;
};

export const lessons = writable<Lesson[]>([]);
export const selectedLesson = writable<Lesson>(undefined);

export async function getLessonEntity(
  lesson: Lesson,
  entity: "messages") 
{
  if (lesson[entity]) {
    return lesson[entity];
  }
  
  let snapshot = await getDocs(query(
    collection(db, entity),
    where("lessonId", "==", lesson.id)
  ));
  
  const values = await getWithTimestamp(snapshot) as any[];
  lesson[entity] = values;
  return values;
}


export async function getLessonMessages(lesson: Lesson) {
  return getLessonEntity(lesson, "messages") as Promise<Message[]>;
}



export async function addLesson(lesson: LessonWrite){
  return addWithTimestamp("lessons", lesson);
}