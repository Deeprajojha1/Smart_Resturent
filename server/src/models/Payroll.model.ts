import mongoose, { type Document, type Model } from "mongoose";

export interface IPayroll extends Document {
  employeeId: mongoose.Types.ObjectId;
  restaurantId: mongoose.Types.ObjectId;
  amount: number;
  month: number;
  year: number;
  status: "pending" | "paid";
  paymentMethod?: "cash" | "card" | "upi";
  paidAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

const payrollSchema = new mongoose.Schema<IPayroll>(
  {
    employeeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      required: true,
      index: true,
    },
    restaurantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Restaurant",
      required: true,
      index: true,
    },
    amount: { type: Number, required: true },
    month: { type: Number, required: true, min: 1, max: 12 },
    year: { type: Number, required: true },
    status: {
      type: String,
      enum: ["pending", "paid"],
      default: "pending",
    },
    paymentMethod: {
      type: String,
      enum: ["cash", "card", "upi"],
    },
    paidAt: { type: Date },
  },
  { timestamps: true }
);

payrollSchema.index({ restaurantId: 1, createdAt: -1 });
payrollSchema.index({ employeeId: 1, month: 1, year: 1 }, { unique: true });

const Payroll: Model<IPayroll> =
  mongoose.models.Payroll || mongoose.model<IPayroll>("Payroll", payrollSchema);

export default Payroll;
