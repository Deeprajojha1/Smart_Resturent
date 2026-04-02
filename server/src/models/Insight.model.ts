import mongoose, { type Document, type Model } from "mongoose";

export interface IInsight extends Document {
  restaurantId: mongoose.Types.ObjectId;
  message: string;
  type: "warning" | "info" | "profit";
  createdAt?: Date;
  updatedAt?: Date;
}

const insightSchema = new mongoose.Schema<IInsight>(
  {
    restaurantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Restaurant",
      required: true,
      index: true,
    },
    message: { type: String, required: true, trim: true },
    type: {
      type: String,
      enum: ["warning", "info", "profit"],
      default: "info",
    },
  },
  { timestamps: true }
);

insightSchema.index({ restaurantId: 1, createdAt: -1 });

const Insight: Model<IInsight> =
  mongoose.models.Insight || mongoose.model<IInsight>("Insight", insightSchema);

export default Insight;
