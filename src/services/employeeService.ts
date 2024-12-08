import { admin, FieldValue } from "../utils/firebase";
import {
  addRiderSchema,
  addShopOwnerSchema,
  addEmployeeSchema,
} from "../schemas/employeeSchema";
import { z } from "zod";

// Add Employee
export const addEmployee = async (
  data: z.infer<typeof addEmployeeSchema>
): Promise<string> => {
  const validatedData = addEmployeeSchema.parse(data);

  const user = await admin.auth().createUser({
    email: validatedData.email,
    password: validatedData.password,
    displayName: `${validatedData.firstName} ${validatedData.lastName}`,
  });

  await admin.auth().setCustomUserClaims(user.uid, { role: "employee" });

  const employeeData = {
    ...validatedData,
    role: "employee",
    createdAt: FieldValue.serverTimestamp(),
  };

  await admin.firestore().collection("users").doc(user.uid).set(employeeData);

  return user.uid;
};

// Add Rider
export const addRider = async (
  data: z.infer<typeof addRiderSchema>
): Promise<string> => {
  const validatedData = addRiderSchema.parse(data);

  const user = await admin.auth().createUser({
    email: validatedData.email,
    password: validatedData.password,
    displayName: `${validatedData.firstName} ${validatedData.lastName}`,
  });

  await admin.auth().setCustomUserClaims(user.uid, { role: "rider" });

  const riderData = {
    ...validatedData,
    role: "rider",
    createdAt: FieldValue.serverTimestamp(),
  };

  await admin.firestore().collection("users").doc(user.uid).set(riderData);

  return user.uid;
};

// Add Shop Owner
export const addShopOwner = async (
  data: z.infer<typeof addShopOwnerSchema>
): Promise<string> => {
  const validatedData = addShopOwnerSchema.parse(data);

  const user = await admin.auth().createUser({
    email: validatedData.email,
    password: validatedData.password,
    displayName: `${validatedData.firstName} ${validatedData.lastName}`,
  });

  await admin.auth().setCustomUserClaims(user.uid, { role: "shopOwner" });

  const shopOwnerData = {
    ...validatedData,
    role: "shopOwner",
    createdAt: FieldValue.serverTimestamp(),
  };

  await admin.firestore().collection("users").doc(user.uid).set(shopOwnerData);

  return user.uid;
};
