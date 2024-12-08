import { admin, FieldValue } from "../utils/firebase";
import { addEmployeeSchema } from "../schemas/employeeSchema";
import { z } from "zod";
import logger from "../utils/logger";

/**
 * Fetches all employees from Firestore.
 * @returns An array of employees.
 */
export const getEmployees = async (
  page: number = 1,
  limit: number = 5
): Promise<{ employees: any[]; totalPages: number }> => {
  try {
    const employeesRef = admin
      .firestore()
      .collection("users")
      .where("role", "==", "employee");

    // Fetch total number of employees to calculate total pages
    const totalDocs = (await employeesRef.get()).size;
    const totalPages = Math.ceil(totalDocs / limit);

    // Fetch employees for the current page
    const snapshot = await employeesRef
      .offset((page - 1) * limit)
      .limit(limit)
      .get();

    if (snapshot.empty) {
      logger.warn("No employees found.");
      return { employees: [], totalPages };
    }

    const employees: any[] = [];
    snapshot.forEach((doc) => {
      employees.push({ id: doc.id, ...doc.data() });
    });

    logger.info(`Fetched ${employees.length} employees for page ${page}.`);
    return { employees, totalPages };
  } catch (error) {
    logger.error("Error fetching employees:", error);
    throw new Error("Could not fetch employees.");
  }
};

/**
 * Fetches paginated employees from Firestore.
 * @param page - The current page number.
 * @param limit - The number of employees per page.
 * @returns An object containing the employees and the total number of pages.
 */
export const getPaginatedEmployees = async (
  page: number,
  limit: number
): Promise<{ employees: any[]; totalPages: number }> => {
  try {
    const offset = (page - 1) * limit;
    const employeesRef = admin
      .firestore()
      .collection("users")
      .where("role", "==", "employee");

    // Fetch paginated employees
    const snapshot = await employeesRef.offset(offset).limit(limit).get();

    // Get the total number of employees
    const totalDocs = (await employeesRef.get()).size;
    const totalPages = Math.ceil(totalDocs / limit);

    // Map snapshot data to employees array
    const employees = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return { employees, totalPages };
  } catch (error) {
    logger.error("Error fetching paginated employees:", error);
    throw new Error("Failed to fetch paginated employees.");
  }
};

/**
 * Adds a new employee to Firebase Authentication and Firestore.
 * @param data - Employee data validated by Zod.
 * @returns The UID of the created employee.
 */
export const addEmployee = async (
  data: z.infer<typeof addEmployeeSchema>
): Promise<string> => {
  try {
    // Validate data using Zod schema
    const validatedData = addEmployeeSchema.parse(data);
    logger.info("Validated employee data:", validatedData);

    // Create user in Firebase Authentication
    const userRecord = await admin.auth().createUser({
      email: validatedData.email,
      password: validatedData.password,
      displayName: `${validatedData.firstName} ${validatedData.lastName}`,
    });
    logger.info("Employee user created with UID:", userRecord.uid);

    // Set custom claims for the user
    await admin
      .auth()
      .setCustomUserClaims(userRecord.uid, { role: "employee" });
    logger.info("Custom user claims set successfully.");

    // Add user data to Firestore
    await admin
      .firestore()
      .collection("users")
      .doc(userRecord.uid)
      .set({
        ...validatedData,
        role: "employee",
        createdAt: FieldValue.serverTimestamp(),
      });
    logger.info("Employee data added to Firestore for UID:", userRecord.uid);

    return userRecord.uid;
  } catch (error) {
    logger.error("Error adding employee:", error);
    throw error;
  }
};

/**
 * Updates an employee in Firestore.
 * @param id - Employee document ID.
 * @param updates - Partial updates to apply.
 * @returns A promise that resolves when the update is complete.
 */
export const updateEmployee = async (
  id: string,
  updates: Partial<any>
): Promise<void> => {
  try {
    const employeeRef = admin.firestore().collection("users").doc(id);
    const employeeDoc = await employeeRef.get();

    if (!employeeDoc.exists) {
      throw new Error(`Employee with ID ${id} not found.`);
    }

    await employeeRef.update(updates);
    logger.info(`Employee with ID ${id} updated successfully.`);
  } catch (error) {
    logger.error("Error updating employee:", error);
    throw new Error("Failed to update employee.");
  }
};

/**
 * Deletes an employee from Firestore and Firebase Authentication.
 * @param id - Employee ID.
 */
export const deleteEmployee = async (id: string): Promise<void> => {
  try {
    const employeeRef = admin.firestore().collection("users").doc(id);
    const employeeDoc = await employeeRef.get();

    if (!employeeDoc.exists) {
      throw new Error(`Employee with ID ${id} not found.`);
    }

    await employeeRef.delete();
    await admin.auth().deleteUser(id);
    logger.info(`Employee with ID ${id} deleted successfully.`);
  } catch (error) {
    logger.error("Error deleting employee:", error);
    throw new Error("Failed to delete employee.");
  }
};

/**
 * Fetches the total count of employees from Firestore.
 * @returns The total number of employees.
 */
export const getEmployeeCount = async (): Promise<number> => {
  try {
    const employeesRef = admin
      .firestore()
      .collection("users")
      .where("role", "==", "employee");

    // Get total count of employees
    const totalDocs = (await employeesRef.get()).size;

    logger.info(`Total employees count: ${totalDocs}`);
    return totalDocs;
  } catch (error) {
    logger.error("Error fetching employee count:", error);
    throw new Error("Could not fetch employee count.");
  }
};
