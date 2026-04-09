import Menu from "../models/Menu.model";
import Restaurant from "../models/Restaurant.model";
import Inventory from "../models/Inventory.model";

export const getPublicRestaurantsService = async (options?: {
  search?: string;
  page?: number;
  limit?: number;
}) => {
  const page = Math.max(1, options?.page ?? 1);
  const limit = Math.min(50, Math.max(1, options?.limit ?? 12));
  const skip = (page - 1) * limit;

  const filter = {
    isActive: true,
    ...(options?.search
      ? { name: { $regex: options.search, $options: "i" } }
      : {}),
  };

  return Restaurant.find(filter)
    .select("name location isActive")
    .skip(skip)
    .limit(limit)
    .sort({ createdAt: -1 });
};

export const getPublicMenuService = async (restaurantId: string) => {
  const menuItems = await Menu.find({ restaurantId, isAvailable: true }).sort({
    category: 1,
    name: 1,
  });

  const menuNames = menuItems.map((item) => item.name);
  const inventoryDocs = await Inventory.find({
    restaurantId,
    itemName: { $in: menuNames },
  });
  const inventoryMap = new Map(
    inventoryDocs.map((doc) => [doc.itemName, doc])
  );

  return menuItems.map((item) => {
    const inventoryItem = inventoryMap.get(item.name);
    const availableQuantity = inventoryItem?.quantity ?? 0;
    return {
      ...item.toObject(),
      availableQuantity,
      inStock: availableQuantity > 0,
    };
  });
};
