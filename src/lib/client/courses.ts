import type { ChatCompletionRequestMessageRoleEnum } from 'openai'
import { db, writable } from './stores'
import { getFirestore, collection, addDoc, getDocs, onSnapshot, query, where  } from "firebase/firestore";

// Subscribe to the page store to get the current route parameters


export interface Message {
  id?: string;
  lessonId: string;
  role: ChatCompletionRequestMessageRoleEnum;
  content: string;
};

export interface Lesson {
  id: string;
  name: string;
  description: string;
  messages?: Message[];
};

export interface Course {
  id: string;
  name: string;
  lessons: Lesson[];

};

export async function addMessage(message: Message) {
  let ref = await addDoc(collection(db, "messages"), message);
  message.id = ref.id;
  return message;
}

export async function getLessonMessages(lesson: Lesson) {
  if (lesson.messages) {
    return lesson.messages;
  }
  let snapshot = await getDocs(query(
    collection(db, "messages"),
    where("lessonId", "==", lesson.id)
  ));
  const messages = snapshot.docs.map(doc => ({id: doc.id, ...doc.data()} as Message) );
  lesson.messages = messages;
  return messages;
}

export async function getCourses() : Promise<Course[]> {
  const courseSnapshot = await getDocs(collection(db, 'courses'));
  const courseList = courseSnapshot.docs.map(doc => ({id: doc.id, ...doc.data()} as Course) );
  return courseList;
}

export const courses = writable<Course[]>([]);
export const messages = writable<Message[]>([]);

export const selectedCourse = writable<Course>(undefined);
export const selectedLesson = writable<Lesson>(undefined);

export const lessons = writable<Lesson[]>([]);

export async function updateLessons(course: Course){
  const lessonsSnapshot = await getDocs(collection(db, 'courses', course.id, 'lessons'));
  const lessonList = lessonsSnapshot.docs.map(doc => ({id: doc.id, ...doc.data()}) as Lesson);
  lessons.set(lessonList);
  course.lessons = lessonList;
}

selectedCourse.subscribe(async (course: Course) => {
  console.log("Selected course:", course);
  if (course && course.lessons === undefined) {
    await updateLessons(course);
  }
})



getCourses().then((_courses) => {
  courses.set(_courses);
  if (_courses.length) {
    selectedCourse.set(_courses[0])
  }
});
