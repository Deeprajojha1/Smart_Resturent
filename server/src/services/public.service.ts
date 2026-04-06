import Menu from "../models/Menu.model";
import Restaurant from "../models/Restaurant.model";

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
  return Menu.find({ restaurantId, isAvailable: true }).sort({ category: 1, name: 1 });
};
