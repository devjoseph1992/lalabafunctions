import { Router } from "express";
import {
  addRider,
  deleteRider,
  updateRider,
  getPaginatedRiders,
} from "../services/riderService";
import { verifyToken, restrictToRoles } from "../middleware/authMiddleware";
import { addRiderSchema } from "../schemas/employeeSchema";
import { handleAddEntity } from "../utils/routeHelpers";

const router = Router();

// Add a rider
router.post(
  "/addRider",
  verifyToken,
  restrictToRoles("admin", "employee"),
  async (req, res) => {
    await handleAddEntity(req, res, addRiderSchema, addRider, "Rider");
  }
);

// Get paginated riders
router.get(
  "/riders",
  verifyToken,
  restrictToRoles("admin"),
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

// Update a rider
router.put(
  "/riders/:id",
  verifyToken,
  restrictToRoles("admin"),
  async (req, res) => {
    const { id } = req.params;
    const updates = req.body;

    try {
      await updateRider(id, updates);
      res.status(200).send({ message: "Rider updated successfully" });
    } catch (error) {
      res.status(500).send({ message: "Failed to update rider" });
    }
  }
);

// Delete a rider
router.delete(
  "/riders/:id",
  verifyToken,
  restrictToRoles("admin"),
  async (req, res) => {
    const { id } = req.params;

    try {
      await deleteRider(id);
      res.status(200).send({ message: "Rider deleted successfully" });
    } catch (error) {
      res.status(500).send({ message: "Failed to delete rider" });
    }
  }
);

export default router;
