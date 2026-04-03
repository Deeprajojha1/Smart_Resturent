import Expense from "../models/Expense.model";
import User from "../models/User.model";

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
  }).sort({ createdAt: -1 });
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
