import admin, { initializeApp, apps } from "firebase-admin";
import { readFileSync, existsSync } from "fs";
import { resolve } from "path";

const secretPath = resolve("secret/project-socrates-firebase-admin-sdk.json");

export let firebaseAdminInitialized = false;

if (existsSync(secretPath)) {
  try {
    const serviceAccount = JSON.parse(readFileSync(secretPath, "utf-8"));
    if (apps.length === 0) {
      initializeApp({
        credential: admin.credential.cert(serviceAccount as any)
      });
    }
    firebaseAdminInitialized = true;
  } catch (e) {
    console.warn("[Firebase Admin] Failed to initialize:", e);
  }
} else {
  console.warn("[Firebase Admin] Secret not found at", secretPath, "— server-side Firestore features disabled.");
}
