import User from "../models/User.model";
import Restaurant from "../models/Restaurant.model";
import type { Role } from "../constants/roles";

type UserError = Error & { statusCode?: number };

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

  user.restaurantId = restaurant._id;
  await user.save();

  return {
    id: user._id,
    email: user.email,
    name: user.name,
    role: user.role,
    restaurantId: user.restaurantId,
  };
};
