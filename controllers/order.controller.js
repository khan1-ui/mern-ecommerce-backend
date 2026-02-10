import Order from "../models/Order.js";
import Product from "../models/Product.js";

// CREATE ORDER
export const createOrder = async (req, res) => {
  try {
    const { items, totalAmount, deliveryAddress } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        message: "No order items",
      });
    }

    // 🔍 Validate & reduce stock
    for (const item of items) {
      if (item.type === "physical") {
        const product = await Product.findById(item.product);

        if (!product) {
          return res.status(404).json({
            message: "Product not found",
          });
        }

        if (product.stock < item.qty) {
          return res.status(400).json({
            message: `Insufficient stock for ${product.title}`,
          });
        }

        product.stock -= item.qty;
        await product.save();
      }
    }

    const order = await Order.create({
      user: req.user._id,
      items,
      deliveryAddress: deliveryAddress || null,
      totalAmount,
      status: "paid",
    });

    res.status(201).json(order);
  } catch (error) {
    console.error("ORDER CREATE ERROR:", error);
    res.status(500).json({ message: "Order failed" });
  }
};

// GET MY ORDERS
export const getMyOrders = async (req, res) => {
  const orders = await Order.find({ user: req.user._id })
    .populate("items.product", "title price type digitalFile")
    .sort({ createdAt: -1 });

  res.json(orders);
};

// ADMIN: UPDATE ORDER STATUS
export const updateOrderStatus = async (req, res) => {
  const { status } = req.body;

  const order = await Order.findById(req.params.id);

  if (!order) {
    return res.status(404).json({
      message: "Order not found",
    });
  }

  order.status = status;
  await order.save();

  res.json(order);
};
export const getAllOrdersAdmin = async (req, res) => {
  const orders = await Order.find({})
    .populate("user", "name email")
    .populate("items.product", "title type")
    .sort({ createdAt: -1 });

  res.json(orders);
};
