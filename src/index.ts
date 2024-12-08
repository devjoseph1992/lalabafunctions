// src/index.ts

import { onRequest } from "firebase-functions/v2/https";
import app from "./app";
import { addEmployeeCallable } from "./controllers/employeeController";

// Export the Express app as a Firebase HTTPS function named 'api'
export const api = onRequest({ timeoutSeconds: 300 }, app); // Timeout set to 5 minutes

// Export the callable function
export const addEmployee = addEmployeeCallable;
