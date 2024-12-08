// src/services/adminService.ts

import { admin, FieldValue } from "../utils/firebase";
import logger from "../utils/logger";

/**
 * Creates a new admin user in Firebase Authentication and Firestore.
 * @param email - Admin's email address.
 * @param password - Admin's password.
 * @param name - Admin's full name.
 * @returns The UID of the created admin and additional information.
 */
export const createAdmin = async (
  email: string,
  password: string,
  name: string
): Promise<{ uid: string; email: string; role: string }> => {
  try {
    // Validate inputs
    if (!email || !password || !name) {
      throw new Error("Email, password, and name are required.");
    }

    if (!email.includes("@")) {
      throw new Error("Invalid email format.");
    }

    if (password.length < 6) {
      throw new Error("Password must be at least 6 characters long.");
    }

    logger.info("Starting admin creation process...");

    // Create user in Firebase Authentication
    let userRecord;
    try {
      userRecord = await admin.auth().createUser({
        email,
        password,
        displayName: name,
      });
      logger.info("User created successfully:", userRecord.uid);
    } catch (error) {
      logger.error("Error creating user in Firebase Authentication:", error);
      throw new Error("Failed to create user in Firebase Authentication.");
    }

    // Set custom claims for the user
    try {
      await admin.auth().setCustomUserClaims(userRecord.uid, { role: "admin" });
      logger.info("Custom user claims set successfully.");
    } catch (error) {
      logger.error("Error setting custom claims:", error);
      throw new Error("Failed to set custom claims for the user.");
    }

    // Store user data in Firestore
    try {
      const userDoc = admin.firestore().collection("users").doc(userRecord.uid);
      const docSnapshot = await userDoc.get();

      if (docSnapshot.exists) {
        throw new Error(
          `User document with UID ${userRecord.uid} already exists.`
        );
      }

      await userDoc.set({
        email,
        name,
        role: "admin",
        createdAt: FieldValue.serverTimestamp(),
      });
      logger.info("User data written to Firestore successfully.");
    } catch (error) {
      logger.error("Error writing user data to Firestore:", error);
      throw new Error("Failed to write user data to Firestore.");
    }

    return {
      uid: userRecord.uid,
      email: userRecord.email!,
      role: "admin",
    };
  } catch (error) {
    logger.error("Error creating admin:", error);
    throw error;
  }
};
