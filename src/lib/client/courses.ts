import type { ChatCompletionRequestMessageRoleEnum } from 'openai'
import { db, getWithTimestamp } from './firebase'
import { writable } from 'svelte/store'
import { collection, getDocs, query, where  } from "firebase/firestore";
import { type Lesson, lessons } from './lessons';
import type { Flashcard } from './flashcards';
import { createLoadingPromise } from './util';

// Subscribe to the page store to get the current route parameters


export interface Course {
  id: string;
  timestamp: Date;
  name: string;
  lessons?: Lesson[];
  flashcards?: Flashcard[];
};

export interface CourseWrite {
  name: string;
};


export async function getCourseEntity(
  course: Course,
  entity: "lessons" | "flashcards") 
{
  if (course[entity]) {
    return course[entity];
  }
  
  let snapshot = await getDocs(query(
    collection(db, entity),
    where("courseId", "==", course.id)
  ));
  
  const values = await getWithTimestamp(snapshot) as any[];
  course[entity] = values;
  return values;
}



export const courses = writable<Course[]>([]);

export const selectedCourse = writable<Course>(undefined);



export async function getCourseFlashcards(course: Course) {
  let cards = await getCourseEntity(course, "flashcards");
  cards = cards!.map((c) => ({
    ...c,
    reviews: c.reviews.map((v: any) => v.toDate())
  }))
  return cards as Flashcard[];
}


export async function updateLessons(course: Course){
  const snapshot = await getDocs(query(
    collection(db, 'lessons'),
    where("courseId", "==", course.id)
  ));
  const lessonList = await getWithTimestamp(snapshot) as Lesson [];
  lessons.set(lessonList);
  course.lessons = lessonList;
  // GPT-4: HERE I want to notify that we have some lessons loaded
}



async function getCourses() : Promise<Course[]> {
  const courseSnapshot = await getDocs(collection(db, 'courses'));
  const courseList = courseSnapshot.docs.map(doc => ({id: doc.id, ...doc.data()} as Course) );
  courses.set(courseList);
  
  return courseList;
}

const coursesLoaded = createLoadingPromise(getCourses);


export function coursesLoading() : Promise<void> {
  return coursesLoaded;
}

export async function selectCourseFromURL(
  urlName: string, curCourse: Course | undefined,
  courses: Course[]
) {
  const name = urlName.replaceAll('-', ' ');
  const course = courses.find((c) => c.name === name);
  if (!course) {
    console.warn("Course name:", name, "not found");
    return
  }
  // If we got here from /lesson or something
  if (curCourse?.name !== name) {
    selectedCourse.set(course);
    await updateLessons(course);
  }
}
