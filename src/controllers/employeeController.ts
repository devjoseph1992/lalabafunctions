// src/controllers/employeeController.ts

import {
  onCall,
  HttpsError,
  CallableRequest,
} from "firebase-functions/v2/https";
import { admin } from "../utils/firebase";
import logger from "../utils/logger";

/**
 * Callable function to add an employee.
 */
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

      // Optionally, verify if the user has admin privileges
      const userRecord = await admin.auth().getUser(request.auth.uid);
      if (!userRecord.customClaims?.admin) {
        throw new HttpsError(
          "permission-denied",
          "Only admins can add employees."
        );
      }

      const {
        email,
        password,
        firstName,
        lastName,
        address,
        phoneNumber,
        sssNumber,
        tinNumber,
        philhealthNumber,
      } = request.data;

      // Validate required fields
      if (
        !email ||
        !password ||
        !firstName ||
        !lastName ||
        !address ||
        !phoneNumber ||
        !sssNumber ||
        !tinNumber ||
        !philhealthNumber
      ) {
        throw new HttpsError("invalid-argument", "Missing required fields.");
      }

      // Create a new user in Firebase Authentication
      const userRecordNew = await admin.auth().createUser({
        email,
        password,
        displayName: `${firstName} ${lastName}`,
      });

      const userId = userRecordNew.uid;

      // Add additional user data to Firestore
      const db = admin.firestore();
      await db.collection("users").doc(userId).set({
        email,
        firstName,
        lastName,
        address,
        phoneNumber,
        sssNumber,
        tinNumber,
        philhealthNumber,
        role: "employee",
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      logger.info("Employee added successfully with UID:", userId);

      return { message: "Employee added successfully", userId };
    } catch (error: any) {
      logger.error("Error in addEmployeeCallable:", error);
      if (error instanceof HttpsError) {
        throw error;
      } else {
        throw new HttpsError("internal", "Failed to add employee.");
      }
    }
  }
);
