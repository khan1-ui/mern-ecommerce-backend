import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    description: String,
    price: Number,
    type: { type: String, enum: ["digital", "physical"] },
    images: [String],
    digitalFile: String,
    stock: Number,
    isPublished: { type: Boolean, default: true },
    store: {type: mongoose.Schema.Types.ObjectId,
        ref: "Store",
        required: true,
      },

  },
  { timestamps: true }
);

export default mongoose.model("Product", productSchema);
