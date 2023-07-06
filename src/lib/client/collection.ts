import type { Writable } from 'svelte/store';
import { db, user } from './firebase';
import { getDoc, getDocs, collection, CollectionReference,
        type DocumentData, serverTimestamp, addDoc, query, where,
        QuerySnapshot, doc, updateDoc, DocumentReference, type UpdateData, deleteDoc,
        writeBatch,
        type WhereFilterOp,
        FieldPath,
        setDoc,
        orderBy,
        onSnapshot
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

  async fetchAndListen(store: Writable<T[]>) : Promise<void> {
    const q = query(
      this.collection,
      where("user", "==", user!.uid),
    );
    return new Promise((resolve, reject) => {
      const unsubscribe = onSnapshot(q, (snapshot) => {
        let items = this.mapSnapshot(snapshot);
        store.set(items);
        resolve();
      });
    })
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




  private addHelper(input: T | Partial<T>) {
    let data = input instanceof DataItem ? input : this.factory(input);
    data.user = user!.uid;
    const docRef = doc(this.collection);
    data.id = docRef.id;
    return {
      ref: docRef,
      data: data as T
    };
  }

  private chunkArray<T>(array: T[], chunkSize: number): T[][] {
    let result = [];
    for (let i = 0; i < array.length; i += chunkSize) {
        result.push(array.slice(i, i + chunkSize));
    }
    return result;
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
    const chunks = this.chunkArray(inputs, 500);
    const items: T[] = [];
    const promises: Promise<void>[] = [];
    for (let chunk of chunks) {
        const batch = writeBatch(db);
        for (let inp of chunk) {
            let {ref, data} = this.addHelper(inp);
            items.push(data);
            batch.set(ref, {
                ...data,
                timestamp: serverTimestamp(),
            });
        }
        promises.push(batch.commit());
    }
    await Promise.allSettled(promises);
    return items;
}


  async update(id: string, data: Partial<T>) {
    let ref = doc(this.collection, id) as DocumentReference<T>;
    await updateDoc(ref, data as UpdateData<T>);
  }

  async delete(id: string){
    let ref = doc(this.collection, id) as DocumentReference<T>;
    await deleteDoc(ref);
  }

  async deleteMany<K extends keyof T>(fieldPath: K, opStr: WhereFilterOp, value: T[K]) {
    const q = query(this.collection, 
        where("user", "==", user!.uid),
        where(fieldPath as string | FieldPath, opStr, value),
    );
    const snapshot = await getDocs(q);
    const chunks = this.chunkArray(snapshot.docs, 500);
    const promises: Promise<void>[] = [];
    for (let chunk of chunks) {
        const batch = writeBatch(db);
        chunk.forEach((doc) => {
            batch.delete(doc.ref);
        });
        promises.push(batch.commit());
    }
    await Promise.allSettled(promises);
}
};