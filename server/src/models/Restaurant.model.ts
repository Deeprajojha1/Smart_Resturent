import mongoose, { type Document, type Model } from "mongoose";

export interface IRestaurant extends Document {
  name: string;
  owner: mongoose.Types.ObjectId;
  location?: string;
  subscriptionPlan: "free" | "pro" | "enterprise";
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

const restaurantSchema = new mongoose.Schema<IRestaurant>(
  {
    name: { type: String, required: true, trim: true },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    location: { type: String, trim: true },
    subscriptionPlan: {
      type: String,
      enum: ["free", "pro", "enterprise"],
      default: "free",
    },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const Restaurant: Model<IRestaurant> =
  mongoose.models.Restaurant ||
  mongoose.model<IRestaurant>("Restaurant", restaurantSchema);

export default Restaurant;
