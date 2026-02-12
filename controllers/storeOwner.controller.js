import Store from "../models/Store.js";
import Product from "../models/Product.js";
import Order from "../models/Order.js";

// ================= GET STORE DASHBOARD STATS =================
export const getStoreStats = async (req, res) => {
  try {
    const storeId = req.user.store?._id;

    if (!storeId) {
      return res.status(400).json({
        message: "No store attached to this user",
      });
    }

    const totalProducts = await Product.countDocuments({
      store: storeId,
    });

    const totalOrders = await Order.countDocuments({
      store: storeId,
    });

    const paidOrders = await Order.countDocuments({
      store: storeId,
      paymentStatus: "paid",
    });

    const revenueData = await Order.aggregate([
      {
        $match: {
          store: storeId,
          paymentStatus: "paid",
        },
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
      totalProducts,
      totalOrders,
      paidOrders,
      totalRevenue,
    });

  } catch (error) {
    console.error("STORE STATS ERROR:", error);
    res.status(500).json({
      message: "Failed to load store stats",
    });
  }
};
// ================= PUBLIC: GET STORE BY SLUG =================
export const getStoreBySlug = async (req, res, next) => {
  try {
    const { slug } = req.params;

    const store = await Store.findOne({
      slug,
      isActive: true,
    });

    if (!store) {
      return res.status(404).json({
        message: "Store not found",
      });
    }

    const products = await Product.find({
      store: store._id,
      isPublished: true,
    });

    res.json({
      store,
      products,
    });

  } catch (error) {
    next(error); // 🔥 let global error middleware handle it
  }
};
// ================= UPDATE STORE SETTINGS =================
export const updateStoreSettings = async (req, res) => {
  try {
    const storeId = req.user.store?._id;

    if (!storeId) {
      return res.status(400).json({
        message: "No store found",
      });
    }

    const { name, description, logo, banner, themeColor } =
      req.body;

    const store = await Store.findById(storeId);

    if (!store) {
      return res.status(404).json({
        message: "Store not found",
      });
    }

    store.name = name || store.name;
    store.description = description || store.description;
    store.logo = logo || store.logo;
    store.banner = banner || store.banner;
    store.themeColor = themeColor || store.themeColor;

    await store.save();

    res.json({
      message: "Store updated successfully",
      store,
    });

  } catch (error) {
    console.error("STORE UPDATE ERROR:", error);
    res.status(500).json({
      message: "Failed to update store",
    });
  }
};

// ================= GET STORE ORDERS =================
export const getStoreOrders = async (req, res) => {
  try {
    const storeId = req.user.store?._id;

    const orders = await Order.find({
      store: storeId,
    })
      .populate("user", "name email")
      .sort({ createdAt: -1 });

    res.json(orders);

  } catch (error) {
    console.error("STORE ORDERS ERROR:", error);
    res.status(500).json({
      message: "Failed to load orders",
    });
  }
};
