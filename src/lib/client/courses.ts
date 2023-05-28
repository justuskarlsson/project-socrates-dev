import type { ChatCompletionRequestMessageRoleEnum } from 'openai'
import { db } from './firebase'
import { writable } from 'svelte/store'
import { collection, getDocs  } from "firebase/firestore";
import { type Lesson, lessons } from './lessons';

// Subscribe to the page store to get the current route parameters


export interface Course {
  id: string;
  name: string;
  lessons: Lesson[];
};

export const courses = writable<Course[]>([]);

export const selectedCourse = writable<Course>(undefined);

export async function getCourses() : Promise<Course[]> {
  const courseSnapshot = await getDocs(collection(db, 'courses'));
  const courseList = courseSnapshot.docs.map(doc => ({id: doc.id, ...doc.data()} as Course) );
  return courseList;
}


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
