import Order from "../models/Order.js";
import Product from "../models/Product.js";
import { clearCart } from "./cart.controller.js";
import mongoose from "mongoose";

// ================= CREATE ORDER =================
export const createOrder = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { items, shippingAddress } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      await session.abortTransaction();
      return res.status(400).json({
        message: "No order items",
      });
    }

    let storeId = null;
    let calculatedTotal = 0;
    const orderItems = [];

    for (const item of items) {
      const product = await Product.findById(item.product).session(session);

      if (!product) {
        throw new Error("Product not found");
      }

      // 🔥 Enforce single store per order
      if (!storeId) {
        storeId = product.store.toString();
      } else if (storeId !== product.store.toString()) {
        throw new Error("Multiple store products not allowed");
      }

      // 🔥 Stock validation
      if (product.type === "physical") {
        if (product.stock < item.quantity) {
          throw new Error(
            `Insufficient stock for ${product.title}`
          );
        }

        product.stock -= item.quantity;
        await product.save({ session });
      }

      // 🔥 Build secure order item
      orderItems.push({
        product: product._id,
        name: product.title,
        price: product.price,
        quantity: item.quantity,
      });

      calculatedTotal += product.price * item.quantity;
    }

    const order = await Order.create(
      [
        {
          user: req.user._id,
          store: storeId,
          items: orderItems, // ✅ secure items
          shippingAddress,
          totalAmount: calculatedTotal,
          paymentStatus: "paid", // later stripe dynamic
          orderStatus: "pending",
        },
      ],
      { session }
    );

    await session.commitTransaction();

    // 🔥 Clear cart after successful commit
    await clearCart(req.user._id);

    return res.status(201).json(order[0]);

  } catch (error) {
    await session.abortTransaction();
    console.error("ORDER CREATE ERROR:", error);

    return res.status(500).json({
      message: error.message || "Order failed",
    });
  } finally {
    session.endSession();
  }
};
