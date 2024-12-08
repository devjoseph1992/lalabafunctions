import { admin, FieldValue } from "../utils/firebase";
import { addShopOwnerSchema } from "../schemas/employeeSchema";
import { z } from "zod";
import logger from "../utils/logger";

/**
 * Adds a new shop owner to Firebase Authentication and Firestore.
 * @param data - Shop owner data validated by Zod.
 * @returns The UID of the created shop owner.
 */
export const addShopOwner = async (
  data: z.infer<typeof addShopOwnerSchema>
): Promise<string> => {
  try {
    // Validate data using Zod schema
    const validatedData = addShopOwnerSchema.parse(data);
    logger.info("Validated shop owner data:", validatedData);

    // Create user in Firebase Authentication
    const userRecord = await admin.auth().createUser({
      email: validatedData.email,
      password: validatedData.password,
      displayName: `${validatedData.firstName} ${validatedData.lastName}`,
    });
    logger.info("Shop Owner user created with UID:", userRecord.uid);

    // Set custom claims for the user
    await admin
      .auth()
      .setCustomUserClaims(userRecord.uid, { role: "shopOwner" });
    logger.info("Custom user claims set successfully.");

    // Add user data to Firestore
    await admin
      .firestore()
      .collection("users")
      .doc(userRecord.uid)
      .set({
        ...validatedData,
        role: "shopOwner",
        createdAt: FieldValue.serverTimestamp(),
      });
    logger.info("Shop Owner data added to Firestore for UID:", userRecord.uid);

    return userRecord.uid;
  } catch (error) {
    logger.error("Error adding shop owner:", error);
    throw error;
  }
};

/**
 * Deletes a shop owner from Firestore and Firebase Authentication.
 * @param id - Shop Owner ID.
 */
export const deleteShopOwner = async (id: string): Promise<void> => {
  try {
    const shopOwnerRef = admin.firestore().collection("users").doc(id);
    const shopOwnerDoc = await shopOwnerRef.get();

    if (!shopOwnerDoc.exists) {
      throw new Error(`Shop Owner with ID ${id} not found.`);
    }

    await shopOwnerRef.delete();
    await admin.auth().deleteUser(id);
    logger.info(`Shop Owner with ID ${id} deleted successfully.`);
  } catch (error) {
    logger.error("Error deleting shop owner:", error);
    throw new Error("Failed to delete shop owner.");
  }
};

/**
 * Updates a shop owner in Firestore.
 * @param id - Shop Owner ID.
 * @param updates - Partial updates for the shop owner.
 */
export const updateShopOwner = async (
  id: string,
  updates: Partial<any>
): Promise<void> => {
  try {
    const shopOwnerRef = admin.firestore().collection("users").doc(id);
    const shopOwnerDoc = await shopOwnerRef.get();

    if (!shopOwnerDoc.exists) {
      throw new Error(`Shop Owner with ID ${id} not found.`);
    }

    await shopOwnerRef.update(updates);
    logger.info(`Shop Owner with ID ${id} updated successfully.`);
  } catch (error) {
    logger.error("Error updating shop owner:", error);
    throw new Error("Failed to update shop owner.");
  }
};

/**
 * Fetches paginated shop owners from Firestore.
 * @param page - Page number.
 * @param limit - Number of shop owners per page.
 * @returns Paginated list of shop owners and total pages.
 */
export const getPaginatedShopOwners = async (
  page: number,
  limit: number
): Promise<{ shopOwners: any[]; totalPages: number }> => {
  try {
    const offset = (page - 1) * limit;
    const shopOwnersRef = admin
      .firestore()
      .collection("users")
      .where("role", "==", "shopOwner");

    const snapshot = await shopOwnersRef.offset(offset).limit(limit).get();
    const totalDocs = (await shopOwnersRef.get()).size;
    const totalPages = Math.ceil(totalDocs / limit);

    const shopOwners = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return { shopOwners, totalPages };
  } catch (error) {
    logger.error("Error fetching paginated shop owners:", error);
    throw new Error("Failed to fetch paginated shop owners.");
  }
};

export const getShopOwnerCount = async (): Promise<number> => {
  try {
    const shopOwnersRef = admin
      .firestore()
      .collection("users")
      .where("role", "==", "shopOwner");

    const totalDocs = (await shopOwnersRef.get()).size;
    logger.info(`Total shop owners count: ${totalDocs}`);
    return totalDocs;
  } catch (error) {
    logger.error("Error fetching shop owner count:", error);
    throw new Error("Could not fetch shop owner count.");
  }
};
