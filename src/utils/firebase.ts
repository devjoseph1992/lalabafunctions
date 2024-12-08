// src/utils/firebase.ts

import * as admin from "firebase-admin";
import { FieldValue } from "firebase-admin/firestore";
import logger from "./logger"; // Ensure logger is correctly exported

// Initialize Firebase Admin SDK if not already initialized
if (!admin.apps.length) {
  try {
    admin.initializeApp({
      // Uncomment and set your Firebase project credentials if needed
      // credential: admin.credential.applicationDefault(),
      // databaseURL: "https://your-database-name.firebaseio.com",
    });
    logger.info("Firebase Admin initialized successfully.");
  } catch (error) {
    logger.error("Error initializing Firebase Admin:", error);
  }
}

// Connect to Firebase Emulators if in development mode
if (process.env.NODE_ENV === "development") {
  try {
    // Connect Firestore to emulator via environment variable
    // Optionally, remove programmatic settings if using environment variables
    admin.firestore().settings({
      host: "localhost:8080",
      ssl: false,
    });

    // Removed the useEmulator method
    logger.info("Connected to Firebase emulators.");
  } catch (error) {
    logger.error("Error setting up Firebase emulators:", error);
  }
}

// Export the admin instance and FieldValue directly
export { admin, FieldValue };
