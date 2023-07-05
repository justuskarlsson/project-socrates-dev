import type { Writable } from 'svelte/store';
import { db, user } from './firebase';
import { getDoc, getDocs, collection, CollectionReference,
        type DocumentData, serverTimestamp, addDoc, query, where,
        QuerySnapshot, doc, updateDoc, DocumentReference, type UpdateData, deleteDoc,
        writeBatch,
        type WhereFilterOp,
        FieldPath,
        setDoc
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
    const q = query(this.collection, where("user", "==", user!.uid))
    let snapshot =  await getDocs(q);
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
      // if (!("user" in obj)) {
      //   this.update(doc.id, {user: user!.uid} as Partial<T>);
      // }
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

  addHelper(input: T | Partial<T>) {
    let data = input instanceof DataItem ? input : this.factory(input);
    data.user = user!.uid;
    const docRef = doc(this.collection);
    data.id = docRef.id;
    return {
      ref: docRef,
      data: data as T
    };
  }

  async add(input: T | Partial<T>): Promise<T> {
    let {ref, data} = this.addHelper(input);
    await setDoc(ref, {
      ...data,
      timestamp: serverTimestamp(),
    })
    return data;
  }

  async addMany(inputs: (T | Partial<T>) []) {

    const batch = writeBatch(db);
    let items: T[] = [];
    for (let inp of inputs) {
      let {ref, data} = this.addHelper(inp);
      items.push(data);
      batch.set(ref, {
        ...data,
        timestamp: serverTimestamp(),
      });
    }
    await batch.commit();
    return items;
  }


  async update(id: string, data: Partial<T>) {
    let ref = doc(db, this.path, id) as DocumentReference<T>;
    await updateDoc(ref, data as UpdateData<T>);
  }

  // async delete(){
    
  // }
  async deleteMany<K extends keyof T>(fieldPath: K, opStr: WhereFilterOp, value: T[K]) {
    const q = query(this.collection, 
      where("user", "==", user!.uid),
      where(fieldPath as string | FieldPath, opStr, value),
    );
    const snapshot = await getDocs(q);
    const batch = writeBatch(db);
    snapshot.forEach((doc) => {
      batch.delete(doc.ref);
    })
    return batch.commit();
  }
};