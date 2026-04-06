import Insight from "../models/Insight.model";
import Inventory from "../models/Inventory.model";
import Payroll from "../models/Payroll.model";
import User from "../models/User.model";

type Requester = {
  id: string;
};

type NotificationItem = {
  type: "warning" | "info" | "profit";
  message: string;
  source: "inventory" | "payroll" | "insights";
  createdAt?: Date;
};

const getRequesterRestaurantId = async (requesterId: string) => {
  const user = await User.findById(requesterId).select("restaurantId");
  return user?.restaurantId ?? null;
};

export const getNotificationsService = async (requester: Requester) => {
  const restaurantId = await getRequesterRestaurantId(requester.id);
  if (!restaurantId) {
    const error = new Error("Restaurant not found for user.");
    (error as Error & { statusCode?: number }).statusCode = 404;
    throw error;
  }

  const [lowStockItems, pendingPayrollCount, insights] = await Promise.all([
    Inventory.find({
      restaurantId,
      $expr: { $lte: ["$quantity", "$lowStockThreshold"] },
    })
      .select("itemName quantity unit")
      .sort({ quantity: 1 })
      .limit(5),
    Payroll.countDocuments({
      restaurantId,
      status: "pending",
    }),
    Insight.find({ restaurantId })
      .select("message type createdAt")
      .sort({ createdAt: -1 })
      .limit(5),
  ]);

  const notifications: NotificationItem[] = [];

  for (const item of lowStockItems) {
    notifications.push({
      type: "warning",
      message: `Low stock: ${item.itemName} (${item.quantity} ${item.unit})`,
      source: "inventory",
    });
  }

  if (pendingPayrollCount > 0) {
    notifications.push({
      type: "info",
      message: `Salary pending for ${pendingPayrollCount} payroll records.`,
      source: "payroll",
    });
  }

  for (const insight of insights) {
    notifications.push({
      type: insight.type,
      message: insight.message,
      source: "insights",
      createdAt: insight.createdAt,
    });
  }

  return notifications;
};
