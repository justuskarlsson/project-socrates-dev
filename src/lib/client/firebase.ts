import { writable } from 'svelte/store';

import  { initializeApp,  } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAuth, onAuthStateChanged, type User } from 'firebase/auth'
import { openDB, type IDBPDatabase } from 'idb';

const firebaseConfig = {
  apiKey: "AIzaSyBC7z3ZRT3av1DqpeT7Zqc0KYNbStvPI4A",
  authDomain: "project-socrates-37dd6.firebaseapp.com",
  projectId: "project-socrates-37dd6",
  storageBucket: "project-socrates-37dd6.appspot.com",
  messagingSenderId: "982100452167",
  appId: "1:982100452167:web:8308bd9439ce4b7f60e262",
  measurementId: "G-H518HFTG5R"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);


export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);

export const userStore = writable<User | null>(null);
export let user: User | null = null;
export const loadingAuthState = writable(true);

onAuthStateChanged(auth, (firebaseUser)=> {
  user = firebaseUser;
  userStore.set(firebaseUser);
  loadingAuthState.set(false); 
});

export let idb: IDBPDatabase;
export async function initIdb(){
  idb = await openDB('resources', 1, {
    upgrade(db) {
      db.createObjectStore('files');
    },
  });
};
