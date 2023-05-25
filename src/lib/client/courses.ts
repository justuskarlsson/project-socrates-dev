import type { ChatCompletionRequestMessageRoleEnum } from 'openai'
import { db, collection, getDocs, writable } from './stores'
import type { DocumentData, DocumentReference } from 'firebase/firestore';

export interface Message {
  role: ChatCompletionRequestMessageRoleEnum;
  content: string;
};

export interface Lesson {
  name: string;
  description: string;

};

export interface Course {
  id: string;
  name: string;
  lessons: Lesson[];

};


async function getCourses() : Promise<Course[]> {
  const courseSnapshot = await getDocs(collection(db, 'courses'));
  const courseList = courseSnapshot.docs.map(doc => ({id: doc.id, ...doc.data()} as Course) );
  return courseList;
}

export const courses = writable<Course[]>([]);

export const selectedCourse = writable<Course>(undefined);


selectedCourse.subscribe(async (course: Course) => {
  console.log("Selected course:");
  console.log(course);
  if (course && course.lessons === undefined) {
    const lessonsSnapshot = await getDocs(collection(db, 'courses', course.id, 'lessons'));
    const lessonList = lessonsSnapshot.docs.map(doc => doc.data() as Lesson);
    course.lessons = lessonList;
    selectedCourse.set(course);
  }
})

getCourses().then((_courses) => {
  console.log(_courses);
  courses.set(_courses);
  if (_courses.length) {
    selectedCourse.set(_courses[0])
  }
});
