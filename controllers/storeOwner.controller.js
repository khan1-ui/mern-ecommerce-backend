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
export const getStoreRevenue = async (req, res) => {
  try {
    const storeId = req.user.store;

    const revenue = await Order.aggregate([
      { $match: { store: storeId } },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: "$totalPrice" }
        }
      }
    ]);

    res.json({
      totalRevenue: revenue[0]?.totalRevenue || 0
    });

  } catch (error) {
    console.error("REVENUE ERROR:", error);
    res.status(500).json({ message: "Failed to load revenue" });
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
/**
 * 🔥 GET MY STORE ORDERS
 * Multi-tenant safe
 */
export const getMyStoreOrders = async (req, res) => {
  try {
    // 1️⃣ Find store owned by this user
    const store = await Store.findOne({ owner: req.user._id });

    if (!store) {
      return res.status(404).json({
        message: "Store not found for this owner",
      });
    }

    // 2️⃣ Get orders only for this store
    const orders = await Order.find({ store: store._id })
      .populate("user", "name email")
      .sort({ createdAt: -1 });

    res.json(orders);
  } catch (error) {
    console.error("GET STORE ORDERS ERROR:", error);
    res.status(500).json({
      message: "Failed to fetch orders",
    });
  }
};
/**
 * 🔥 UPDATE ORDER STATUS (StoreOwner Only)
 */
export const updateOrderStatusByStoreOwner = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { orderStatus } = req.body;

    // Allowed statuses
    const allowedStatuses = [
      "pending",
      "paid",
      "shipped",
      "delivered",
      "cancelled",
    ];

    if (!allowedStatuses.includes(orderStatus)) {
      return res.status(400).json({
        message: "Invalid order status",
      });
    }

    // 1️⃣ Find store
    const store = await Store.findOne({ owner: req.user._id });

    if (!store) {
      return res.status(404).json({
        message: "Store not found",
      });
    }

    // 2️⃣ Find order and verify ownership
    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({
        message: "Order not found",
      });
    }

    if (order.store.toString() !== store._id.toString()) {
      return res.status(403).json({
        message: "Not authorized to update this order",
      });
    }

    // 3️⃣ Update status
    order.orderStatus = orderStatus;
    await order.save();

    res.json({
      message: "Order status updated successfully",
      order,
    });

  } catch (error) {
    console.error("UPDATE ORDER STATUS ERROR:", error);
    res.status(500).json({
      message: "Failed to update order status",
    });
  }
};
