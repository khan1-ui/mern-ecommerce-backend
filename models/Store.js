import mongoose from "mongoose";

const storeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },

    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    description: {
      type: String,
      default: "",
    },

    logo: {
      type: String,
      default: "https://via.placeholder.com/150x150?text=Logo",
    },

    banner: {
      type: String,
      default: "https://images.unsplash.com/photo-1492724441997-5dc865305da7",
    },

    themeColor: {
      type: String,
      default: "#000000",
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    subscriptionPlan: {
      type: String,
      enum: ["free", "pro", "enterprise"],
      default: "free",
    },

    subscriptionStatus: {
      type: String,
      enum: ["active", "expired", "cancelled"],
      default: "active",
    },

  },
  { timestamps: true }
);

// 🔒 Ensure slug always lowercase
storeSchema.pre("save", function () {
  if (this.slug) {
    this.slug = this.slug.toLowerCase();
  }
 
});

export default mongoose.model("Store", storeSchema);
