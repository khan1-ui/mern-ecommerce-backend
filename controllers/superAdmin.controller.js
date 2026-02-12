import User from "../models/User.js";
import Store from "../models/Store.js";
import Product from "../models/Product.js";
import Order from "../models/Order.js";

export const getPlatformStats = async (req, res) => {
  try {

    // 🔐 Defensive check
    if (req.user.role !== "superadmin") {
      return res.status(403).json({
        message: "Not authorized",
      });
    }

    const totalUsers = await User.countDocuments();
    const totalStores = await Store.countDocuments();
    const activeStores = await Store.countDocuments({ isActive: true });

    const totalProducts = await Product.countDocuments();
    const totalOrders = await Order.countDocuments();

    // 🔥 Use aggregation for revenue
    const revenueData = await Order.aggregate([
      {
        $match: { paymentStatus: "paid" },
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: "$totalAmount" },
        },
      },
    ]);

    const totalRevenue =
      revenueData.length > 0
        ? revenueData[0].totalRevenue
        : 0;

    res.json({
      totalUsers,
      totalStores,
      activeStores,
      totalProducts,
      totalOrders,
      totalRevenue,
    });

  } catch (error) {
    console.error("SUPERADMIN STATS ERROR:", error);
    res.status(500).json({
      message: "Failed to load platform stats",
    });
  }
};
export const getAllUsers = async (req, res) => {
  const users = await User.find({})
    .select("-password")
    .populate("store");

  res.json(users);
};

export const getAllStores = async (req, res) => {
  const stores = await Store.find({})
    .populate("owner");

  res.json(stores);
};

export const getAllProducts = async (req, res) => {
  const products = await Product.find({})
    .populate("store");

  res.json(products);
};
