// src/services/testService.ts
import { admin, FieldValue } from "../utils/firebase";

export const testServerTimestamp = async () => {
  try {
    const docRef = await admin.firestore().collection("test").add({
      createdAt: FieldValue.serverTimestamp(),
    });
    console.log("Document created with timestamp:", docRef.id);
  } catch (error) {
    console.error("Error writing document:", error);
  }
};

// Run this function manually if needed:
// testServerTimestamp();
