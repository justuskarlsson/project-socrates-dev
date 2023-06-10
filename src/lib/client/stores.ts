import { writable, type Writable } from 'svelte/store';
import type { Course } from "./courses"
import type { Lesson } from "./lessons"
import type { Message } from "./messages"
import type { Flashcard } from "./flashcards"
import { db, user } from './firebase';
import { getDoc, getDocs, collection, CollectionReference, type DocumentData, serverTimestamp, addDoc, query, where, QuerySnapshot } from 'firebase/firestore';

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
  useTimestamp = true;
  constructor(path: string) {
    this.path = path;
    this.collection = collection(db, path)
  }
  async fetch() : Promise<T[]>{
    let snapshot =  await getDocs(this.collection);
    let items = this.mapSnapshot(snapshot);
    this.store.set(items);
    return items;
  }

  private mapSnapshot(snapshot: QuerySnapshot<DocumentData>) {
    let items = snapshot.docs.map((doc) => {
      let obj = {
        ...doc.data(),
        id: doc.id, 
        timestamp: doc.data().timestamp.toDate()
      } as any;
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



export class Prompt extends DataItem {
  static collection = new Collection<Prompt>("prompts");
  name: string;
  content: string;
  constructor(name: string, content: string) {
    super({name, content});
  }
};

// export const courses = new Collection<Course>("courses");
// // Connected to course
// export const lessons = new Collection<Lesson>("lessons");
// // Connected to course
// export const flashcards = new Collection<Flashcard>("flashcards");
async function test(){
  let selectedCourse = "course-uid-323111"
  await Prompt.collection.add(new Prompt("name", "content"));
  const prompts = await Prompt.collection.fetchWhere(
    "courseId", selectedCourse);
  Prompt.collection.store.set(prompts);
}

export const loaded = writable(false);

export async function loadAll(){
  await Prompt.collection.fetch();
  // ....

  loaded.set(true);
}

interface PageNav {
  course?: string;
  lesson?:string;
}
export async function updateFromURL({course, lesson} : PageNav){
  if (course) {

  }
}
