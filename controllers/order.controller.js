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
      return res.status(400).json({
        message: "No order items",
      });
    }

    let storeId = null;
    let calculatedTotal = 0;

    for (const item of items) {
      const product = await Product.findById(item.product)
        .session(session);

      if (!product) {
        throw new Error("Product not found");
      }

      // 🔥 Enforce single store per order
      if (!storeId) {
        storeId = product.store.toString();
      } else if (storeId !== product.store.toString()) {
        throw new Error("Multiple store products not allowed");
      }

      if (product.type === "physical") {
        if (product.stock < item.quantity) {
          throw new Error(
            `Insufficient stock for ${product.title}`
          );
        }

        product.stock -= item.quantity;
        await product.save({ session });
      }

      calculatedTotal += product.price * item.quantity;
    }

    const order = await Order.create(
      [
        {
          user: req.user._id,
          store: storeId,
          items,
          shippingAddress,
          totalAmount: calculatedTotal,
          paymentStatus: "paid",
          orderStatus: "pending",
        },
      ],
      { session }
    );

    await session.commitTransaction();
    await clearCart(req.user._id);


    res.status(201).json(order[0]);

  } catch (error) {
    await session.abortTransaction();
    console.error("ORDER CREATE ERROR:", error);

    res.status(500).json({
      message: error.message || "Order failed",
    });
  } finally {
    session.endSession();
  }
};

// ================= GET MY ORDERS =================
export const getMyOrders = async (req, res) => {
  const orders = await Order.find({
    user: req.user._id,
  })
    .populate("items.product", "title price type digitalFile")
    .sort({ createdAt: -1 });

  res.json(orders);
};

// ================= STORE OWNER: GET STORE ORDERS =================
export const getStoreOrders = async (req, res) => {
  const storeId = req.user.store?._id;

  const orders = await Order.find({
    store: storeId,
  })
    .populate("user", "name email")
    .sort({ createdAt: -1 });

  res.json(orders);
};

// ================= UPDATE ORDER STATUS =================
export const updateOrderStatus = async (req, res) => {
  try {
    const storeId = req.user.store?._id;

    const order = await Order.findOne({
      _id: req.params.id,
      store: storeId,
    });

    if (!order) {
      return res.status(404).json({
        message: "Order not found",
      });
    }

    const { orderStatus } = req.body;

    order.orderStatus = orderStatus;
    await order.save();

    res.json(order);

  } catch (error) {
    res.status(500).json({
      message: "Failed to update order",
    });
  }
};

// ================= SUPERADMIN: GET ALL ORDERS =================
export const getAllOrdersSuperAdmin = async (req, res) => {
  if (req.user.role !== "superadmin") {
    return res.status(403).json({
      message: "Not authorized",
    });
  }

  const orders = await Order.find({})
    .populate("user", "name email")
    .populate("store", "name slug")
    .sort({ createdAt: -1 });

  res.json(orders);
};
