import { orderSchema } from "../schemas/orderSchema";
import { admin, FieldValue } from "../utils/firebase";
import { getWallet, updateWalletBalance } from "./walletService";

export const createOrder = async (orderData: any) => {
  // Validate order data with Zod schema
  const validatedOrder = orderSchema.parse(orderData);

  const wallet = await getWallet(validatedOrder.userId);

  if (wallet.balance < validatedOrder.fee) {
    throw new Error("Insufficient balance to accept this order");
  }

  const orderRef = admin.firestore().collection("orders").doc();
  await orderRef.set({
    ...validatedOrder,
    status: "in_progress",
    createdAt: FieldValue.serverTimestamp(),
  });

  return orderRef.id;
};

export const completeOrder = async (orderId: string, userId: string) => {
  const orderRef = admin.firestore().collection("orders").doc(orderId);

  const orderDoc = await orderRef.get();
  if (!orderDoc.exists) {
    throw new Error("Order not found");
  }

  const orderData = orderDoc.data();
  const validatedOrder = orderSchema.parse(orderData);

  if (validatedOrder.status !== "in_progress") {
    throw new Error("Only in-progress orders can be completed");
  }

  await orderRef.update({
    status: "completed",
    completedAt: FieldValue.serverTimestamp(),
  });

  await updateWalletBalance(
    userId,
    -validatedOrder.fee,
    "order_fee",
    `Fee for order #${orderId}`
  );
};
