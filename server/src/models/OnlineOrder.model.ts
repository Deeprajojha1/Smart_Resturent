import mongoose, { type Document, type Model } from "mongoose";

export interface IOnlineOrderItem {
  menuId: mongoose.Types.ObjectId;
  name: string;
  quantity: number;
  price: number;
}

export interface IOnlineOrder extends Document {
  restaurantId: mongoose.Types.ObjectId;
  customerId: mongoose.Types.ObjectId;
  items: IOnlineOrderItem[];
  totalAmount: number;
  status: "pending" | "confirmed" | "preparing" | "delivered" | "cancelled";
  paymentMethod: "cod" | "online";
  paymentStatus: "pending" | "paid" | "failed";
  address: string;
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const onlineOrderSchema = new mongoose.Schema<IOnlineOrder>(
  {
    restaurantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Restaurant",
      required: true,
      index: true,
    },
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      required: true,
    },
    items: [
      {
        menuId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Menu",
          required: true,
        },
        name: { type: String, required: true, trim: true },
        quantity: { type: Number, required: true },
        price: { type: Number, required: true },
      },
    ],
    totalAmount: { type: Number, required: true },
    status: {
      type: String,
      enum: ["pending", "confirmed", "preparing", "delivered", "cancelled"],
      default: "pending",
    },
    paymentMethod: {
      type: String,
      enum: ["cod", "online"],
      required: true,
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed"],
      default: "pending",
    },
    address: { type: String, required: true, trim: true },
    razorpayOrderId: { type: String, trim: true },
    razorpayPaymentId: { type: String, trim: true },
  },
  { timestamps: true }
);

onlineOrderSchema.index({ restaurantId: 1, createdAt: -1 });

const OnlineOrder: Model<IOnlineOrder> =
  mongoose.models.OnlineOrder ||
  mongoose.model<IOnlineOrder>("OnlineOrder", onlineOrderSchema);

export default OnlineOrder;
