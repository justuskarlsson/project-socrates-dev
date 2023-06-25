// // Need to fix so only called once (even on hot reload)
import admin, { initializeApp, apps } from "firebase-admin";

import serviceAccount from "../../../secret/project-socrates-firebase-admin-sdk.json";

if (apps.length === 0) {
  initializeApp({
    credential: admin.credential.cert(serviceAccount as any)
  });
}
