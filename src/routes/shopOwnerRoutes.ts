import { Router } from "express";
import {
  addShopOwner,
  deleteShopOwner,
  updateShopOwner,
  getPaginatedShopOwners,
} from "../services/shopOwnerService";
import { verifyToken, restrictToRoles } from "../middleware/authMiddleware";
import { addShopOwnerSchema } from "../schemas/employeeSchema";
import { handleAddEntity } from "../utils/routeHelpers";

const router = Router();

// Add a shop owner
router.post(
  "/addShopOwner",
  verifyToken,
  restrictToRoles("admin", "employee"),
  async (req, res) => {
    await handleAddEntity(
      req,
      res,
      addShopOwnerSchema,
      addShopOwner,
      "Shop Owner"
    );
  }
);

// Get paginated shop owners
router.get(
  "/shopOwners",
  verifyToken,
  restrictToRoles("admin"),
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

// Update a shop owner
router.put(
  "/shopOwners/:id",
  verifyToken,
  restrictToRoles("admin"),
  async (req, res) => {
    const { id } = req.params;
    const updates = req.body;

    try {
      await updateShopOwner(id, updates);
      res.status(200).send({ message: "Shop Owner updated successfully" });
    } catch (error) {
      res.status(500).send({ message: "Failed to update shop owner" });
    }
  }
);

// Delete a shop owner
router.delete(
  "/shopOwners/:id",
  verifyToken,
  restrictToRoles("admin"),
  async (req, res) => {
    const { id } = req.params;

    try {
      await deleteShopOwner(id);
      res.status(200).send({ message: "Shop Owner deleted successfully" });
    } catch (error) {
      res.status(500).send({ message: "Failed to delete shop owner" });
    }
  }
);

export default router;
