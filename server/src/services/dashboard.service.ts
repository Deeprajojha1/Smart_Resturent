import Expense from "../models/Expense.model";
import Inventory from "../models/Inventory.model";
import Order from "../models/Order.model";
import User from "../models/User.model";

type Requester = {
  id: string;
};

type DashboardQuery = {
  startDate?: string;
  endDate?: string;
};

const getRequesterRestaurantId = async (requesterId: string) => {
  const user = await User.findById(requesterId).select("restaurantId");
  return user?.restaurantId ?? null;
};

const getDateRangeFilter = (query?: DashboardQuery) => {
  const createdAt: Record<string, Date> = {};

  if (query?.startDate) {
    const start = new Date(query.startDate);
    if (!Number.isNaN(start.getTime())) {
      createdAt.$gte = start;
    }
  }

  if (query?.endDate) {
    const end = new Date(query.endDate);
    if (!Number.isNaN(end.getTime())) {
      // Make end date inclusive by moving to next day and using $lt.
      end.setDate(end.getDate() + 1);
      createdAt.$lt = end;
    }
  }

  return Object.keys(createdAt).length ? { createdAt } : {};
};

export const getDashboardSummaryService = async (
  requester: Requester,
  query?: DashboardQuery
) => {
  const restaurantId = await getRequesterRestaurantId(requester.id);
  if (!restaurantId) {
    const error = new Error("Restaurant not found for user.");
    (error as Error & { statusCode?: number }).statusCode = 404;
    throw error;
  }

  const dateFilter = getDateRangeFilter(query);

  const [revenueAgg, expenseAgg, totalOrders, lowStockCount] = await Promise.all([
    Order.aggregate([
      { $match: { restaurantId, ...dateFilter } },
      { $group: { _id: null, totalRevenue: { $sum: "$totalAmount" } } },
    ]),
    Expense.aggregate([
      { $match: { restaurantId, ...dateFilter } },
      { $group: { _id: null, totalExpense: { $sum: "$amount" } } },
    ]),
    Order.countDocuments({ restaurantId, ...dateFilter }),
    Inventory.countDocuments({
      restaurantId,
      $expr: { $lte: ["$quantity", "$lowStockThreshold"] },
    }),
  ]);

  const revenue = revenueAgg[0]?.totalRevenue ?? 0;
  const expenses = expenseAgg[0]?.totalExpense ?? 0;

  return {
    revenue,
    expenses,
    profit: revenue - expenses,
    totalOrders,
    lowStockItems: lowStockCount,
  };
};

export const getDashboardAnalyticsService = async (
  requester: Requester,
  query?: DashboardQuery
) => {
  const restaurantId = await getRequesterRestaurantId(requester.id);
  if (!restaurantId) {
    const error = new Error("Restaurant not found for user.");
    (error as Error & { statusCode?: number }).statusCode = 404;
    throw error;
  }

  const dateFilter = getDateRangeFilter(query);

  const [revenueTrend, expenseTrend, topDishes, lowStock] = await Promise.all([
    Order.aggregate([
      { $match: { restaurantId, ...dateFilter } },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
          },
          total: { $sum: "$totalAmount" },
          orders: { $sum: 1 },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
    ]),
    Expense.aggregate([
      { $match: { restaurantId, ...dateFilter } },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
          },
          total: { $sum: "$amount" },
          entries: { $sum: 1 },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
    ]),
    Order.aggregate([
      { $match: { restaurantId, ...dateFilter } },
      { $unwind: "$items" },
      {
        $group: {
          _id: "$items.name",
          totalSold: { $sum: "$items.quantity" },
          revenue: { $sum: { $multiply: ["$items.quantity", "$items.price"] } },
        },
      },
      { $sort: { totalSold: -1 } },
      { $limit: 10 },
    ]),
    Inventory.find({
      restaurantId,
      $expr: { $lte: ["$quantity", "$lowStockThreshold"] },
    })
      .select("itemName quantity unit lowStockThreshold")
      .sort({ quantity: 1 })
      .limit(20),
  ]);

  return {
    revenueTrend,
    expenseTrend,
    topDishes,
    lowStock,
  };
};
