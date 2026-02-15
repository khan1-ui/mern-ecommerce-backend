import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    // ================= USER & STORE =================
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

    // ================= ORDER ITEMS =================
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

    // ================= SHIPPING =================
    shippingAddress: {
      name: { type: String },
      phone: { type: String },
      address: { type: String },
      city: { type: String },
    },

    // ================= AMOUNT =================
    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },

    currency: {
      type: String,
      default: "usd", // international ready
    },

    // ================= ORDER STATUS =================
    orderStatus: {
      type: String,
      enum: ["pending", "processing", "shipped", "delivered", "cancelled"],
      default: "pending",
    },

    // ================= PAYMENT =================
    paymentMethod: {
      type: String,
      enum: ["COD", "stripe"],
      default: "COD",
    },

    paymentStatus: {
      type: String,
      enum: ["unpaid","pending", "paid", "failed", "refunded"],
      default: "unpaid",
      index: true,
    },

    paymentGateway: {
      type: String, // stripe, sslcommerz etc
    },

    paymentIntentId: {
      type: String, // stripe payment intent
    },

    checkoutSessionId: {
      type: String, // stripe checkout session
    },

    paidAt: Date,
    refundedAt: Date,

    // ================= SAAS COMMISSION =================
    platformFee: {
      type: Number,
      default: 0,
    },

    storeEarning: {
      type: Number,
      default: 0,
    },

    // ================= INVOICE =================
    invoiceNumber: {
      type: String,
      unique: true,
      sparse: true,
    },

    deliveredAt: Date,
  },
  { timestamps: true }
);



// 🔥 Compound index for store isolation + fast dashboard
orderSchema.index({ store: 1, createdAt: -1 });
orderSchema.index({ store: 1, paymentStatus: 1 });



// 🔐 Auto-calc safeguard
orderSchema.pre("save", function () {
  const calculatedTotal = this.items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  this.totalAmount = calculatedTotal;

 
});



export default mongoose.model("Order", orderSchema);
