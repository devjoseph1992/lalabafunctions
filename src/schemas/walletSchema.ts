import { z } from "zod";

export const walletSchema = z.object({
  userId: z.string(),
  balance: z.number().nonnegative(), // Balance must be 0 or positive
  transactions: z.array(
    z.object({
      amount: z.number(), // Positive for credits, negative for debits
      type: z.enum(["order_fee", "top_up", "refund", "payout"]), // Allowed transaction types
      description: z.string(), // Description of the transaction
      timestamp: z.any(), // Use `any` to represent Firestore timestamps
    })
  ),
});
