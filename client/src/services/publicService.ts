import API from "./api";

type ApiResponse<T> = { success: boolean; data: T };

export type PublicRestaurant = {
  _id: string;
  name: string;
  location?: string;
  isActive?: boolean;
};

export type PublicPreparedItem = {
  _id: string;
  menuId?: string;
  inventoryId?: string;
  name: string;
  description?: string;
  price: number;
  category?: string;
  image?: string;
  itemType?: "prepared";
  unit?: string;
  availableQuantity: number;
  inStock: boolean;
  isOrderable?: boolean;
};

export type PublicOrderInput = {
  restaurantId: string;
  customer: {
    name?: string;
    phone?: string;
    email?: string;
  };
  items: Array<{
    menuId: string;
    quantity: number;
  }>;
  address: string;
  paymentMethod?: "cod" | "online";
};

const unwrap = <T>(response: { data: ApiResponse<T> }) => response.data.data;

export const getPublicRestaurants = async () =>
  unwrap(await API.get<ApiResponse<PublicRestaurant[]>>("/public/restaurants"));

export const getPublicPreparedMenu = async (restaurantId: string) =>
  unwrap(
    await API.get<ApiResponse<PublicPreparedItem[]>>(
      `/public/prepared-menu/${restaurantId}`
    )
  );

export const createPublicOrder = async (data: PublicOrderInput) =>
  unwrap(await API.post<ApiResponse<unknown>>("/public/order", data));
