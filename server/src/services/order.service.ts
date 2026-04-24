import Order from "../models/Order.model";
import Inventory from "../models/Inventory.model";
import User from "../models/User.model";
import { raiseInventoryRequestsFromShortages } from "./inventoryRequest.service";

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

  const itemNames = Array.from(new Set(data.items.map((item) => item.name)));
  const inventoryItems = await Inventory.find({
    restaurantId,
    itemName: { $in: itemNames },
  }).select("itemName quantity");

  const inventoryMap = new Map(
    inventoryItems.map((item) => [item.itemName, item.quantity])
  );

  const shortages = data.items
    .map((item) => {
      const available = inventoryMap.get(item.name) ?? 0;
      return {
        itemName: item.name,
        requiredQty: item.quantity,
        availableQty: available,
      };
    })
    .filter((item) => item.availableQty < item.requiredQty);

  if (shortages.length) {
    await raiseInventoryRequestsFromShortages(shortages, requester);

    const shortageText = shortages
      .map(
        (shortage) =>
          `${shortage.itemName} (required: ${shortage.requiredQty}, available: ${shortage.availableQty})`
      )
      .join(", ");

    const error = new Error(
      `Insufficient stock for ${shortageText}. Inventory request has been raised for inventory head.`
    );
    (error as Error & { statusCode?: number }).statusCode = 409;
    throw error;
  }

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

  if (query.endDate) {
    end.setDate(end.getDate() + 1);
  }

  return Order.find({
    restaurantId,
    createdAt: { $gte: start, $lt: end },
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
