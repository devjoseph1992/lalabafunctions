// src/routes/shopOwnerRoutes.ts

import { Router, Request, Response } from "express";
import { addShopOwner } from "../services/employeeService";
import { verifyToken, restrictToRoles } from "../middleware/authMiddleware";
import { addShopOwnerSchema } from "../schemas/employeeSchema";
import { ZodError } from "zod";
import logger from "../utils/logger";

const router = Router();

// Route to add a shop owner with authentication and role restriction
router.post(
  "/addShopOwner",
  verifyToken, // Authenticate the user
  restrictToRoles("admin", "employee"), // Restrict access to admins and employees
  async (req: Request, res: Response): Promise<void> => {
    try {
      // Validate request body using Zod
      const validatedData = addShopOwnerSchema.parse(req.body);
      logger.info("Validated data for adding shop owner:", validatedData);

      // Pass the validated data to the service layer
      const uid = await addShopOwner(validatedData);

      res
        .status(201)
        .send({
          message: `Shop Owner with UID ${uid} added successfully.`,
          uid,
        });
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
        logger.error("Error adding shop owner:", error);
        res.status(500).send({
          message: error.message,
        });
      } else {
        logger.error("Unknown error adding shop owner:", error);
        res.status(500).send({
          message: "Unknown error occurred",
        });
      }
    }
  }
);

export default router;
