import crypto from "crypto";
import Customer from "../models/Customer.model";
import Menu from "../models/Menu.model";
import OnlineOrder from "../models/OnlineOrder.model";
import User from "../models/User.model";
import { getRazorpayClient } from "../config/razorpay.config";

type OrderItemInput = {
  menuId: string;
  quantity: number;
};

type CreateOnlineOrderInput = {
  restaurantId: string;
  customer: {
    name?: string;
    phone?: string;
    email?: string;
  };
  items: OrderItemInput[];
  address?: string;
  paymentMethod?: "cod" | "online";
};

type VerifyPaymentInput = {
  orderId: string;
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
};

type Requester = {
  id: string;
};

const getRequesterRestaurantId = async (requesterId: string) => {
  const user = await User.findById(requesterId).select("restaurantId");
  return user?.restaurantId ?? null;
};

const normalize = (value?: string) => value?.trim() || undefined;

const findOrCreateCustomer = async (input: CreateOnlineOrderInput["customer"]) => {
  const name = normalize(input?.name);
  const phone = normalize(input?.phone);
  const email = normalize(input?.email)?.toLowerCase();

  if (!name && !phone && !email) {
    const error = new Error("Customer details are required.");
    (error as Error & { statusCode?: number }).statusCode = 400;
    throw error;
  }

  const orFilters = [
    phone ? { phone } : null,
    email ? { email } : null,
  ].filter(Boolean) as Record<string, string>[];

  if (orFilters.length) {
    const existing = await Customer.findOne({ $or: orFilters });
    if (existing) {
      existing.set({ name, phone, email });
      await existing.save();
      return existing;
    }
  }

  return Customer.create({ name, phone, email });
};

export const createOnlineOrderService = async (data: CreateOnlineOrderInput) => {
  if (!data.restaurantId) {
    const error = new Error("restaurantId is required.");
    (error as Error & { statusCode?: number }).statusCode = 400;
    throw error;
  }

  if (!Array.isArray(data.items) || data.items.length === 0) {
    const error = new Error("At least one item is required.");
    (error as Error & { statusCode?: number }).statusCode = 400;
    throw error;
  }

  const address = normalize(data.address);
  if (!address) {
    const error = new Error("Delivery address is required.");
    (error as Error & { statusCode?: number }).statusCode = 400;
    throw error;
  }

  const paymentMethod = data.paymentMethod ?? "cod";
  if (paymentMethod !== "cod" && paymentMethod !== "online") {
    const error = new Error("Invalid payment method.");
    (error as Error & { statusCode?: number }).statusCode = 400;
    throw error;
  }

  const customerDoc = await findOrCreateCustomer(data.customer);

  const menuIds = data.items.map((item) => item.menuId);
  const uniqueMenuIds = Array.from(new Set(menuIds));
  const menuDocs = await Menu.find({
    _id: { $in: uniqueMenuIds },
    restaurantId: data.restaurantId,
    isAvailable: true,
  });

  const menuMap = new Map(menuDocs.map((doc) => [String(doc._id), doc]));

  let totalAmount = 0;
  const detailedItems = data.items.map((item) => {
    if (item.quantity <= 0) {
      const error = new Error("Quantity must be greater than zero.");
      (error as Error & { statusCode?: number }).statusCode = 400;
      throw error;
    }

    const menuItem = menuMap.get(item.menuId);
    if (!menuItem) {
      const error = new Error("One or more menu items are unavailable.");
      (error as Error & { statusCode?: number }).statusCode = 404;
      throw error;
    }

    totalAmount += menuItem.price * item.quantity;

    return {
      menuId: menuItem._id,
      name: menuItem.name,
      price: menuItem.price,
      quantity: item.quantity,
    };
  });

  const order = await OnlineOrder.create({
    restaurantId: data.restaurantId,
    customerId: customerDoc._id,
    items: detailedItems,
    totalAmount,
    address,
    paymentMethod,
  });

  let razorpayOrder: { id: string } | null = null;

  if (paymentMethod === "online") {
    try {
      const razorpay = getRazorpayClient();
      razorpayOrder = await razorpay.orders.create({
        amount: Math.round(totalAmount * 100),
        currency: "INR",
        receipt: order._id.toString(),
      });

      order.razorpayOrderId = razorpayOrder.id;
      await order.save();
    } catch (error) {
      order.paymentStatus = "failed";
      await order.save();
      throw error;
    }
  }

  return {
    order,
    razorpayOrder,
  };
};

export const verifyOnlinePaymentService = async (data: VerifyPaymentInput) => {
  const { orderId, razorpay_order_id, razorpay_payment_id, razorpay_signature } =
    data;

  const order = await OnlineOrder.findById(orderId);
  if (!order) {
    const error = new Error("Order not found.");
    (error as Error & { statusCode?: number }).statusCode = 404;
    throw error;
  }

  if (order.paymentMethod !== "online") {
    const error = new Error("Online payment not applicable for this order.");
    (error as Error & { statusCode?: number }).statusCode = 400;
    throw error;
  }

  if (order.razorpayOrderId && order.razorpayOrderId !== razorpay_order_id) {
    const error = new Error("Razorpay order mismatch.");
    (error as Error & { statusCode?: number }).statusCode = 400;
    throw error;
  }

  const secret = process.env.RAZORPAY_SECRET;
  if (!secret) {
    throw new Error("RAZORPAY_SECRET is not defined in .env");
  }

  const body = `${razorpay_order_id}|${razorpay_payment_id}`;
  const expectedSignature = crypto
    .createHmac("sha256", secret)
    .update(body)
    .digest("hex");

  if (expectedSignature !== razorpay_signature) {
    const error = new Error("Payment verification failed.");
    (error as Error & { statusCode?: number }).statusCode = 400;
    throw error;
  }

  order.paymentStatus = "paid";
  if (order.status === "pending") {
    order.status = "confirmed";
  }
  order.razorpayPaymentId = razorpay_payment_id;
  await order.save();

  return order;
};

export const getOnlineOrdersService = async (
  requester: Requester,
  query?: { status?: string; startDate?: string; endDate?: string }
) => {
  const restaurantId = await getRequesterRestaurantId(requester.id);
  if (!restaurantId) {
    const error = new Error("Restaurant not found for user.");
    (error as Error & { statusCode?: number }).statusCode = 404;
    throw error;
  }

  const start = query?.startDate ? new Date(query.startDate) : new Date(0);
  const end = query?.endDate ? new Date(query.endDate) : new Date();

  const filter: Record<string, unknown> = {
    restaurantId,
    createdAt: { $gte: start, $lte: end },
  };

  if (query?.status) {
    filter.status = query.status;
  }

  return OnlineOrder.find(filter)
    .populate("customerId", "name phone email")
    .sort({ createdAt: -1 });
};

export const updateOnlineOrderStatusService = async (
  id: string,
  status:
    | "pending"
    | "confirmed"
    | "preparing"
    | "delivered"
    | "cancelled",
  requester: Requester
) => {
  const restaurantId = await getRequesterRestaurantId(requester.id);
  if (!restaurantId) {
    const error = new Error("Restaurant not found for user.");
    (error as Error & { statusCode?: number }).statusCode = 404;
    throw error;
  }

  return OnlineOrder.findOneAndUpdate(
    { _id: id, restaurantId },
    { $set: { status } },
    { new: true }
  );
};
