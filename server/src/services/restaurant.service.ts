import Restaurant from "../models/Restaurant.model";
import User from "../models/User.model";

export type RestaurantInput = {
  name: string;
  location?: string;
  subscriptionPlan?: "free" | "pro" | "enterprise";
  isActive?: boolean;
};

export const createRestaurantService = async (
  data: RestaurantInput,
  ownerId: string
) => {
  const restaurant = await Restaurant.create({
    ...data,
    owner: ownerId,
  });

  const owner = await User.findById(ownerId).select("restaurantId restaurantIds");

  if (owner) {
    const nextRestaurantIds = [...(owner.restaurantIds ?? [])];
    const alreadyAssigned = nextRestaurantIds.some(
      (item) => String(item) === String(restaurant._id)
    );

    if (!alreadyAssigned) {
      nextRestaurantIds.push(restaurant._id);
    }

    owner.restaurantId = restaurant._id;
    owner.restaurantIds = nextRestaurantIds;
    await owner.save();
  }

  return restaurant;
};

export const getAllRestaurantsService = async (options?: {
  search?: string;
  page?: number;
  limit?: number;
}) => {
  const page = Math.max(1, options?.page ?? 1);
  const limit = Math.min(50, Math.max(1, options?.limit ?? 10));
  const skip = (page - 1) * limit;

  const filter = options?.search
    ? { name: { $regex: options.search, $options: "i" } }
    : {};

  return Restaurant.find(filter)
    .populate("owner", "name email")
    .skip(skip)
    .limit(limit)
    .sort({ createdAt: -1 });
};

export const getMyRestaurantService = async (userId: string) => {
  const user = await User.findById(userId).select("restaurantId");

  if (user?.restaurantId) {
    return Restaurant.findById(user.restaurantId);
  }

  return null;
};

export const getMyRestaurantByIdService = async (
  userId: string,
  restaurantId: string,
  role: string
) => {
  if (role === "admin") {
    return Restaurant.findById(restaurantId);
  }

  const user = await User.findById(userId).select("restaurantId");
  if (!user?.restaurantId) {
    return null;
  }

  if (String(user.restaurantId) !== String(restaurantId)) {
    const error = new Error("Not allowed");
    (error as Error & { statusCode?: number }).statusCode = 403;
    throw error;
  }

  return Restaurant.findById(restaurantId);
};

export const updateRestaurantService = async (
  id: string,
  data: Partial<RestaurantInput>,
  requester: { id: string; role: string }
) => {
  const restaurant = await Restaurant.findById(id);
  if (!restaurant) {
    return null;
  }

  if (requester.role !== "admin" && requester.role !== "manager") {
    const error = new Error("Not allowed");
    (error as Error & { statusCode?: number }).statusCode = 403;
    throw error;
  }

  if (
    requester.role !== "admin" &&
    restaurant.owner.toString() !== requester.id
  ) {
    const error = new Error("Not allowed");
    (error as Error & { statusCode?: number }).statusCode = 403;
    throw error;
  }

  restaurant.set(data);
  await restaurant.save();

  return restaurant;
};

export const deleteRestaurantService = async (
  id: string,
  requester: { id: string; role: string }
) => {
  const restaurant = await Restaurant.findById(id);
  if (!restaurant) {
    return null;
  }

  if (
    requester.role !== "admin" &&
    restaurant.owner.toString() !== requester.id
  ) {
    const error = new Error("Not allowed");
    (error as Error & { statusCode?: number }).statusCode = 403;
    throw error;
  }

  await Restaurant.findByIdAndDelete(id);

  return true;
};
