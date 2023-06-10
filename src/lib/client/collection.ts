import type { Writable } from 'svelte/store';
import { db, user } from './firebase';
import { getDoc, getDocs, collection, CollectionReference,
        type DocumentData, serverTimestamp, addDoc, query, where,
        QuerySnapshot, doc, updateDoc, DocumentReference, type UpdateData 
      } 
from 'firebase/firestore';

export class DataItem {
  id: string = "";
  timestamp: Date = new Date();
  user: string;
};

export class Collection<T extends DataItem> {
  path: string;
  collection: CollectionReference<DocumentData>;
  factory: (data: any) => T;
  fromFirebase: Function | null;

  constructor(
    path: string, 
    factory: (data: any) => T,
    fromFirebase: Function | null = null 
  ) {
    this.path = path;
    this.collection = collection(db, path);
    this.factory = factory;
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
    let items: T[] = snapshot.docs.map((doc) => {
      let obj = {
        ...doc.data(),
        id: doc.id, 
        timestamp: doc.data().timestamp.toDate()
      };
      if (this.fromFirebase) {
        obj = this.fromFirebase(obj);
      }
      return this.factory(obj);
    });
    items.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
    return items;
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
  async add(input: T | Partial<T>): Promise<T> {
    let doc = input instanceof DataItem ? input : this.factory(input);
    doc.user = user!.uid;
    let res = await addDoc(this.collection, {
      ...doc,
      timestamp: serverTimestamp(),
    });
    doc.id = res.id;
    return doc as T;
  }


  async update(id: string, data: Partial<T>) {
    let ref = doc(db, this.path, id) as DocumentReference<T>;
    await updateDoc(ref, data as UpdateData<T>);
  }
};