// src/routes/riderRoutes.ts

import { Router, Request, Response } from "express";
import { addRider } from "../services/employeeService";
import { verifyToken, restrictToRoles } from "../middleware/authMiddleware";
import { addRiderSchema } from "../schemas/employeeSchema";
import { ZodError } from "zod";
import logger from "../utils/logger";

const router = Router();

// Route to add a rider with authentication and role restriction
router.post(
  "/addRider",
  verifyToken, // Authenticate the user
  restrictToRoles("admin", "employee"), // Restrict access to admins and employees
  async (req: Request, res: Response): Promise<void> => {
    try {
      // Validate request body using Zod
      const validatedData = addRiderSchema.parse(req.body);
      logger.info("Validated data for adding rider:", validatedData);

      // Pass the validated data to the service layer
      const uid = await addRider(validatedData);

      res
        .status(201)
        .send({ message: `Rider with UID ${uid} added successfully.`, uid });
    } catch (error) {
      if (error instanceof ZodError) {
        // Handle Zod validation errors
        res.status(400).send({
          message: "Validation Error",
          errors: error.errors.map((e) => ({
            field: e.path.join("."),
            message: e.message,
          })),
        });
      } else if (error instanceof Error) {
        logger.error("Error adding rider:", error);
        res.status(500).send({
          message: error.message,
        });
      } else {
        logger.error("Unknown error adding rider:", error);
        res.status(500).send({
          message: "Unknown error occurred",
        });
      }
    }
  }
);

export default router;
