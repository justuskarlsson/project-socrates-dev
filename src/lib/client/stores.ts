
import { get, writable, type Writable } from 'svelte/store';
import { Collection, DataItem } from "./collection"
import type { ChatCompletionRequestMessageRoleEnum } from 'openai';
import { arrayRemove } from 'firebase/firestore';
import { idb, initIdb, storage, user, userStore } from './firebase';
import {
  ref, uploadBytes,
  uploadBytesResumable
} from "firebase/storage";


export class Course extends DataItem {
  name: string;
  static collection = new Collection<Course>("courses", (data: any) => new Course(data));

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

  static collection = new Collection<Lesson>("lessons", (data: any) => new Lesson(data));

};


export class Prompt extends DataItem {
  name: string;
  content: string;
  static collection = new Collection<Prompt>("prompts", (data: any) => new Prompt(data));
  constructor(data: Partial<Prompt>) {
    super();
    Object.assign(this, data);
  }

  contentSlice(maxLength: number = 40) {
    let str = this.content;
    if (str.length > maxLength) {
      return str.slice(0, maxLength) + "...";
    }
    return str;
  }
};

export class Flashcard extends DataItem {
  courseId: string;
  front: string;
  back: string;
  back_extra?: string = "";
  prio: number = 0;
  reviews: Date[] = [new Date()];

  constructor(data: Partial<Flashcard>) {
    super();
    Object.assign(this, data);
  }

  static collection = new Collection<Flashcard>(
    "flashcards", (data: any) => new Flashcard(data), Flashcard.fromFirebase
  );

  static fromFirebase(item: any): any {
    item.reviews = item.reviews.map((d: any) => d.toDate());
    return item;
  }

  static failedDelayMs = 1 * 60 * 1000;

  updateFailed() {
    let next = new Date();
    next.setTime(next.getTime() + Flashcard.failedDelayMs);
    this.reviews[this.reviews.length - 1] = next;
    this.prio = 1;
  }

  updateSuccess() {
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

  updateCollection() {
    let { prio, reviews } = this;
    Flashcard.collection.update(this.id, { prio, reviews });
  }



};

export class MessageGroup extends DataItem {
  // For mind map mostly
  parent: string = "";
  ref_type?: "course" | "lesson" | "map";
  data?: any;

  static collection = new Collection<MessageGroup>("message_groups",
    (data: any) => new MessageGroup(data));

  constructor(data: Partial<MessageGroup>) {
    super();
    Object.assign(this, data);
  }

};


export class Message extends DataItem {
  lessonId: string = "";
  role: ChatCompletionRequestMessageRoleEnum;
  content: string;
  // For mind map

  groupId?: string;

  static collection = new Collection<Message>("messages",
    (data: any) => new Message(data));

  constructor(data: Partial<Message>) {
    super();
    Object.assign(this, data);
  }
};

export class Embedding extends DataItem {
  messageId: string;
  embedding: number[];

  static collection = new Collection<Embedding>("embeddings",
    (data: any) => new Embedding(data));

  constructor(data: Partial<Embedding>) {
    super();
    Object.assign(this, data);
  }
};

export class Resource extends DataItem {
  name: string;
  courseId: string;

  static collection = new Collection<Resource>("resources",
    (data: any) => new Resource(data));

  static all = writable<Resource[]>([]);

  constructor(data: Partial<Resource>) {
    super();
    Object.assign(this, data);
  }

  static async create(courseId: string, file: File) {
    const resource = await Resource.collection.add({
      name: file.name,
      courseId
    })
    const path = `${user!.uid}/${resource.id}`;
    const storageRef = ref(storage, path);
    const buffer = await file.arrayBuffer();
    const localTask = idb.put("files",
      buffer, resource.id);
    const upload = uploadBytesResumable(storageRef, buffer);
    const uploadPromise = new Promise(
      (resolve, reject) => {
        upload.on('state_changed', 
          (snapshot) => {
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            console.log('Upload is ' + progress + '% done');
          }, 
          reject, 
          resolve as ()=>void
        )
      }
    )
    await uploadPromise;
    await localTask;
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

export const allMessageGroups: Writable<MessageGroup[]> = writable([]);
export const allEmbeddings: Writable<Embedding[]> = writable([]);
export const allResources = Resource.all;

export async function loadAll() {
  const promises: Promise<any>[] = [
    Course.collection.fetch(allCourses),
    Lesson.collection.fetch(allLessons),
    Message.collection.fetch(allMessages),
    Embedding.collection.fetch(allEmbeddings),
    MessageGroup.collection.fetch(allMessageGroups),
    Prompt.collection.fetch(allPrompts),
    Flashcard.collection.fetch(allFlashcards),
    Resource.collection.fetch(Resource.all),
    initIdb()
  ];
  await Promise.all(promises);
  loaded.set(true);
}

userStore.subscribe((user) => {
  if (user) {
    loadAll();
  }
})

export async function addMapMessageGroup(x: number, y: number): Promise<MessageGroup> {
  let courseId = get(selectedCourse)?.id;
  if (!courseId) {
    throw Error("addMapMessageGroup: Course id not found");
  }
  let courseGroup = get(allMessageGroups).find((g) => g.ref_type === "course" && g.data === courseId);
  if (!courseGroup) {
    courseGroup = await MessageGroup.collection.add({ ref_type: "course", data: courseId });
  }

  return MessageGroup.collection.add({
    ref_type: "map",
    parent: courseGroup.id,
    data: { x, y }
  })
}


async function addOrFetch(identifier: Partial<MessageGroup>, extra: Partial<MessageGroup> = {}) {
  const andFn = (prev: boolean, cur: boolean) => prev && cur;
  let res = get(allMessageGroups).find(
    (g: any) => Object.entries(identifier).map(([key, val]) => g[key] === val).reduce(andFn, true)
  );
  if (!res) {
    let data = Object.assign(identifier, extra);
    res = await MessageGroup.collection.add(data);
  }
  return res;
}

export async function getMapRoot() {
  let courseId = get(selectedCourse)?.id;
  if (!courseId) {
    return console.error("Course id not found");
  }
  let courseGroup = await addOrFetch({ ref_type: "course", data: courseId });
  return addOrFetch({ ref_type: "map", parent: courseGroup.id }, {
    data: { x: 0, y: 0 }
  });
}

export async function addMapGroup(parent: string, x: number, y: number) {
  return MessageGroup.collection.add({
    parent,
    ref_type: "map",
    data: { x, y }
  })
}

interface PageNav {
  course?: string;
  lesson?: string;
}

export async function updateFromURL({ course, lesson }: PageNav) {
  if (course) {
    const name = Course.fromURL(course);
    const courseObj = get(allCourses).find((c) => c.name === name);
    if (!courseObj) return console.error("Could not find course in url");

    if (courseObj.id !== get(selectedCourse)?.id) {
      selectedCourse.set(courseObj);
      curLessons.set(
        get(allLessons).filter((l) => l.courseId === courseObj.id)
      );
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
