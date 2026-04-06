import mongoose, { type Document, type Model } from "mongoose";

export interface IMenu extends Document {
  restaurantId: mongoose.Types.ObjectId;
  name: string;
  description?: string;
  price: number;
  category?: string;
  isAvailable: boolean;
  image?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const menuSchema = new mongoose.Schema<IMenu>(
  {
    restaurantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Restaurant",
      required: true,
      index: true,
    },
    name: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    price: { type: Number, required: true },
    category: { type: String, trim: true },
    isAvailable: { type: Boolean, default: true },
    image: { type: String, trim: true },
  },
  { timestamps: true }
);

menuSchema.index({ restaurantId: 1, category: 1 });

const Menu: Model<IMenu> =
  mongoose.models.Menu || mongoose.model<IMenu>("Menu", menuSchema);

export default Menu;
