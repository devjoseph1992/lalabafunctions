import { admin, FieldValue } from "../utils/firebase";

export const createAdmin = async (
  email: string,
  password: string,
  name: string
) => {
  try {
    console.log("Starting admin creation process...");

    // Create user in Firebase Auth
    const user = await admin
      .auth()
      .createUser({ email, password, displayName: name });
    console.log("User created successfully:", user.uid);

    // Set custom claims for the user
    await admin.auth().setCustomUserClaims(user.uid, { admin: true });
    console.log("Custom user claims set successfully.");

    // Log the FieldValue for debugging
    console.log("FieldValue:", FieldValue);

    // Store user data in Firestore with a server timestamp
    await admin.firestore().collection("users").doc(user.uid).set({
      email,
      name,
      role: "admin",
      createdAt: FieldValue.serverTimestamp(), // Correct usage of FieldValue
    });
    console.log("User data written to Firestore successfully.");

    return user.uid;
  } catch (error) {
    console.error("Error creating admin:", error);
    throw error;
  }
};
