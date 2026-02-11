import mongoose from "mongoose";

const storeSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    description: { type: String },
    logo: { type: String },     // 🔥 NEW
    banner: { type: String },   // 🔥 NEW
    themeColor: { type: String, default: "#000000" }, // 🔥 NEW
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.model("Store", storeSchema);
