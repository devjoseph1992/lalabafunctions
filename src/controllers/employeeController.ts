// src/controllers/employeeController.ts

import {
  onCall,
  HttpsError,
  CallableRequest,
} from "firebase-functions/v2/https";
import { admin } from "../utils/firebase";

export const addEmployeeCallable = onCall(
  async (request: CallableRequest<any>) => {
    try {
      // Ensure the user is authenticated
      if (!request.auth) {
        throw new HttpsError(
          "unauthenticated",
          "User must be authenticated to add an employee."
        );
      }

      const {
        firstName,
        lastName,
        email,
        password,
        address,
        phoneNumber,
        sssNumber,
        tinNumber,
        philhealthNumber,
      } = request.data;

      // Validate required fields
      if (!firstName || !lastName || !email || !password) {
        throw new HttpsError("invalid-argument", "Missing required fields.");
      }

      // Create a new user in Firebase Authentication
      const userRecord = await admin.auth().createUser({
        email,
        password,
        displayName: `${firstName} ${lastName}`,
      });

      const userId = userRecord.uid;

      // Add additional user data to Firestore
      const db = admin.firestore();
      await db.collection("users").doc(userId).set({
        firstName,
        lastName,
        email,
        address,
        phoneNumber,
        sssNumber,
        tinNumber,
        philhealthNumber,
        role: "employee",
      });

      return { message: "Employee added successfully", userId };
    } catch (error: any) {
      console.error("Error adding employee:", error);
      if (error instanceof HttpsError) {
        throw error;
      } else {
        throw new HttpsError("internal", "Failed to add employee.");
      }
    }
  }
);
