import API from "./api";
import type { DashboardSummary } from "../store/adminSlice";

type ApiResponse<T> = { success: boolean; data: T };

export type AdminQuery = Record<
  string,
  string | number | boolean | undefined | null
>;

export type Restaurant = {
  _id: string;
  name: string;
  location?: string;
  subscriptionPlan?: "free" | "pro" | "enterprise";
  isActive?: boolean;
  owner?: { name?: string; email?: string };
  createdAt?: string;
};

export type RestaurantInput = {
  name: string;
  location?: string;
  subscriptionPlan?: "free" | "pro" | "enterprise";
  isActive?: boolean;
};

export type AdminUser = {
  _id?: string;
  id?: string;
  name: string;
  email: string;
  role: "cashier" | "manager" | "admin" | "inventory" | "vendor";
  restaurantId?: Restaurant | string;
  restaurantIds?: Array<Restaurant | string>;
  createdAt?: string;
};

export type MenuItem = {
  _id: string;
  name: string;
  description?: string;
  price: number;
  category?: string;
  isAvailable?: boolean;
  image?: string;
};

export type OrderItem = {
  name: string;
  quantity: number;
  price: number;
};

export type PosOrder = {
  _id: string;
  items?: OrderItem[];
  totalAmount: number;
  paymentMethod?: "cash" | "card" | "upi";
  status: "pending" | "completed";
  createdAt?: string;
};

export type OnlineOrder = {
  _id: string;
  customerId?: { name?: string; phone?: string; email?: string };
  items?: OrderItem[];
  totalAmount: number;
  address?: string;
  paymentMethod?: "cod" | "online";
  paymentStatus?: "pending" | "paid" | "failed";
  status: "pending" | "confirmed" | "preparing" | "delivered" | "cancelled";
  createdAt?: string;
};

export type InventoryItem = {
  _id: string;
  itemName: string;
  quantity: number;
  unit?: string;
  lowStockThreshold?: number;
};

export type Employee = {
  _id: string;
  userId?: { name?: string; email?: string; role?: string };
  role: string;
  salary: number;
  joiningDate?: string;
  isActive?: boolean;
};

export type EmployeeCreateInput = {
  userId: string;
  role: "cashier" | "manager" | "admin" | "inventory" | "vendor";
  salary: number;
  joiningDate: string;
  isActive?: boolean;
};

export type EmployeeUpdateInput = Partial<{
  role: "cashier" | "manager" | "admin" | "inventory" | "vendor";
  salary: number;
  joiningDate: string;
  isActive: boolean;
}>;

export type Expense = {
  _id: string;
  amount: number;
  category: string;
  description?: string;
  vendor?: string;
  paymentMethod?: string;
  createdBy?: {
    _id?: string;
    name?: string;
    email?: string;
    role?: "cashier" | "manager" | "admin" | "inventory" | "vendor";
  };
  createdAt?: string;
};

export type ExpenseInput = {
  amount: number;
  category: "rent" | "salary" | "raw_material" | "utilities" | "maintenance" | "other";
  description?: string;
  vendor?: string;
  paymentMethod?: "cash" | "card" | "upi";
};

export type OnlineExpenseInput = Omit<ExpenseInput, "paymentMethod"> & {
  paymentMethod: "card" | "upi";
};

export type ExpensePaymentOrder = {
  draftId: string;
  razorpayKey: string;
  orderId: string;
  amount: number;
  currency: string;
};

export type ExpensePaymentVerificationInput = {
  draftId: string;
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
};

export type Payroll = {
  _id: string;
  employeeId?: {
    userId?: { name?: string; email?: string };
    role?: string;
    salary?: number;
  };
  amount: number;
  month: number;
  year: number;
  status: "pending" | "paid";
  paymentMethod?: string;
  paidAt?: string;
};

export type Insight = {
  _id?: string;
  type: "warning" | "info" | "profit";
  title?: string;
  message: string;
  createdAt?: string;
};

export type Notification = {
  type: "warning" | "info" | "profit";
  message: string;
  source: "inventory" | "payroll" | "insights";
  createdAt?: string;
};

export type OrderAnalytics = {
  totalRevenue?: number;
  totalOrders?: number;
  avgOrderValue?: number;
};

export type DashboardApiSummary = {
  revenue: number;
  expenses: number;
  profit: number;
  totalOrders: number;
  lowStockItems: number;
};

export type DashboardAnalytics = {
  revenueTrend: Array<{
    _id: { year: number; month: number };
    total: number;
    orders: number;
  }>;
  expenseTrend: Array<{
    _id: { year: number; month: number };
    total: number;
    entries: number;
  }>;
  topDishes: Array<{ _id: string; totalSold: number; revenue?: number }>;
  lowStock: InventoryItem[];
};

export type ExpenseAnalytics = Array<{ _id: string; total: number; count: number }>;
export type MonthlyExpense = Array<{ _id: { month: number }; total: number }>;
export type InventoryStats = Array<{ totalItems: number; totalStock: number }>;
export type PayrollAnalytics = {
  byMonth: Array<{
    _id: { year: number; month: number };
    total: number;
    count: number;
  }>;
  perEmployee: Array<{ _id: string; total: number; count: number }>;
};

export type MonthlyPayrollGenerationResult = {
  month: number;
  year: number;
  created: number;
  skipped: number;
};

export type PayrollPaymentOrder = {
  draftId: string;
  razorpayKey: string;
  orderId: string;
  amount: number;
  currency: string;
};

export type PayrollPaymentVerificationInput = {
  draftId: string;
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
};

const unwrap = <T>(response: { data: ApiResponse<T> }) => response.data.data;

const buildQuery = (params?: AdminQuery) => {
  const query = new URLSearchParams();

  Object.entries(params ?? {}).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      query.set(key, String(value));
    }
  });

  const queryString = query.toString();
  return queryString ? `?${queryString}` : "";
};

const formatCurrency = (value?: number) =>
  `₹${(value ?? 0).toLocaleString("en-IN")}`;

const formatNumber = (value?: number) => (value ?? 0).toLocaleString("en-IN");

export const getDashboardApiSummary = async () =>
  unwrap(await API.get<ApiResponse<DashboardApiSummary>>("/dashboard/summary"));

export const getDashboardAnalytics = async () =>
  unwrap(await API.get<ApiResponse<DashboardAnalytics>>("/dashboard/analytics"));

export const getDashboardSummary = async (params?: {
  startDate?: string;
  endDate?: string;
}): Promise<DashboardSummary> => {
  const [
    summary,
    analytics,
    orders,
    onlineOrders,
    insights,
    notifications,
  ] = await Promise.all([
    getDashboardApiSummary(),
    getDashboardAnalytics(),
    getOrders(params),
    getOnlineOrders(params),
    getInsights(),
    getNotifications(),
  ]);

  const monthlyRevenue = analytics.revenueTrend.at(-1)?.total ?? summary.revenue;
  const monthlyExpenses =
    analytics.expenseTrend.at(-1)?.total ?? summary.expenses;

  return {
    kpis: [
      {
        label: "Revenue",
        value: formatCurrency(summary.revenue),
        delta: "Live total",
        trend: "up",
      },
      {
        label: "Orders",
        value: formatNumber(summary.totalOrders),
        delta: `${orders.length} recent`,
        trend: "flat",
      },
      {
        label: "Profit",
        value: formatCurrency(summary.profit),
        delta: summary.profit >= 0 ? "Positive" : "Loss",
        trend: summary.profit >= 0 ? "up" : "down",
      },
      {
        label: "Stock Risk",
        value: formatNumber(summary.lowStockItems),
        delta: "Needs review",
        trend: summary.lowStockItems ? "down" : "flat",
      },
    ],
    revenueTrend: analytics.revenueTrend,
    expenseTrend: analytics.expenseTrend,
    monthlyRevenue,
    monthlyExpenses,
    topDishes: analytics.topDishes.map((dish) => ({
      name: dish._id,
      totalSold: dish.totalSold,
    })),
    recentOrders: orders.slice(0, 5).map((order) => ({
      id: order._id,
      status: order.status,
      totalAmount: order.totalAmount,
      createdAt: order.createdAt ?? "",
    })),
    inventoryAlerts: analytics.lowStock.map((item) => ({
      itemName: item.itemName,
      quantity: item.quantity,
      unit: item.unit,
      lowStockThreshold: item.lowStockThreshold,
    })),
    onlineOrders: onlineOrders.slice(0, 5).map((order) => ({
      id: order._id,
      customerName: order.customerId?.name,
      status: order.status,
      totalAmount: order.totalAmount,
      paymentStatus: order.paymentStatus ?? "pending",
    })),
    insights: insights.slice(0, 3),
    notifications: notifications.slice(0, 5),
  };
};

export const getRestaurants = async (params?: AdminQuery) =>
  unwrap(
    await API.get<ApiResponse<Restaurant[]>>(`/restaurants${buildQuery(params)}`)
  );

export const createRestaurant = async (data: RestaurantInput) =>
  unwrap(await API.post<ApiResponse<Restaurant>>("/restaurants", data));

export const updateRestaurant = async (
  id: string,
  data: Partial<RestaurantInput>
) => unwrap(await API.patch<ApiResponse<Restaurant>>(`/restaurants/${id}`, data));

export const getMyRestaurant = async () =>
  unwrap(await API.get<ApiResponse<Restaurant | null>>("/restaurants/me"));

export const getUsers = async (params?: AdminQuery) =>
  unwrap(await API.get<ApiResponse<AdminUser[]>>(`/users${buildQuery(params)}`));

export const updateUserRole = async (
  id: string,
  role: AdminUser["role"]
) =>
  unwrap(
    await API.patch<ApiResponse<AdminUser>>(`/users/${id}/role`, { role })
  );

export const assignRestaurantToUser = async (
  userId: string,
  restaurantId: string
) =>
  unwrap(
    await API.patch<ApiResponse<AdminUser>>(`/users/${userId}/restaurant`, {
      restaurantId,
    })
  );

export const getMenuItems = async () =>
  unwrap(await API.get<ApiResponse<MenuItem[]>>("/menu"));

export const getOrders = async (params?: AdminQuery) =>
  unwrap(await API.get<ApiResponse<PosOrder[]>>(`/orders${buildQuery(params)}`));

export const getOrderAnalytics = async () =>
  unwrap(await API.get<ApiResponse<OrderAnalytics[]>>("/orders/analytics"));

export const getTopDishes = async () =>
  unwrap(
    await API.get<ApiResponse<Array<{ _id: string; totalSold: number }>>>(
      "/orders/top-dishes"
    )
  );

export const getOnlineOrders = async (params?: AdminQuery) =>
  unwrap(
    await API.get<ApiResponse<OnlineOrder[]>>(
      `/online-orders${buildQuery(params)}`
    )
  );

export const updateOnlineOrderStatus = async (
  id: string,
  status: OnlineOrder["status"]
) =>
  unwrap(
    await API.patch<ApiResponse<OnlineOrder>>(`/online-orders/${id}`, {
      status,
    })
  );

export const getLowStock = async () =>
  unwrap(await API.get<ApiResponse<InventoryItem[]>>("/inventory/low-stock"));

export const getInventoryStats = async () =>
  unwrap(await API.get<ApiResponse<InventoryStats>>("/inventory/stats"));

export const getReorderSuggestions = async () =>
  unwrap(await API.get<ApiResponse<InventoryItem[]>>("/inventory/reorder"));

export const getEmployees = async () =>
  unwrap(await API.get<ApiResponse<Employee[]>>("/employees"));

export const createEmployee = async (data: EmployeeCreateInput) =>
  unwrap(await API.post<ApiResponse<Employee>>("/employees", data));

export const updateEmployee = async (id: string, data: EmployeeUpdateInput) =>
  unwrap(await API.patch<ApiResponse<Employee>>(`/employees/${id}`, data));

export const getExpenses = async (params?: AdminQuery) =>
  unwrap(
    await API.get<ApiResponse<Expense[]>>(`/expenses${buildQuery(params)}`)
  );

export const createExpense = async (data: ExpenseInput) =>
  unwrap(await API.post<ApiResponse<Expense>>("/expenses", data));

export const createExpensePaymentOrder = async (data: OnlineExpenseInput) =>
  unwrap(await API.post<ApiResponse<ExpensePaymentOrder>>("/expenses/payment-order", data));

export const verifyExpensePayment = async (
  data: ExpensePaymentVerificationInput
) => unwrap(await API.post<ApiResponse<Expense>>("/expenses/verify-payment", data));

export const getExpenseAnalytics = async () =>
  unwrap(await API.get<ApiResponse<ExpenseAnalytics>>("/expenses/analytics"));

export const getMonthlyExpenses = async () =>
  unwrap(await API.get<ApiResponse<MonthlyExpense>>("/expenses/monthly"));

export const getPayrolls = async (params?: AdminQuery) =>
  unwrap(
    await API.get<ApiResponse<Payroll[]>>(`/payroll${buildQuery(params)}`)
  );

export const getPayrollAnalytics = async () =>
  unwrap(await API.get<ApiResponse<PayrollAnalytics>>("/payroll/analytics"));

export const generateMonthlyPayroll = async () =>
  unwrap(
    await API.post<ApiResponse<MonthlyPayrollGenerationResult>>(
      "/payroll/generate-monthly"
    )
  );

export const payPayroll = async (
  payrollId: string,
  paymentMethod: "cash" | "card" | "upi"
) =>
  unwrap(
    await API.post<ApiResponse<Payroll>>(`/payroll/pay/${payrollId}`, {
      paymentMethod,
    })
  );

export const createPayrollPaymentOrder = async (
  payrollId: string,
  paymentMethod: "card" | "upi"
) =>
  unwrap(
    await API.post<ApiResponse<PayrollPaymentOrder>>(
      `/payroll/pay/${payrollId}/payment-order`,
      { paymentMethod }
    )
  );

export const verifyPayrollPayment = async (
  payrollId: string,
  data: PayrollPaymentVerificationInput
) =>
  unwrap(
    await API.post<ApiResponse<Payroll>>(
      `/payroll/pay/${payrollId}/verify-payment`,
      data
    )
  );

export const getInsights = async () =>
  unwrap(await API.get<ApiResponse<Insight[]>>("/insights"));

export const generateInsights = async () =>
  unwrap(await API.post<ApiResponse<Insight[]>>("/insights/generate"));

export const getNotifications = async () =>
  unwrap(await API.get<ApiResponse<Notification[]>>("/notifications"));

export const getCustomerSnapshots = async () => {
  const orders = await getOnlineOrders();
  const customers = new Map<
    string,
    { name: string; phone?: string; email?: string; totalSpend: number; orders: number }
  >();

  orders.forEach((order) => {
    const customer = order.customerId;
    const key = customer?.email || customer?.phone || customer?.name || order._id;
    const existing = customers.get(key) ?? {
      name: customer?.name || "Guest customer",
      phone: customer?.phone,
      email: customer?.email,
      totalSpend: 0,
      orders: 0,
    };

    existing.totalSpend += order.totalAmount;
    existing.orders += 1;
    customers.set(key, existing);
  });

  return Array.from(customers.values()).sort(
    (left, right) => right.totalSpend - left.totalSpend
  );
};
