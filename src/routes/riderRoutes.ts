import { Router } from "express";
import { addRider } from "../services/employeeService";
import { verifyToken } from "../middleware/authMiddleware"; // Middleware to verify tokens

const router = Router();

// Add a rider
router.post("/addRider", verifyToken, async (req, res) => {
  try {
    const uid = await addRider(req.body); // Pass the request body to addRider
    res.status(201).send({ message: "Rider added successfully", uid });
  } catch (error: any) {
    res.status(400).send({ message: error.message });
  }
});

export default router;
