import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    slug: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },

    description: {
      type: String,
      default: "",
    },

    price: {
      type: Number,
      required: true,
      min: 0,
    },

    type: {
      type: String,
      enum: ["digital", "physical"],
      required: true,
    },

    images: {
      type: [String],
      default: [],
    },

    digitalFile: {
      type: String,
      default: null,
    },

    stock: {
      type: Number,
      default: 0,
      min: 0,
    },

    isPublished: {
      type: Boolean,
      default: true,
    },

    store: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Store",
      required: true,
      index: true,
    },

  },
  { timestamps: true }
);

// 🔥 IMPORTANT: Compound Index for SaaS Isolation
productSchema.index({ store: 1, slug: 1 }, { unique: true });

// 🔐 Prevent digital product having stock
productSchema.pre("save", function (next) {
  if (this.type === "digital") {
    this.stock = null;
  }
  next();
});

export default mongoose.model("Product", productSchema);
