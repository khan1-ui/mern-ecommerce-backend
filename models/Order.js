import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    store: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Store",
      required: true,
      index: true,
    },

    items: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },

        name: {
          type: String,
          required: true,
        },

        price: {
          type: Number,
          required: true,
          min: 0,
        },

        quantity: {
          type: Number,
          required: true,
          min: 1,
        },
      },
    ],

    shippingAddress: {
      name: { type: String, required: true },
      phone: { type: String, required: true },
      address: { type: String, required: true },
      city: { type: String, required: true },
    },

    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },

    orderStatus: {
      type: String,
      enum: ["pending", "shipped", "delivered", "cancelled"],
      default: "pending",
    },

    paymentMethod: {
      type: String,
      enum: ["COD"],
      default: "COD",
    },

    paymentStatus: {
      type: String,
      enum: ["unpaid", "paid"],
      default: "unpaid",
    },

    invoiceNumber: {
      type: String,
      unique: true,
      sparse: true,
    },

    deliveredAt: Date,
  },
  { timestamps: true }
);

// 🔥 Important compound index for store isolation
orderSchema.index({ store: 1, createdAt: -1 });

// 🔐 Auto-calc safeguard (optional but recommended)
orderSchema.pre("save", function (next) {
  const calculatedTotal = this.items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  this.totalAmount = calculatedTotal;

  next();
});

export default mongoose.model("Order", orderSchema);
