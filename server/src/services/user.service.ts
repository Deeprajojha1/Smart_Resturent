import User from "../models/User.model";
import Restaurant from "../models/Restaurant.model";
import type { Role } from "../constants/roles";

type UserError = Error & { statusCode?: number };

export const getUsers = async (options?: {
  search?: string;
  role?: string;
  restaurantId?: string;
}) => {
  const filter: Record<string, unknown> = {};
  const andConditions: Record<string, unknown>[] = [];

  if (options?.search) {
    andConditions.push({
      $or: [
      { name: { $regex: options.search, $options: "i" } },
      { email: { $regex: options.search, $options: "i" } },
      ],
    });
  }

  if (options?.role && options.role !== "all") {
    filter.role = options.role;
  }

  if (options?.restaurantId && options.restaurantId !== "all") {
    andConditions.push({
      $or: [
        { restaurantId: options.restaurantId },
        { restaurantIds: options.restaurantId },
      ],
    });
  }

  if (andConditions.length) {
    filter.$and = andConditions;
  }

  return User.find(filter)
    .select("name email role restaurantId restaurantIds createdAt")
    .populate("restaurantId", "name location subscriptionPlan isActive")
    .populate("restaurantIds", "name location subscriptionPlan isActive")
    .sort({ createdAt: -1 });
};

export const updateRole = async (userId: string, role: Role) => {
  const user = await User.findById(userId);
  if (!user) {
    const error: UserError = new Error("User not found.");
    error.statusCode = 404;
    throw error;
  }

  user.role = role;
  await user.save();

  return {
    id: user._id,
    email: user.email,
    name: user.name,
    role: user.role,
  };
};

export const assignRestaurant = async (userId: string, restaurantId: string) => {
  const user = await User.findById(userId);
  if (!user) {
    const error: UserError = new Error("User not found.");
    error.statusCode = 404;
    throw error;
  }

  const restaurant = await Restaurant.findById(restaurantId).select("_id");
  if (!restaurant) {
    const error: UserError = new Error("Restaurant not found.");
    error.statusCode = 404;
    throw error;
  }

  const existingRestaurantIds = (user.restaurantIds ?? []).map((item) =>
    String(item)
  );

  if (user.role === "admin") {
    if (!existingRestaurantIds.includes(String(restaurant._id))) {
      user.restaurantIds = [...(user.restaurantIds ?? []), restaurant._id];
    }

    user.restaurantId = restaurant._id;
  } else {
    user.restaurantId = restaurant._id;
    user.restaurantIds = [restaurant._id];
  }

  await user.save();

  return {
    id: user._id,
    email: user.email,
    name: user.name,
    role: user.role,
    restaurantId: user.restaurantId,
    restaurantIds: user.restaurantIds,
  };
};
