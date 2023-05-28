import type { ChatCompletionRequestMessageRoleEnum } from 'openai'
import { db, getWithTimestamp } from './firebase'
import { writable } from 'svelte/store'
import { collection, getDocs, query, where  } from "firebase/firestore";
import { type Lesson, lessons } from './lessons';

// Subscribe to the page store to get the current route parameters


export interface Course {
  id: string;
  timestamp: Date;
  name: string;
  lessons?: Lesson[];
};

export interface CourseWrite {
  name: string;
};


export const courses = writable<Course[]>([]);

export const selectedCourse = writable<Course>(undefined);

export async function getCourses() : Promise<Course[]> {
  const courseSnapshot = await getDocs(collection(db, 'courses'));
  const courseList = courseSnapshot.docs.map(doc => ({id: doc.id, ...doc.data()} as Course) );
  return courseList;
}


export async function updateLessons(course: Course){
  const snapshot = await getDocs(query(
    collection(db, 'lessons'),
    where("courseId", "==", course.id)
  ));
  const lessonList = await getWithTimestamp(snapshot) as Lesson [];
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
