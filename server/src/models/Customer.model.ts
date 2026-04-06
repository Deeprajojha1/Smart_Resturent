import mongoose, { type Document, type Model } from "mongoose";

export interface ICustomer extends Document {
  name?: string;
  phone?: string;
  email?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const customerSchema = new mongoose.Schema<ICustomer>(
  {
    name: { type: String, trim: true },
    phone: { type: String, trim: true, index: true },
    email: { type: String, trim: true, lowercase: true, index: true },
  },
  { timestamps: true }
);

const Customer: Model<ICustomer> =
  mongoose.models.Customer ||
  mongoose.model<ICustomer>("Customer", customerSchema);

export default Customer;
