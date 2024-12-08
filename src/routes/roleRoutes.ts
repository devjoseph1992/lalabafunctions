import { Router } from "express";
import { verifyToken, restrictToRoles } from "../middleware/authMiddleware";

const router = Router();

// Route restricted to admin only
router.get("/admin-only", verifyToken, restrictToRoles("admin"), (req, res) => {
  res.status(200).send({ message: "Welcome, Admin!" });
});

// Route accessible to both employees and admins
router.get(
  "/employee-or-admin",
  verifyToken,
  restrictToRoles("employee", "admin"),
  (req, res) => {
    res.status(200).send({ message: "Welcome, Employee or Admin!" });
  }
);

export default router;
