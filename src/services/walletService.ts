import { walletSchema } from "../schemas/walletSchema";
import { admin, FieldValue } from "../utils/firebase";

export const getWallet = async (userId: string) => {
  const walletRef = admin.firestore().collection("wallets").doc(userId);
  const walletSnapshot = await walletRef.get();

  if (!walletSnapshot.exists) {
    throw new Error("Wallet not found for this user");
  }

  const walletData = walletSnapshot.data();

  // Validate with Zod schema
  const validatedWallet = walletSchema.parse(walletData);

  return validatedWallet;
};

export const updateWalletBalance = async (
  userId: string,
  amount: number,
  type: "order_fee" | "top_up" | "refund" | "payout",
  description: string
) => {
  const walletRef = admin.firestore().collection("wallets").doc(userId);

  await admin.firestore().runTransaction(async (transaction) => {
    const walletDoc = await transaction.get(walletRef);

    if (!walletDoc.exists) {
      throw new Error("Wallet not found for this user");
    }

    const walletData = walletDoc.data();
    const validatedWallet = walletSchema.parse(walletData);

    const currentBalance = validatedWallet.balance;

    if (currentBalance + amount < 0) {
      throw new Error("Insufficient balance");
    }

    transaction.update(walletRef, {
      balance: FieldValue.increment(amount),
      transactions: FieldValue.arrayUnion({
        amount,
        type,
        description,
        timestamp: FieldValue.serverTimestamp(),
      }),
    });
  });
};
