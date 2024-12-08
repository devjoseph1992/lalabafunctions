import { Router } from "express";
import { verifyToken } from "../middleware/authMiddleware";
import { getWallet, updateWalletBalance } from "../services/walletService";

const router = Router();

router.get("/wallet", verifyToken, async (req, res): Promise<void> => {
  try {
    if (!req.user) {
      res
        .status(401)
        .send({ message: "Unauthorized: Missing user information" });
      return; // Ensure function ends here
    }

    const wallet = await getWallet(req.user.uid);
    res.status(200).send(wallet);
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "An unknown error occurred";
    res.status(400).send({ message: errorMessage });
  }
});

router.post("/wallet/top-up", verifyToken, async (req, res): Promise<void> => {
  try {
    if (!req.user) {
      res
        .status(401)
        .send({ message: "Unauthorized: Missing user information" });
      return; // Ensure function ends here
    }

    const { amount, description } = req.body;
    await updateWalletBalance(req.user.uid, amount, "top_up", description);
    res.status(200).send({ message: "Wallet topped up successfully" });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "An unknown error occurred";
    res.status(400).send({ message: errorMessage });
  }
});

export default router;
