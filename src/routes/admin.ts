import { Router, Request, Response } from "express";
import { createAdmin } from "../services/adminService";
import {
  addEmployee,
  updateEmployee,
  partialUpdateEmployee,
  getPaginatedEmployees,
  deleteEmployee,
} from "../services/employeeService";
import { verifyToken, restrictToRoles } from "../middleware/authMiddleware";
import { addEmployeeSchema } from "../schemas/employeeSchema";
import { ZodError } from "zod";
import logger from "../utils/logger";

const router = Router();

// Create an admin
router.post(
  "/create-admin",
  async (req: Request, res: Response): Promise<void> => {
    const { email, password, name } = req.body;

    if (!email || !password || !name) {
      logger.warn("Missing required fields: email, password, or name.");
      res
        .status(400)
        .send({ message: "Email, password, and name are required" });
      return;
    }

    try {
      const uid = await createAdmin(email, password, name);
      logger.info(`Admin created successfully. UID: ${uid}`);
      res.status(201).send({ message: "Admin created successfully", uid });
    } catch (error) {
      logger.error("Error creating admin:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      res.status(500).send({ message: errorMessage });
    }
  }
);

// Add an employee
router.post(
  "/addEmployee",
  verifyToken,
  restrictToRoles("admin"),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const validatedData = addEmployeeSchema.parse(req.body);
      logger.info("Validated data for adding employee:", validatedData);

      const uid = await addEmployee(validatedData);

      logger.info(`Employee with UID ${uid} added successfully.`);
      res
        .status(201)
        .send({ message: `Employee with UID ${uid} added successfully.`, uid });
    } catch (error) {
      if (error instanceof ZodError) {
        logger.warn("Validation Error:", error.errors);
        res.status(400).send({
          message: "Validation Error",
          errors: error.errors.map((e) => ({
            field: e.path.join("."),
            message: e.message,
          })),
        });
      } else if (error instanceof Error) {
        logger.error("Error adding employee:", error.message);
        res.status(500).send({ message: error.message });
      } else {
        logger.error("Unknown error adding employee.");
        res.status(500).send({ message: "Unknown error occurred" });
      }
    }
  }
);

// Fetch all employees
/**
 * Route to fetch paginated employees.
 * Protected route - requires authentication and admin role.
 */
router.get(
  "/employees",
  verifyToken,
  restrictToRoles("admin"),
  async (req: Request, res: Response): Promise<void> => {
    const page = parseInt(req.query.page as string, 10) || 1;
    const limit = parseInt(req.query.limit as string, 10) || 5;

    try {
      const { employees, totalPages } = await getPaginatedEmployees(
        page,
        limit
      );
      res.status(200).send({ employees, totalPages });
    } catch (error) {
      logger.error("Error fetching paginated employees:", error);
      res.status(500).send({ message: "Failed to fetch paginated employees." });
    }
  }
);

// Update an employee
router.put(
  "/employees/:id",
  async (req: Request, res: Response): Promise<void> => {
    console.log(
      `PUT /employees/${req.params.id} received with body:`,
      req.body
    );
    const { id } = req.params;
    const updates = req.body;

    try {
      await updateEmployee(id, updates);
      res
        .status(200)
        .send({ message: `Employee with ID ${id} updated successfully.` });
    } catch (error) {
      console.error("Error in PUT /employees/:id:", error);
      res.status(500).send({
        message:
          error instanceof Error ? error.message : "Failed to update employee.",
      });
    }
  }
);

// Partially update an employee
router.patch(
  "/employees/:id",
  verifyToken,
  restrictToRoles("admin"),
  async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const updates = req.body;

    try {
      await partialUpdateEmployee(id, updates);
      res.status(200).send({
        message: `Employee with ID ${id} partially updated successfully.`,
      });
    } catch (error) {
      res.status(500).send({ message: "Failed to partially update employee." });
    }
  }
);

// Delete an employee
router.delete(
  "/employees/:id",
  verifyToken,
  restrictToRoles("admin"),
  async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;

    try {
      await deleteEmployee(id);
      res
        .status(200)
        .send({ message: `Employee with ID ${id} deleted successfully.` });
    } catch (error) {
      res.status(500).send({ message: "Failed to delete employee." });
    }
  }
);

export default router;
