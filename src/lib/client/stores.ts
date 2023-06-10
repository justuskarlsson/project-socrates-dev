import { get, writable, type Writable } from 'svelte/store';
import { db, user } from './firebase';
import { getDoc, getDocs, collection, CollectionReference, type DocumentData, serverTimestamp, addDoc, query, where, QuerySnapshot } from 'firebase/firestore';
import type { ChatCompletionRequestMessageRoleEnum } from 'openai';

class DataItem {
  id: string = "";
  timestamp: Date = new Date();
  user: string;
  constructor(obj: any) {
    Object.assign(this, obj);
  }
};

export class Collection<T extends DataItem> {
  path: string;
  collection: CollectionReference<DocumentData>;
  store: Writable<T[]> = writable([]);
  fromFirebase: Function | null;

  constructor(path: string, fromFirebase: Function | null = null ) {
    this.path = path;
    this.collection = collection(db, path);
    this.fromFirebase = fromFirebase;
  }

  async fetch(store: (Writable<T[]> | null) = null) : Promise<T[]>{
    let snapshot =  await getDocs(this.collection);
    let items = this.mapSnapshot(snapshot);
    if (store) {
      store.set(items);
    }
    return items;
  }

  private mapSnapshot(snapshot: QuerySnapshot<DocumentData>) {
    let items = snapshot.docs.map((doc) => {
      let obj = {
        ...doc.data(),
        id: doc.id, 
        timestamp: doc.data().timestamp.toDate()
      } as any;
      if (this.fromFirebase) {
        return this.fromFirebase(obj);
      }
      return obj;
    });
    return items as T[];
  }

  /**
   * Will not be needed if we always fetch everything initially.
   */
  async fetchWhere(otherKey: string, otherVal: string) : Promise<T[]>{

    let snapshot =  await getDocs(query(
      this.collection,
      where(otherKey, "==", otherVal)
    ));
    return this.mapSnapshot(snapshot);
  }

  async add(doc: T): Promise<T>;
  async add(obj: Partial<T>): Promise<T>;
  async add(input: T | Partial<T>): Promise<T> {
    let doc = input instanceof DataItem ? input : new DataItem(input);
    doc.user = user!.uid;
    let res = await addDoc(this.collection, {
      ...doc,
      timestamp: serverTimestamp(),
    });
    doc.id = res.id;
    return doc as T;
  }
};




export class Course extends DataItem {
  name: string;

  static collection = new Collection<Course>("courses");
  static all: Writable<Course[]> = writable([]);
  static selected: Writable<Course | null> = writable();

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

  static collection = new Collection<Lesson>("lessons");
  static all: Writable<Lesson[]> = writable([]);
  static cur: Writable<Lesson[]> = writable([]);
  static selected: Writable<Lesson | null> = writable();
};


export class Prompt extends DataItem {
  static collection = new Collection<Prompt>("prompts");
  static all: Writable<Prompt[]> = writable([]);

  name: string;
  content: string;
  constructor(name: string, content: string) {
    super({name, content});
  }
};

export class Flashcard extends DataItem {
  courseId: string;
  front: string;
  back: string;
  back_extra: string = "";
  prio: number = 0;
  reviews: Date[] = [new Date()];

  static fromFirebase(item: any){
    item.reviews = item.reviews.map((d: any) => d.toDate());
    return item as Flashcard;
  }

  static collection = new Collection<Flashcard>("flashcards", Flashcard.fromFirebase);
  static all: Writable<Flashcard[]> = writable([]);
};

export class Message extends DataItem {
  lessonId: string;
  role: ChatCompletionRequestMessageRoleEnum;
  content: string;

  static collection = new Collection<Message>("messages");
  static all: Writable<Message[]> = writable([]);
  static cur: Writable<Message[]> = writable([]);
};


export const loaded = writable(false);

export async function loadAll(){
  const promises: Promise<any>[] = [
    Course.collection.fetch(Course.all),
    Lesson.collection.fetch(Lesson.all),
    Message.collection.fetch(Message.all),
    Prompt.collection.fetch(Prompt.all),
    Flashcard.collection.fetch(Flashcard.all)
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
    const courseObj = get(Course.all).find((c) => c.name === name);

    if (!courseObj) return console.warn("Could not find course in url");

    if (courseObj.id !== get(Course.selected)?.id ) {
      Course.selected.set(courseObj);
      Lesson.cur.set(
        get(Lesson.all).filter((l) => l.courseId === courseObj.id)
      );
    }
  }

  if (lesson) {
    const idx = parseInt(lesson);
    const curCourse = get(Course.selected);
    if (!curCourse) {
      return;
    }
    const lessons = get(Lesson.cur);
    if (idx < lessons.length) {
      Lesson.selected.set(lessons[idx]);
    }
  }
}

Lesson.selected.subscribe((lesson) => {
  if (!lesson) return;

  const cur = get(Message.all).filter((m) => m.lessonId === lesson.id)
  Message.cur.set(cur);
})