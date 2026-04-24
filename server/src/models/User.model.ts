import mongoose, { type Document, type Model, type Schema } from "mongoose";

export interface IUser extends Document {
  googleId?: string;
  email: string;
  name: string;
  password?: string;
  picture?: string;
  phoneNumber?: string;
  role:
    | "cashier"
    | "manager"
    | "admin"
    | "inventory"
    | "inventory_head"
    | "vendor";
  restaurantId?: mongoose.Types.ObjectId;
  restaurantIds?: mongoose.Types.ObjectId[];
  lastLogin?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

const userSchema = new mongoose.Schema<IUser>(
  {
    googleId: {
      type: String,
      unique: true,
      sparse: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
    },
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    password: {
      type: String,
    },
    picture: {
      type: String,
      default: "",
    },
    phoneNumber: {
      type: String,
      trim: true,
    },
    role: {
      type: String,
      enum: [
        "cashier",
        "manager",
        "admin",
        "inventory",
        "inventory_head",
        "vendor",
      ],
      default: "cashier",
      required: true,
    },
    restaurantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Restaurant",
      index: true,
    },
    restaurantIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Restaurant",
      },
    ],
    lastLogin: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

const User: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>("User", userSchema);

export default User;
