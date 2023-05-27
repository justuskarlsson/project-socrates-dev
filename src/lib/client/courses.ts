import type { ChatCompletionRequestMessageRoleEnum } from 'openai'
import { db, collection, getDocs, writable } from './stores'

// Subscribe to the page store to get the current route parameters


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


export async function getCourses() : Promise<Course[]> {
  const courseSnapshot = await getDocs(collection(db, 'courses'));
  const courseList = courseSnapshot.docs.map(doc => ({id: doc.id, ...doc.data()} as Course) );
  return courseList;
}

export const courses = writable<Course[]>([]);

export const selectedCourse = writable<Course>(undefined);
export const selectedLesson = writable<Lesson>(undefined);

export const lessons = writable<Lesson[]>([]);

export async function updateLessons(course: Course){
  const lessonsSnapshot = await getDocs(collection(db, 'courses', course.id, 'lessons'));
  const lessonList = lessonsSnapshot.docs.map(doc => doc.data() as Lesson);
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
