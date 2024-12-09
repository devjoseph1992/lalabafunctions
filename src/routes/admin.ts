import { Router } from "express";
import { createAdmin } from "../services/adminService";
import {
  addEmployee,
  updateEmployee,
  getPaginatedEmployees,
  deleteEmployee,
  getEmployeeCount,
} from "../services/employeeService";
import {
  addRider,
  deleteRider,
  updateRider,
  getPaginatedRiders,
  getRiderCount,
} from "../services/riderService";
import {
  addShopOwner,
  deleteShopOwner,
  updateShopOwner,
  getPaginatedShopOwners,
  getShopOwnerCount,
} from "../services/shopOwnerService";
import { verifyToken, restrictToRoles } from "../middleware/authMiddleware";
import {
  addEmployeeSchema,
  addRiderSchema,
  addShopOwnerSchema,
} from "../schemas/employeeSchema";
import { ZodError } from "zod";

const router = Router();

// === Admin Routes ===

// Create an admin
router.post("/create-admin", async (req, res) => {
  const { email, password, name } = req.body;
  if (!email || !password || !name) {
    res.status(400).send({ message: "Email, password, and name are required" });
    return;
  }

  try {
    const uid = await createAdmin(email, password, name);
    res.status(201).send({ message: "Admin created successfully", uid });
  } catch (error) {
    res.status(500).send({
      message:
        error instanceof Error ? error.message : "Unknown error occurred",
    });
  }
});

// === Employee Routes ===
router.post(
  "/addEmployee",
  verifyToken,
  restrictToRoles("admin"),
  async (req, res) => {
    try {
      const validatedData = addEmployeeSchema.parse(req.body);
      const uid = await addEmployee(validatedData);
      res
        .status(201)
        .send({ message: `Employee with UID ${uid} added successfully.`, uid });
    } catch (error) {
      if (error instanceof ZodError) {
        res
          .status(400)
          .send({ message: "Validation Error", errors: error.errors });
      } else {
        res.status(500).send({
          message:
            error instanceof Error ? error.message : "Unknown error occurred",
        });
      }
    }
  }
);

router.get(
  "/employees",
  verifyToken,
  restrictToRoles("admin"),
  async (req, res) => {
    const page = parseInt(req.query.page as string, 10) || 1;
    const limit = parseInt(req.query.limit as string, 10) || 5;
    try {
      const { employees, totalPages } = await getPaginatedEmployees(
        page,
        limit
      );
      res.status(200).send({ employees, totalPages });
    } catch (error) {
      res.status(500).send({ message: "Failed to fetch employees" });
    }
  }
);

router.put(
  "/employees/:id",
  verifyToken,
  restrictToRoles("admin"),
  async (req, res) => {
    try {
      await updateEmployee(req.params.id, req.body);
      res.status(200).send({ message: "Employee updated successfully" });
    } catch (error) {
      res.status(500).send({ message: "Failed to update employee" });
    }
  }
);

router.delete(
  "/employees/:id",
  verifyToken,
  restrictToRoles("admin"),
  async (req, res) => {
    try {
      await deleteEmployee(req.params.id);
      res.status(200).send({ message: "Employee deleted successfully" });
    } catch (error) {
      res.status(500).send({ message: "Failed to delete employee" });
    }
  }
);

// === Rider Routes ===
router.post(
  "/addRider",
  verifyToken,
  restrictToRoles("admin", "employee"),
  async (req, res) => {
    try {
      const validatedData = addRiderSchema.parse(req.body);
      const uid = await addRider(validatedData);
      res
        .status(201)
        .send({ message: `Rider with UID ${uid} added successfully.`, uid });
    } catch (error) {
      if (error instanceof ZodError) {
        res
          .status(400)
          .send({ message: "Validation Error", errors: error.errors });
      } else {
        res.status(500).send({ message: "Failed to add rider" });
      }
    }
  }
);

router.get(
  "/riders",
  verifyToken,
  restrictToRoles("admin", "employee"),
  async (req, res) => {
    const page = parseInt(req.query.page as string, 10) || 1;
    const limit = parseInt(req.query.limit as string, 10) || 5;
    try {
      const { riders, totalPages } = await getPaginatedRiders(page, limit);
      res.status(200).send({ riders, totalPages });
    } catch (error) {
      res.status(500).send({ message: "Failed to fetch riders" });
    }
  }
);

router.put(
  "/riders/:id",
  verifyToken,
  restrictToRoles("admin"),
  async (req, res) => {
    try {
      await updateRider(req.params.id, req.body);
      res.status(200).send({ message: "Rider updated successfully" });
    } catch (error) {
      res.status(500).send({ message: "Failed to update rider" });
    }
  }
);

router.delete(
  "/riders/:id",
  verifyToken,
  restrictToRoles("admin"),
  async (req, res) => {
    try {
      await deleteRider(req.params.id);
      res.status(200).send({ message: "Rider deleted successfully" });
    } catch (error) {
      res.status(500).send({ message: "Failed to delete rider" });
    }
  }
);

// === Shop Owner Routes ===
router.post(
  "/addShopOwner",
  verifyToken,
  restrictToRoles("admin", "employee"),
  async (req, res) => {
    try {
      const validatedData = addShopOwnerSchema.parse(req.body);
      const uid = await addShopOwner(validatedData);
      res.status(201).send({
        message: `Shop Owner with UID ${uid} added successfully.`,
        uid,
      });
    } catch (error) {
      if (error instanceof ZodError) {
        res
          .status(400)
          .send({ message: "Validation Error", errors: error.errors });
      } else {
        res.status(500).send({ message: "Failed to add shop owner" });
      }
    }
  }
);

router.get(
  "/shopOwners",
  verifyToken,
  restrictToRoles("admin", "employee"),
  async (req, res) => {
    const page = parseInt(req.query.page as string, 10) || 1;
    const limit = parseInt(req.query.limit as string, 10) || 5;
    try {
      const { shopOwners, totalPages } = await getPaginatedShopOwners(
        page,
        limit
      );
      res.status(200).send({ shopOwners, totalPages });
    } catch (error) {
      res.status(500).send({ message: "Failed to fetch shop owners" });
    }
  }
);

router.put(
  "/shopOwners/:id",
  verifyToken,
  restrictToRoles("admin"),
  async (req, res) => {
    try {
      await updateShopOwner(req.params.id, req.body);
      res.status(200).send({ message: "Shop Owner updated successfully" });
    } catch (error) {
      res.status(500).send({ message: "Failed to update shop owner" });
    }
  }
);

router.delete(
  "/shopOwners/:id",
  verifyToken,
  restrictToRoles("admin"),
  async (req, res) => {
    try {
      await deleteShopOwner(req.params.id);
      res.status(200).send({ message: "Shop Owner deleted successfully" });
    } catch (error) {
      res.status(500).send({ message: "Failed to delete shop owner" });
    }
  }
);

// === Employee Count Route ===
router.get(
  "/employees/count",
  verifyToken,
  restrictToRoles("admin"),
  async (req, res) => {
    try {
      const count = await getEmployeeCount();
      res.status(200).send({ count });
    } catch (error) {
      res.status(500).send({ message: "Failed to fetch employee count" });
    }
  }
);

// === Rider Count Route ===
router.get(
  "/riders/count",
  verifyToken,
  restrictToRoles("admin", "employee"),
  async (req, res) => {
    try {
      const count = await getRiderCount();
      res.status(200).send({ count });
    } catch (error) {
      res.status(500).send({ message: "Failed to fetch rider count" });
    }
  }
);

// === Shop Owner Count Route ===
router.get(
  "/shopOwners/count",
  verifyToken,
  restrictToRoles("admin", "employee"),
  async (req, res) => {
    try {
      const count = await getShopOwnerCount();
      res.status(200).send({ count });
    } catch (error) {
      res.status(500).send({ message: "Failed to fetch shop owner count" });
    }
  }
);

export default router;
