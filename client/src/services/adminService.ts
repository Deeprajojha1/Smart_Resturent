import API from "./api";
import type { DashboardSummary } from "../store/adminSlice";

type ApiResponse<T> = { success: boolean; data: T };

const toNumberString = (value: number | undefined) =>
  typeof value === "number" ? value.toLocaleString() : "0";

export const getDashboardSummary = async (params?: {
  startDate?: string;
  endDate?: string;
}): Promise<DashboardSummary> => {
  const query = new URLSearchParams();
  if (params?.startDate) query.set("startDate", params.startDate);
  if (params?.endDate) query.set("endDate", params.endDate);

  const [analyticsRes, topDishesRes, ordersRes, lowStockRes, onlineOrdersRes] =
    await Promise.all([
      API.get<ApiResponse<Array<{ totalRevenue: number; totalOrders: number; avgOrderValue: number }>>>(
        `/orders/analytics${query.toString() ? `?${query}` : ""}`
      ),
      API.get<ApiResponse<Array<{ _id: string; totalSold: number }>>>(
        "/orders/top-dishes"
      ),
      API.get<ApiResponse<Array<{ _id: string; status: string; totalAmount: number; createdAt: string }>>>(
        `/orders${query.toString() ? `?${query}` : ""}`
      ),
      API.get<ApiResponse<Array<{ itemName: string; quantity: number }>>>(
        "/inventory/low-stock"
      ),
      API.get<ApiResponse<Array<{ _id: string; status: string; totalAmount: number; paymentStatus: string }>>>(
        "/online-orders"
      ),
    ]);

  const analytics = analyticsRes.data.data?.[0];
  const kpis = [
    {
      label: "Revenue",
      value: `₹${toNumberString(analytics?.totalRevenue)}`,
      delta: "+8.4%",
      trend: "up" as const,
    },
    {
      label: "Orders",
      value: toNumberString(analytics?.totalOrders),
      delta: "+3.1%",
      trend: "up" as const,
    },
    {
      label: "Avg Ticket",
      value: `₹${toNumberString(analytics?.avgOrderValue)}`,
      delta: "-1.2%",
      trend: "down" as const,
    },
    {
      label: "Stock Risk",
      value: String(lowStockRes.data.data.length),
      delta: "Needs review",
      trend: "flat" as const,
    },
  ];

  return {
    kpis,
    topDishes: topDishesRes.data.data.map((dish) => ({
      name: dish._id,
      totalSold: dish.totalSold,
    })),
    recentOrders: ordersRes.data.data.slice(0, 5).map((order) => ({
      id: order._id,
      status: order.status,
      totalAmount: order.totalAmount,
      createdAt: order.createdAt,
    })),
    inventoryAlerts: lowStockRes.data.data.map((item) => ({
      itemName: item.itemName,
      quantity: item.quantity,
    })),
    onlineOrders: onlineOrdersRes.data.data.slice(0, 5).map((order) => ({
      id: order._id,
      status: order.status,
      totalAmount: order.totalAmount,
      paymentStatus: order.paymentStatus,
    })),
  };
};
