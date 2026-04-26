import API from "./api";

export type AuthUser = {
  id: string;
  email: string;
  name: string;
  picture?: string;
  phoneNumber?: string;
  role?:
    | "customer"
    | "cashier"
    | "manager"
    | "admin"
    | "inventory"
    | "inventory_head"
    | "vendor";
  restaurantId?: string;
};

export type InventoryHeadUser = {
  id: string;
  email: string;
  name: string;
  role: "inventory_head";
  restaurantId?: string;
};

export type AuthResponse = {
  token: string;
  user: AuthUser;
};

const register = async (
  name: string,
  email: string,
  password: string,
  phoneNumber: string,
  role: AuthUser["role"] = "customer"
) => {
  const response = await API.post("/auth/register", {
    name,
    email,
    password,
    phoneNumber,
    role,
  });
  return response.data.data as AuthResponse;
};

const emailLogin = async (email: string, password: string) => {
  const response = await API.post("/auth/login", { email, password });
  return response.data.data as AuthResponse;
};

const googleLogin = async (credential: string) => {
  const response = await API.post("/auth/google", { credential });
  return response.data.data as AuthResponse;
};

const getMe = async () => {
  const response = await API.get("/auth/profile");
  return response.data.data as AuthUser;
};

const getInventoryHead = async () => {
  const response = await API.get("/users/inventory-head/me");
  return response.data.data as InventoryHeadUser | null;
};

const logout = async () => {
  const response = await API.post("/auth/logout");
  return response.data as { success: boolean; data?: { message?: string } };
};

export { register, emailLogin, googleLogin, getMe, getInventoryHead, logout };
