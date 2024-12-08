import { z } from "zod";

export const orderSchema = z.object({
  fee: z.number().nonnegative(), // Fee must be non-negative
  description: z.string(), // Order description
  userId: z.string(), // Rider or ShopOwner ID
  status: z.enum(["in_progress", "completed", "canceled"]), // Valid statuses
  createdAt: z.any().optional(), // Firestore timestamp, optional for creation
  completedAt: z.any().optional(), // Firestore timestamp, optional for completion
});
