import { Router } from "express";
import { addShopOwner } from "../services/employeeService";
import { verifyToken } from "../middleware/authMiddleware"; // Middleware to verify tokens

const router = Router();

// Route to add a shop owner
router.post("/addShopOwner", verifyToken, async (req, res) => {
  try {
    const uid = await addShopOwner(req.body); // Call the addShopOwner service
    res.status(201).send({ message: "ShopOwner added successfully", uid });
  } catch (error: any) {
    res.status(400).send({ message: error.message });
  }
});

export default router;
