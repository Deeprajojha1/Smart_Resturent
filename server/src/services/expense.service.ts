import crypto from "crypto";
import Expense from "../models/Expense.model";
import User from "../models/User.model";
import { getRazorpayClient } from "../config/razorpay.config";

type Requester = {
  id: string;
};

type ExpenseInput = {
  amount: number;
  category:
    | "rent"
    | "salary"
    | "raw_material"
    | "utilities"
    | "maintenance"
    | "other";
  description?: string;
  vendor?: string;
  paymentMethod?: "cash" | "card" | "upi";
  receiptUrl?: string;
};

type ExpenseQuery = {
  startDate?: string;
  endDate?: string;
  category?: string;
  min?: string;
  max?: string;
};

type ExpensePaymentDraft = {
  requesterId: string;
  restaurantId: string;
  razorpayOrderId: string;
  expiresAt: number;
  expense: ExpenseInput;
};

type VerifyExpensePaymentInput = {
  draftId: string;
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
};

const expensePaymentDrafts = new Map<string, ExpensePaymentDraft>();

const cleanExpiredExpenseDrafts = () => {
  const now = Date.now();

  for (const [draftId, draft] of expensePaymentDrafts.entries()) {
    if (draft.expiresAt <= now) {
      expensePaymentDrafts.delete(draftId);
    }
  }
};

const getRequesterRestaurantId = async (requesterId: string) => {
  const user = await User.findById(requesterId).select("restaurantId");
  return user?.restaurantId ?? null;
};

export const addExpenseService = async (
  data: ExpenseInput,
  requester: Requester
) => {
  const restaurantId = await getRequesterRestaurantId(requester.id);
  if (!restaurantId) {
    const error = new Error("Restaurant not found for user.");
    (error as Error & { statusCode?: number }).statusCode = 404;
    throw error;
  }

  return Expense.create({
    ...data,
    restaurantId,
    createdBy: requester.id,
  });
};

export const createExpensePaymentOrderService = async (
  data: ExpenseInput,
  requester: Requester
) => {
  if (data.paymentMethod !== "upi" && data.paymentMethod !== "card") {
    const error = new Error("Online payment is supported only for UPI or card.");
    (error as Error & { statusCode?: number }).statusCode = 400;
    throw error;
  }

  if (!Number.isFinite(data.amount) || data.amount <= 0) {
    const error = new Error("Amount must be greater than zero.");
    (error as Error & { statusCode?: number }).statusCode = 400;
    throw error;
  }

  const restaurantId = await getRequesterRestaurantId(requester.id);
  if (!restaurantId) {
    const error = new Error("Restaurant not found for user.");
    (error as Error & { statusCode?: number }).statusCode = 404;
    throw error;
  }

  cleanExpiredExpenseDrafts();

  const draftId = crypto.randomUUID();
  const amountPaise = Math.round(data.amount * 100);
  const razorpay = getRazorpayClient();
  const order = await razorpay.orders.create({
    amount: amountPaise,
    currency: "INR",
    receipt: `expense_${draftId.slice(0, 20)}`,
  });

  expensePaymentDrafts.set(draftId, {
    requesterId: requester.id,
    restaurantId: String(restaurantId),
    razorpayOrderId: order.id,
    expiresAt: Date.now() + 15 * 60 * 1000,
    expense: {
      amount: data.amount,
      category: data.category,
      description: data.description,
      vendor: data.vendor,
      paymentMethod: data.paymentMethod,
      receiptUrl: data.receiptUrl,
    },
  });

  const razorpayKey = process.env.RAZORPAY_KEY;
  if (!razorpayKey) {
    const error = new Error("RAZORPAY_KEY is not defined in .env");
    (error as Error & { statusCode?: number }).statusCode = 500;
    throw error;
  }

  return {
    draftId,
    razorpayKey,
    orderId: order.id,
    amount: order.amount,
    currency: order.currency,
  };
};

export const verifyExpensePaymentService = async (
  data: VerifyExpensePaymentInput,
  requester: Requester
) => {
  cleanExpiredExpenseDrafts();

  const draft = expensePaymentDrafts.get(data.draftId);
  if (!draft) {
    const error = new Error("Payment session expired. Please try again.");
    (error as Error & { statusCode?: number }).statusCode = 410;
    throw error;
  }

  if (draft.requesterId !== requester.id) {
    const error = new Error("Unauthorized payment session.");
    (error as Error & { statusCode?: number }).statusCode = 403;
    throw error;
  }

  if (draft.razorpayOrderId !== data.razorpay_order_id) {
    const error = new Error("Razorpay order mismatch.");
    (error as Error & { statusCode?: number }).statusCode = 400;
    throw error;
  }

  const secret = process.env.RAZORPAY_SECRET;
  if (!secret) {
    throw new Error("RAZORPAY_SECRET is not defined in .env");
  }

  const body = `${data.razorpay_order_id}|${data.razorpay_payment_id}`;
  const expectedSignature = crypto
    .createHmac("sha256", secret)
    .update(body)
    .digest("hex");

  if (expectedSignature !== data.razorpay_signature) {
    const error = new Error("Payment verification failed.");
    (error as Error & { statusCode?: number }).statusCode = 400;
    throw error;
  }

  const createdExpense = await Expense.create({
    ...draft.expense,
    restaurantId: draft.restaurantId,
    createdBy: requester.id,
    receiptUrl: `razorpay_payment_id:${data.razorpay_payment_id}`,
  });

  expensePaymentDrafts.delete(data.draftId);

  return createdExpense;
};

export const getExpensesService = async (
  requester: Requester,
  query: ExpenseQuery
) => {
  const restaurantId = await getRequesterRestaurantId(requester.id);
  if (!restaurantId) {
    const error = new Error("Restaurant not found for user.");
    (error as Error & { statusCode?: number }).statusCode = 404;
    throw error;
  }

  const amountFilter: Record<string, number> = {};
  if (query.min) {
    amountFilter.$gte = Number(query.min);
  }
  if (query.max) {
    amountFilter.$lte = Number(query.max);
  }

  const start = query.startDate ? new Date(query.startDate) : new Date(0);
  const end = query.endDate ? new Date(query.endDate) : new Date();

  return Expense.find({
    restaurantId,
    ...(query.category ? { category: query.category } : {}),
    ...(Object.keys(amountFilter).length ? { amount: amountFilter } : {}),
    createdAt: { $gte: start, $lte: end },
  })
    .populate("createdBy", "name email role")
    .sort({ createdAt: -1 });
};

export const getExpenseAnalyticsService = async (requester: Requester) => {
  const restaurantId = await getRequesterRestaurantId(requester.id);
  if (!restaurantId) {
    const error = new Error("Restaurant not found for user.");
    (error as Error & { statusCode?: number }).statusCode = 404;
    throw error;
  }

  return Expense.aggregate([
    { $match: { restaurantId } },
    {
      $group: {
        _id: "$category",
        total: { $sum: "$amount" },
        count: { $sum: 1 },
      },
    },
    { $sort: { total: -1 } },
  ]);
};

export const getMonthlyExpenseService = async (requester: Requester) => {
  const restaurantId = await getRequesterRestaurantId(requester.id);
  if (!restaurantId) {
    const error = new Error("Restaurant not found for user.");
    (error as Error & { statusCode?: number }).statusCode = 404;
    throw error;
  }

  return Expense.aggregate([
    { $match: { restaurantId } },
    {
      $group: {
        _id: { month: { $month: "$createdAt" } },
        total: { $sum: "$amount" },
      },
    },
    { $sort: { "_id.month": 1 } },
  ]);
};

export const deleteExpenseService = async (
  id: string,
  requester: Requester
) => {
  const restaurantId = await getRequesterRestaurantId(requester.id);
  if (!restaurantId) {
    const error = new Error("Restaurant not found for user.");
    (error as Error & { statusCode?: number }).statusCode = 404;
    throw error;
  }

  return Expense.findOneAndDelete({ _id: id, restaurantId });
};
