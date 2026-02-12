import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },

    password: {
      type: String,
      required: true,
      minlength: 6,
    },

    role: {
      type: String,
      enum: ["superadmin", "storeOwner", "customer"],
      default: "customer",
    },

    store: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Store",
      default: null,
    },

    status: {
      type: String,
      enum: ["active", "suspended"],
      default: "active",
    },

  },
  { timestamps: true }
);

// 🔐 HASH PASSWORD
userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;

  this.password = await bcrypt.hash(this.password, 10);
});

// 🔐 PASSWORD MATCH
userSchema.methods.matchPassword = async function (entered) {
  return await bcrypt.compare(entered, this.password);
};

// 🧠 Prevent storeOwner without store
userSchema.pre("save", function (next) {
  if (this.role === "storeOwner" && !this.store) {
    console.warn("⚠ StoreOwner without store detected");
  }
  next();
});

export default mongoose.model("User", userSchema);
