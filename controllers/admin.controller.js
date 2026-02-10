import User from "../models/User.js";
import Product from "../models/Product.js";
import Order from "../models/Order.js";

export const getAllUsers = async (req, res) => {
  const users = await User.find({}).select("-password");
  res.json(users);
};

export const getAdminStats = async (req, res) => {
  const usersCount = await User.countDocuments();

  const productsCount = await Product.countDocuments();
  const digitalProducts = await Product.countDocuments({ type: "digital" });
  const physicalProducts = await Product.countDocuments({ type: "physical" });

  const orders = await Order.find({});
  const ordersCount = orders.length;

  const revenue = orders.reduce(
    (sum, order) => sum + order.totalAmount,
    0
  );

  const paidOrders = await Order.countDocuments({ status: "paid" });
  const shippedOrders = await Order.countDocuments({ status: "shipped" });
  const deliveredOrders = await Order.countDocuments({ status: "delivered" });

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
export const getRevenueStats = async (req, res) => {
  const orders = await Order.find({ status: "paid" });

  const revenueMap = {};

  orders.forEach((order) => {
    const date = new Date(order.createdAt)
      .toISOString()
      .split("T")[0]; // YYYY-MM-DD

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

