import mongoose, { type Document, type Model } from "mongoose";

export interface IInventory extends Document {
  restaurantId: mongoose.Types.ObjectId;
  itemName: string;
  quantity: number;
  unit: string;
  lowStockThreshold: number;
  createdAt?: Date;
  updatedAt?: Date;
}

const inventorySchema = new mongoose.Schema<IInventory>(
  {
    restaurantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Restaurant",
      required: true,
      index: true,
    },
    itemName: { type: String, required: true, trim: true },
    quantity: { type: Number, required: true },
    unit: { type: String, required: true, trim: true },
    lowStockThreshold: { type: Number, required: true, default: 0 },
  },
  { timestamps: true }
);

inventorySchema.index({ restaurantId: 1, itemName: 1 });

const Inventory: Model<IInventory> =
  mongoose.models.Inventory ||
  mongoose.model<IInventory>("Inventory", inventorySchema);

export default Inventory;
