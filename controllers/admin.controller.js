import User from "../models/User.js";
import Product from "../models/Product.js";
import Order from "../models/Order.js";

// ================= USERS =================
export const getAllUsers = async (req, res) => {
  if (!req.user?.store) {
    return res.status(403).json({
      message: "No store assigned",
    });
  }

  const users = await User.find({
    store: req.user.store._id,
  }).select("-password");

  res.json(users);
};


// ================= ADMIN STATS =================
export const getAdminStats = async (req, res) => {
  const storeId = req.user.store._id;

  // Users of this store only
  const usersCount = await User.countDocuments({
    store: storeId,
  });

  // Products of this store only
  const productsCount = await Product.countDocuments({
    store: storeId,
  });

  const digitalProducts = await Product.countDocuments({
    store: storeId,
    type: "digital",
  });

  const physicalProducts = await Product.countDocuments({
    store: storeId,
    type: "physical",
  });

  // Orders of this store only
  const orders = await Order.find({
    store: storeId,
  });

  const ordersCount = orders.length;

  const revenue = orders.reduce(
    (sum, order) => sum + order.totalAmount,
    0
  );

  const paidOrders = await Order.countDocuments({
    store: storeId,
    status: "paid",
  });

  const shippedOrders = await Order.countDocuments({
    store: storeId,
    status: "shipped",
  });

  const deliveredOrders = await Order.countDocuments({
    store: storeId,
    status: "delivered",
  });

  res.json({
    usersCount,
    products: {
      total: productsCount,
      digital: digitalProducts,
      physical: physicalProducts,
    },
    orders: {
      total: ordersCount,
      paid: paidOrders,
      shipped: shippedOrders,
      delivered: deliveredOrders,
    },
    revenue,
  });
};

// ================= REVENUE STATS =================
export const getRevenueStats = async (req, res) => {
  const storeId = req.user.store._id;

  const orders = await Order.find({
    store: storeId,
    status: "paid",
  });

  const revenueMap = {};

  orders.forEach((order) => {
    const date = new Date(order.createdAt)
      .toISOString()
      .split("T")[0];

    revenueMap[date] =
      (revenueMap[date] || 0) + order.totalAmount;
  });

  const revenueData = Object.keys(revenueMap).map(
    (date) => ({
      date,
      revenue: revenueMap[date],
    })
  );

  res.json(revenueData);
};
