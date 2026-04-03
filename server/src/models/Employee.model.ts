import mongoose, { type Document, type Model } from "mongoose";
import type { Role } from "../constants/roles";

export interface IEmployee extends Document {
  userId: mongoose.Types.ObjectId;
  restaurantId: mongoose.Types.ObjectId;
  role: Role;
  salary: number;
  joiningDate: Date;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

const employeeSchema = new mongoose.Schema<IEmployee>(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    restaurantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Restaurant",
      required: true,
      index: true,
    },
    role: {
      type: String,
      enum: ["cashier", "manager", "admin", "inventory", "vendor"],
      required: true,
    },
    salary: { type: Number, required: true },
    joiningDate: { type: Date, required: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

employeeSchema.index({ restaurantId: 1, userId: 1 }, { unique: true });

const Employee: Model<IEmployee> =
  mongoose.models.Employee || mongoose.model<IEmployee>("Employee", employeeSchema);

export default Employee;
