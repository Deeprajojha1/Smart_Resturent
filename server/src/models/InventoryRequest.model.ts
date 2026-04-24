import mongoose, { type Document, type Model } from "mongoose";

export const INVENTORY_REQUEST_STATUSES = [
  "requested",
  "approved",
  "vendor_assigned",
  "dispatched",
  "received",
  "fulfilled",
  "closed",
  "cancelled",
] as const;

export type InventoryRequestStatus = (typeof INVENTORY_REQUEST_STATUSES)[number];

export interface IInventoryRequestTimeline {
  status: InventoryRequestStatus;
  changedBy: mongoose.Types.ObjectId;
  note?: string;
  changedAt: Date;
}

export interface IInventoryRequest extends Document {
  restaurantId: mongoose.Types.ObjectId;
  itemName: string;
  requestedQty: number;
  availableQty: number;
  source: "pos_order" | "manual";
  sourceOrderId?: mongoose.Types.ObjectId;
  requestedBy: mongoose.Types.ObjectId;
  assignedVendorId?: mongoose.Types.ObjectId;
  eta?: Date;
  status: InventoryRequestStatus;
  notes?: string;
  timeline: IInventoryRequestTimeline[];
  createdAt?: Date;
  updatedAt?: Date;
}

const inventoryRequestSchema = new mongoose.Schema<IInventoryRequest>(
  {
    restaurantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Restaurant",
      required: true,
      index: true,
    },
    itemName: { type: String, required: true, trim: true },
    requestedQty: { type: Number, required: true, min: 1 },
    availableQty: { type: Number, required: true, min: 0, default: 0 },
    source: {
      type: String,
      enum: ["pos_order", "manual"],
      default: "manual",
      required: true,
    },
    sourceOrderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
    },
    requestedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    assignedVendorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    eta: { type: Date },
    status: {
      type: String,
      enum: INVENTORY_REQUEST_STATUSES,
      default: "requested",
      required: true,
      index: true,
    },
    notes: { type: String, trim: true },
    timeline: [
      {
        status: {
          type: String,
          enum: INVENTORY_REQUEST_STATUSES,
          required: true,
        },
        changedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        note: { type: String, trim: true },
        changedAt: { type: Date, required: true, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

inventoryRequestSchema.index({ restaurantId: 1, status: 1, createdAt: -1 });
inventoryRequestSchema.index({ restaurantId: 1, itemName: 1, createdAt: -1 });
inventoryRequestSchema.index({ assignedVendorId: 1, status: 1, createdAt: -1 });

const InventoryRequest: Model<IInventoryRequest> =
  mongoose.models.InventoryRequest ||
  mongoose.model<IInventoryRequest>("InventoryRequest", inventoryRequestSchema);

export default InventoryRequest;
