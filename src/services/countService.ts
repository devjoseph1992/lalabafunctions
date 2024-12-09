import { admin } from "../utils/firebase";

/**
 * Get count of employees from the "users" collection where role is "employee".
 * @returns {Promise<number>} The count of employees.
 */
export const getEmployeeCount = async (): Promise<number> => {
  const snapshot = await admin
    .firestore()
    .collection("users")
    .where("role", "==", "employee")
    .get();
  return snapshot.size;
};

/**
 * Get count of riders from the "users" collection where role is "rider".
 * @returns {Promise<number>} The count of riders.
 */
export const getRiderCount = async (): Promise<number> => {
  const snapshot = await admin
    .firestore()
    .collection("users")
    .where("role", "==", "rider")
    .get();
  return snapshot.size;
};

/**
 * Get count of shop owners from the "users" collection where role is "shopOwner".
 * @returns {Promise<number>} The count of shop owners.
 */
export const getShopOwnerCount = async (): Promise<number> => {
  const snapshot = await admin
    .firestore()
    .collection("users")
    .where("role", "==", "shopOwner")
    .get();
  return snapshot.size;
};
