
import { get, writable, type Writable } from 'svelte/store';
import { Collection, DataItem } from "./collection"
import type { ChatCompletionRequestMessageRoleEnum } from 'openai';

export class Course extends DataItem {
  name: string;
  static collection = new Collection<Course>("courses", (data: any)=> new Course(data));
  
  constructor(data: Partial<Course>) {
    super();
    Object.assign(this, data);
  }

  toURL() {
    return this.name.replaceAll(" ", "-");
  }

  static fromURL(url: string) {
    return url.replaceAll("-", " ");
  }
};


export class Lesson extends DataItem {
  name: string;
  description: string;
  courseId: string;

  constructor(data: Partial<Lesson>) {
    super();
    Object.assign(this, data);
  }

  static collection = new Collection<Lesson>("lessons", (data: any)=> new Lesson(data));

};


export class Prompt extends DataItem {
  static collection = new Collection<Prompt>("prompts", (data: any)=> new Prompt(data));
  constructor(data: Partial<Prompt>) {
    super();
    Object.assign(this, data);
  }
  name: string;
  content: string;
};

export class Flashcard extends DataItem {
  courseId: string;
  front: string;
  back: string;
  back_extra: string = "";
  prio: number = 0;
  reviews: Date[] = [new Date()];

  constructor(data: Partial<Flashcard>) {
    super();
    Object.assign(this, data);
  }

  static collection = new Collection<Flashcard>(
    "flashcards", (data: any)=> new Flashcard(data), Flashcard.fromFirebase
  );

  static fromFirebase(item: any) : any{
    item.reviews = item.reviews.map((d: any) => d.toDate());
    return item;
  }

  static failedDelayMs = 1 * 60 * 1000;

  updateFailed(){
    let next = new Date();
    next.setTime(next.getTime() + Flashcard.failedDelayMs);
    this.reviews[this.reviews.length - 1] = next;
    this.prio = 1;
  }

  updateSuccess(){
    let next = new Date();
    let level = this.reviews.length;
    if (level === 1) {
      next.setDate(next.getDate() + 1);
    }
    else if (level === 2) {
      next.setDate(next.getDate() + 7);
    }
    else if (level === 3) {
      next.setMonth(next.getMonth() + 1);
    }
    else if (level === 4) {
      next.setMonth(next.getMonth() + 3);
    }
    else {
      next.setFullYear(next.getFullYear() + 1);
    }
    this.reviews.push(next);
    this.prio = 0;
  }

  updateCollection(){
    let {prio, reviews} = this;
    Flashcard.collection.update(this.id, {prio, reviews});
  }



};

export class Message extends DataItem {
  lessonId: string;
  role: ChatCompletionRequestMessageRoleEnum;
  content: string;

  static collection = new Collection<Message>("messages", (data: any) => new Message(data));

  constructor(data: Partial<Message>) {
    super();
    Object.assign(this, data);
  }

};


export const loaded = writable(false);
export const allCourses: Writable<Course[]> = writable([]);
export const selectedCourse: Writable<Course | null> = writable();

export const allLessons: Writable<Lesson[]> = writable([]);
export const curLessons: Writable<Lesson[]> = writable([]);
export const selectedLesson: Writable<Lesson | null> = writable();

export const allPrompts: Writable<Prompt[]> = writable([]);

export const allFlashcards: Writable<Flashcard[]> = writable([]);
export const curFlashcards: Writable<Flashcard[]> = writable([]);

export const allMessages: Writable<Message[]> = writable([]);
export const curMessages: Writable<Message[]> = writable([]);

export async function loadAll(){
  const promises: Promise<any>[] = [
    Course.collection.fetch(allCourses),
    Lesson.collection.fetch(allLessons),
    Message.collection.fetch(allMessages),
    Prompt.collection.fetch(allPrompts),
    Flashcard.collection.fetch(allFlashcards)
  ];

  await Promise.all(promises);
  loaded.set(true);
}

interface PageNav {
  course?: string;
  lesson?: string;
}

export async function updateFromURL({course, lesson} : PageNav){
  if (course) {
    const name = Course.fromURL(course);
    const courseObj = get(allCourses).find((c) => c.name === name);
    if (!courseObj) return console.error("Could not find course in url");

    if (courseObj.id !== get(selectedCourse)?.id ) {
      selectedCourse.set(courseObj);
      curLessons.set(
        get(allLessons).filter((l) => l.courseId === courseObj.id)
      );
      console.log(get(allFlashcards));
      curFlashcards.set(
        get(allFlashcards).filter((f) => f.courseId === courseObj.id)
      );
    }
  }

  if (lesson) {
    const idx = parseInt(lesson);
    const curCourse = get(selectedCourse);
    if (!curCourse) {
      return;
    }
    const lessons = get(curLessons);
    if (idx < lessons.length) {
      selectedLesson.set(lessons[idx]);
    }
  }
}

selectedLesson.subscribe((lesson) => {
  if (!lesson) return;

  const cur = get(allMessages).filter((m) => m.lessonId === lesson.id)
  curMessages.set(cur);
})

export function push<T>(store: Writable<T[]>, ...items: T[]) {
  store.update((arr) => {
    arr.push(...items);
    return arr;
  })
}
