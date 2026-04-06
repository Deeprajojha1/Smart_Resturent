import Menu from "../models/Menu.model";
import User from "../models/User.model";

export type MenuInput = {
  name: string;
  description?: string;
  price: number;
  category?: string;
  isAvailable?: boolean;
  image?: string;
};

type Requester = {
  id: string;
};

const getRequesterRestaurantId = async (requesterId: string) => {
  const user = await User.findById(requesterId).select("restaurantId");
  return user?.restaurantId ?? null;
};

export const createMenuItemService = async (
  data: MenuInput,
  requester: Requester
) => {
  const restaurantId = await getRequesterRestaurantId(requester.id);
  if (!restaurantId) {
    const error = new Error("Restaurant not found for user.");
    (error as Error & { statusCode?: number }).statusCode = 404;
    throw error;
  }

  return Menu.create({
    ...data,
    restaurantId,
  });
};

export const getMenuItemsService = async (requester: Requester) => {
  const restaurantId = await getRequesterRestaurantId(requester.id);
  if (!restaurantId) {
    const error = new Error("Restaurant not found for user.");
    (error as Error & { statusCode?: number }).statusCode = 404;
    throw error;
  }

  return Menu.find({ restaurantId }).sort({ createdAt: -1 });
};

export const updateMenuItemService = async (
  id: string,
  data: Partial<MenuInput>,
  requester: Requester
) => {
  const restaurantId = await getRequesterRestaurantId(requester.id);
  if (!restaurantId) {
    const error = new Error("Restaurant not found for user.");
    (error as Error & { statusCode?: number }).statusCode = 404;
    throw error;
  }

  return Menu.findOneAndUpdate(
    { _id: id, restaurantId },
    { $set: data },
    { new: true }
  );
};

export const deleteMenuItemService = async (
  id: string,
  requester: Requester
) => {
  const restaurantId = await getRequesterRestaurantId(requester.id);
  if (!restaurantId) {
    const error = new Error("Restaurant not found for user.");
    (error as Error & { statusCode?: number }).statusCode = 404;
    throw error;
  }

  return Menu.findOneAndDelete({ _id: id, restaurantId });
};
