import Inventory from "../models/Inventory.model";
import User from "../models/User.model";

type InventoryInput = {
  itemName: string;
  itemType?: "raw" | "prepared";
  quantity: number;
  unit: string;
  lowStockThreshold: number;
};

type InventoryDetailsUpdateInput = {
  itemName: string;
  itemType?: "raw" | "prepared";
  quantity: number;
  unit: string;
  lowStockThreshold: number;
};

type Requester = {
  id: string;
};

const getRequesterRestaurantId = async (requesterId: string) => {
  const user = await User.findById(requesterId).select("restaurantId");
  return user?.restaurantId ?? null;
};

export const addInventoryService = async (
  data: InventoryInput,
  requester: Requester
) => {
  const restaurantId = await getRequesterRestaurantId(requester.id);
  if (!restaurantId) {
    const error = new Error("Restaurant not found for user.");
    (error as Error & { statusCode?: number }).statusCode = 404;
    throw error;
  }

  return Inventory.create({
    ...data,
    restaurantId,
  });
};

export const updateStockService = async (
  id: string,
  quantity: number,
  requester: Requester
) => {
  const restaurantId = await getRequesterRestaurantId(requester.id);
  if (!restaurantId) {
    const error = new Error("Restaurant not found for user.");
    (error as Error & { statusCode?: number }).statusCode = 404;
    throw error;
  }

  const item = await Inventory.findOne({ _id: id, restaurantId });
  if (!item) {
    const error = new Error("Item not found");
    (error as Error & { statusCode?: number }).statusCode = 404;
    throw error;
  }

  item.quantity += quantity;
  await item.save();
  return item;
};

export const updateInventoryItemDetailsService = async (
  id: string,
  data: InventoryDetailsUpdateInput,
  requester: Requester
) => {
  const restaurantId = await getRequesterRestaurantId(requester.id);
  if (!restaurantId) {
    const error = new Error("Restaurant not found for user.");
    (error as Error & { statusCode?: number }).statusCode = 404;
    throw error;
  }

  const item = await Inventory.findOneAndUpdate(
    { _id: id, restaurantId },
    {
      itemName: data.itemName,
      itemType: data.itemType ?? "raw",
      quantity: data.quantity,
      unit: data.unit,
      lowStockThreshold: data.lowStockThreshold,
    },
    { new: true }
  );

  if (!item) {
    const error = new Error("Item not found");
    (error as Error & { statusCode?: number }).statusCode = 404;
    throw error;
  }

  return item;
};

export const deleteInventoryItemService = async (
  id: string,
  requester: Requester
) => {
  const restaurantId = await getRequesterRestaurantId(requester.id);
  if (!restaurantId) {
    const error = new Error("Restaurant not found for user.");
    (error as Error & { statusCode?: number }).statusCode = 404;
    throw error;
  }

  const deleted = await Inventory.findOneAndDelete({ _id: id, restaurantId });

  if (!deleted) {
    const error = new Error("Item not found");
    (error as Error & { statusCode?: number }).statusCode = 404;
    throw error;
  }

  return { message: "Inventory item deleted successfully." };
};

export const getLowStockService = async (requester: Requester) => {
  const restaurantId = await getRequesterRestaurantId(requester.id);
  if (!restaurantId) {
    const error = new Error("Restaurant not found for user.");
    (error as Error & { statusCode?: number }).statusCode = 404;
    throw error;
  }

  return Inventory.find({
    restaurantId,
    $expr: { $lte: ["$quantity", "$lowStockThreshold"] },
  });
};

export const getInventoryItemsService = async (requester: Requester) => {
  const restaurantId = await getRequesterRestaurantId(requester.id);
  if (!restaurantId) {
    const error = new Error("Restaurant not found for user.");
    (error as Error & { statusCode?: number }).statusCode = 404;
    throw error;
  }

  return Inventory.find({ restaurantId }).sort({ itemName: 1, createdAt: -1 });
};

export const getInventoryStatsService = async (requester: Requester) => {
  const restaurantId = await getRequesterRestaurantId(requester.id);
  if (!restaurantId) {
    const error = new Error("Restaurant not found for user.");
    (error as Error & { statusCode?: number }).statusCode = 404;
    throw error;
  }

  return Inventory.aggregate([
    { $match: { restaurantId } },
    {
      $group: {
        _id: null,
        totalItems: { $sum: 1 },
        totalStock: { $sum: "$quantity" },
      },
    },
  ]);
};

export const getReorderSuggestionsService = async (requester: Requester) => {
  const restaurantId = await getRequesterRestaurantId(requester.id);
  if (!restaurantId) {
    const error = new Error("Restaurant not found for user.");
    (error as Error & { statusCode?: number }).statusCode = 404;
    throw error;
  }

  return Inventory.find({
    restaurantId,
    $expr: {
      $lte: ["$quantity", { $multiply: ["$lowStockThreshold", 1.2] }],
    },
  });
};
