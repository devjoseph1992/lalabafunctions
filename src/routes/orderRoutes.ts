import { Router } from "express";
import { verifyToken } from "../middleware/authMiddleware";
import { createOrder, completeOrder } from "../services/orderService";

const router = Router();

// Route to create an order
router.post("/create", verifyToken, async (req, res) => {
  try {
    const orderId = await createOrder(req.body);
    res.status(201).send({ message: "Order created successfully", orderId });
  } catch (error) {
    // Safely handle 'error' of type 'unknown'
    const errorMessage =
      error instanceof Error ? error.message : "An unknown error occurred";
    res.status(400).send({ message: errorMessage });
  }
});

// Route to complete an order
router.post("/complete", verifyToken, async (req, res) => {
  try {
    const { orderId, userId } = req.body;
    await completeOrder(orderId, userId);
    res.status(200).send({ message: "Order completed successfully" });
  } catch (error) {
    // Safely handle 'error' of type 'unknown'
    const errorMessage =
      error instanceof Error ? error.message : "An unknown error occurred";
    res.status(400).send({ message: errorMessage });
  }
});

export default router;
