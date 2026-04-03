import Order from "../models/Order.model";
import Expense from "../models/Expense.model";
import Inventory from "../models/Inventory.model";
import Insight from "../models/Insight.model";
import User from "../models/User.model";
import { generateAiInsights, type InsightPayload } from "../ai/insights.engine";

type Requester = {
  id: string;
};

const getRequesterRestaurantId = async (requesterId: string) => {
  const user = await User.findById(requesterId).select("restaurantId");
  return user?.restaurantId ?? null;
};

export const generateInsightsService = async (requester: Requester) => {
  const restaurantId = await getRequesterRestaurantId(requester.id);
  if (!restaurantId) {
    const error = new Error("Restaurant not found for user.");
    (error as Error & { statusCode?: number }).statusCode = 404;
    throw error;
  }

  const [revenueAgg, expenseAgg, topDishes, lowStockItems] = await Promise.all([
    Order.aggregate([
      { $match: { restaurantId } },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: "$totalAmount" },
          totalOrders: { $sum: 1 },
          avgOrderValue: { $avg: "$totalAmount" },
        },
      },
    ]),
    Expense.aggregate([
      { $match: { restaurantId } },
      {
        $group: {
          _id: null,
          totalExpense: { $sum: "$amount" },
        },
      },
    ]),
    Order.aggregate([
      { $match: { restaurantId } },
      { $unwind: "$items" },
      {
        $group: {
          _id: "$items.name",
          totalSold: { $sum: "$items.quantity" },
        },
      },
      { $sort: { totalSold: -1 } },
      { $limit: 5 },
    ]),
    Inventory.find({
      restaurantId,
      $expr: { $lte: ["$quantity", "$lowStockThreshold"] },
    }).select("itemName quantity unit lowStockThreshold"),
  ]);

  const revenue = revenueAgg[0] ?? {
    totalRevenue: 0,
    totalOrders: 0,
    avgOrderValue: 0,
  };
  const expenses = expenseAgg[0] ?? { totalExpense: 0 };

  const insights: InsightPayload[] = await generateAiInsights({
    revenue,
    expenses,
    topDishes,
    lowStockItems,
  });

  await Insight.deleteMany({ restaurantId });

  const saved = await Insight.insertMany(
    insights.map((insight) => ({
      ...insight,
      restaurantId,
    }))
  );

  return saved;
};

export const getInsightsService = async (requester: Requester) => {
  const restaurantId = await getRequesterRestaurantId(requester.id);
  if (!restaurantId) {
    const error = new Error("Restaurant not found for user.");
    (error as Error & { statusCode?: number }).statusCode = 404;
    throw error;
  }

  return Insight.find({ restaurantId }).sort({ createdAt: -1 });
};
