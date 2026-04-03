import mongoose, { type Document, type Model } from "mongoose";

export interface IExpense extends Document {
  restaurantId: mongoose.Types.ObjectId;
  amount: number;
  category:
    | "rent"
    | "salary"
    | "raw_material"
    | "utilities"
    | "maintenance"
    | "other";
  description?: string;
  vendor?: string;
  paymentMethod: "cash" | "card" | "upi";
  receiptUrl?: string;
  createdBy?: mongoose.Types.ObjectId;
  createdAt?: Date;
  updatedAt?: Date;
}

const expenseSchema = new mongoose.Schema<IExpense>(
  {
    restaurantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Restaurant",
      required: true,
      index: true,
    },
    amount: { type: Number, required: true },
    category: {
      type: String,
      required: true,
      enum: ["rent", "salary", "raw_material", "utilities", "maintenance", "other"],
    },
    description: { type: String, trim: true },
    vendor: { type: String, trim: true },
    paymentMethod: {
      type: String,
      enum: ["cash", "card", "upi"],
      default: "cash",
    },
    receiptUrl: { type: String, trim: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

expenseSchema.index({ restaurantId: 1, createdAt: -1 });

const Expense: Model<IExpense> =
  mongoose.models.Expense || mongoose.model<IExpense>("Expense", expenseSchema);

export default Expense;
