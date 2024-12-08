import { admin, FieldValue } from "../utils/firebase";
import { addRiderSchema } from "../schemas/employeeSchema";
import { z } from "zod";
import logger from "../utils/logger";

/**
 * Adds a new rider to Firebase Authentication and Firestore.
 * @param data - Rider data validated by Zod.
 * @returns The UID of the created rider.
 */
export const addRider = async (
  data: z.infer<typeof addRiderSchema>
): Promise<string> => {
  try {
    // Validate data using Zod schema
    const validatedData = addRiderSchema.parse(data);
    logger.info("Validated rider data:", validatedData);

    // Create user in Firebase Authentication
    const userRecord = await admin.auth().createUser({
      email: validatedData.email,
      password: validatedData.password,
      displayName: `${validatedData.firstName} ${validatedData.lastName}`,
    });
    logger.info("Rider user created with UID:", userRecord.uid);

    // Set custom claims for the user
    await admin.auth().setCustomUserClaims(userRecord.uid, { role: "rider" });
    logger.info("Custom user claims set successfully.");

    // Add user data to Firestore
    await admin
      .firestore()
      .collection("users")
      .doc(userRecord.uid)
      .set({
        ...validatedData,
        role: "rider",
        createdAt: FieldValue.serverTimestamp(),
      });
    logger.info("Rider data added to Firestore for UID:", userRecord.uid);

    return userRecord.uid;
  } catch (error) {
    logger.error("Error adding rider:", error);
    throw error;
  }
};

/**
 * Deletes a rider from Firestore and Firebase Authentication.
 * @param id - Rider ID.
 */
export const deleteRider = async (id: string): Promise<void> => {
  try {
    const riderRef = admin.firestore().collection("users").doc(id);
    const riderDoc = await riderRef.get();

    if (!riderDoc.exists) {
      throw new Error(`Rider with ID ${id} not found.`);
    }

    await riderRef.delete();
    await admin.auth().deleteUser(id);
    logger.info(`Rider with ID ${id} deleted successfully.`);
  } catch (error) {
    logger.error("Error deleting rider:", error);
    throw new Error("Failed to delete rider.");
  }
};

/**
 * Updates a rider in Firestore.
 * @param id - Rider ID.
 * @param updates - Partial updates for the rider.
 */
export const updateRider = async (
  id: string,
  updates: Partial<any>
): Promise<void> => {
  try {
    const riderRef = admin.firestore().collection("users").doc(id);
    const riderDoc = await riderRef.get();

    if (!riderDoc.exists) {
      throw new Error(`Rider with ID ${id} not found.`);
    }

    await riderRef.update(updates);
    logger.info(`Rider with ID ${id} updated successfully.`);
  } catch (error) {
    logger.error("Error updating rider:", error);
    throw new Error("Failed to update rider.");
  }
};

/**
 * Fetches paginated riders from Firestore.
 * @param page - Page number.
 * @param limit - Number of riders per page.
 * @returns Paginated list of riders and total pages.
 */
export const getPaginatedRiders = async (
  page: number,
  limit: number
): Promise<{ riders: any[]; totalPages: number }> => {
  try {
    const offset = (page - 1) * limit;
    const ridersRef = admin
      .firestore()
      .collection("users")
      .where("role", "==", "rider");

    const snapshot = await ridersRef.offset(offset).limit(limit).get();
    const totalDocs = (await ridersRef.get()).size;
    const totalPages = Math.ceil(totalDocs / limit);

    const riders = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

    return { riders, totalPages };
  } catch (error) {
    logger.error("Error fetching paginated riders:", error);
    throw new Error("Failed to fetch paginated riders.");
  }
};

export const getRiderCount = async (): Promise<number> => {
  try {
    const ridersRef = admin
      .firestore()
      .collection("users")
      .where("role", "==", "rider");

    const totalDocs = (await ridersRef.get()).size;
    logger.info(`Total riders count: ${totalDocs}`);
    return totalDocs;
  } catch (error) {
    logger.error("Error fetching rider count:", error);
    throw new Error("Could not fetch rider count.");
  }
};
