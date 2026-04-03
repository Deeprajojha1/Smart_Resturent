import Order from "../models/Order.model";
import Inventory from "../models/Inventory.model";
import User from "../models/User.model";

type OrderItemInput = {
  name: string;
  quantity: number;
  price: number;
};

type CreateOrderInput = {
  items: OrderItemInput[];
  paymentMethod: "cash" | "card" | "upi";
};

type Requester = {
  id: string;
};

const getRequesterRestaurantId = async (requesterId: string) => {
  const user = await User.findById(requesterId).select("restaurantId");
  return user?.restaurantId ?? null;
};

export const createOrderService = async (
  data: CreateOrderInput,
  requester: Requester
) => {
  const restaurantId = await getRequesterRestaurantId(requester.id);
  if (!restaurantId) {
    const error = new Error("Restaurant not found for user.");
    (error as Error & { statusCode?: number }).statusCode = 404;
    throw error;
  }

  const totalAmount = data.items.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0
  );

  const order = await Order.create({
    restaurantId,
    items: data.items,
    totalAmount,
    paymentMethod: data.paymentMethod,
    status: "completed",
    createdBy: requester.id,
  });

  for (const item of data.items) {
    await Inventory.updateOne(
      { restaurantId, itemName: item.name },
      { $inc: { quantity: -item.quantity } }
    );
  }

  return order;
};

export const getOrdersService = async (
  requester: Requester,
  query: { startDate?: string; endDate?: string }
) => {
  const restaurantId = await getRequesterRestaurantId(requester.id);
  if (!restaurantId) {
    const error = new Error("Restaurant not found for user.");
    (error as Error & { statusCode?: number }).statusCode = 404;
    throw error;
  }

  const start = query.startDate ? new Date(query.startDate) : new Date(0);
  const end = query.endDate ? new Date(query.endDate) : new Date();

  return Order.find({
    restaurantId,
    createdAt: { $gte: start, $lte: end },
  }).sort({ createdAt: -1 });
};

export const getOrderAnalyticsService = async (requester: Requester) => {
  const restaurantId = await getRequesterRestaurantId(requester.id);
  if (!restaurantId) {
    const error = new Error("Restaurant not found for user.");
    (error as Error & { statusCode?: number }).statusCode = 404;
    throw error;
  }

  return Order.aggregate([
    { $match: { restaurantId } },
    {
      $group: {
        _id: "$restaurantId",
        totalRevenue: { $sum: "$totalAmount" },
        totalOrders: { $sum: 1 },
        avgOrderValue: { $avg: "$totalAmount" },
      },
    },
  ]);
};

export const getTopDishesService = async (requester: Requester) => {
  const restaurantId = await getRequesterRestaurantId(requester.id);
  if (!restaurantId) {
    const error = new Error("Restaurant not found for user.");
    (error as Error & { statusCode?: number }).statusCode = 404;
    throw error;
  }

  return Order.aggregate([
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
  ]);
};
