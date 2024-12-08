// src/utils/firebase.ts

import * as admin from "firebase-admin";
import { FieldValue } from "firebase-admin/firestore";

// Initialize Firebase Admin SDK if not already initialized
if (!admin.apps.length) {
  admin.initializeApp();
}

// If using in development mode, set up emulator configurations
if (process.env.NODE_ENV === "development") {
  admin.firestore().settings({
    host: "localhost:8080",
    ssl: false,
  });
  process.env.FIREBASE_AUTH_EMULATOR_HOST = "localhost:9099";
}

// Export the admin instance and FieldValue directly
export { admin, FieldValue };
