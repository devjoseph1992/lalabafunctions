// src/routes/admin.ts

import { Router, Request, Response } from "express";
import { createAdmin } from "../services/adminService";
import { addEmployee } from "../services/employeeService";
import { verifyToken } from "../middleware/authMiddleware"; // Import the middleware

const router = Router();

// Route to create an admin
router.post(
  "/create-admin",
  async (req: Request, res: Response): Promise<void> => {
    const { email, password, name } = req.body;

    if (!email || !password || !name) {
      res
        .status(400)
        .send({ message: "Email, password, and name are required" });
      return;
    }

    try {
      const uid = await createAdmin(email, password, name);
      res.status(201).send({ message: "Admin created successfully", uid });
    } catch (error) {
      if (error instanceof Error) {
        res.status(500).send({ message: error.message });
      } else {
        res.status(500).send({ message: "An unknown error occurred" });
      }
    }
  }
);

// Route to add an employee with authentication
router.post(
  "/addEmployee",
  verifyToken, // Add authentication middleware
  async (req: Request, res: Response): Promise<void> => {
    try {
      // Pass the entire request body to addEmployee
      const uid = await addEmployee(req.body);

      res
        .status(201)
        .send({ message: `Employee with UID ${uid} added successfully.`, uid });
    } catch (error) {
      console.error("Error adding employee:", error);
      res.status(500).send({
        message:
          error instanceof Error ? error.message : "Unknown error occurred",
      });
    }
  }
);

export default router;
