import Product from "../models/Product.js";
import Order from "../models/Order.js";
import slugify from "slugify";

// ================= PUBLIC STORE PRODUCTS =================
export const getProductsByStore = async (req, res) => {
  try {
    const { storeId } = req.params;

    const products = await Product.find({
      store: storeId,
      isPublished: true,
    });

    res.json(products);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch products" });
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
// ================= GET PRODUCT BY SLUG (STORE SAFE) =================
export const getProductBySlug = async (req, res) => {
  try {
    const { storeId, slug } = req.params;

    const product = await Product.findOne({
      store: storeId,
      slug,
      isPublished: true,
    });

    if (!product) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    res.json(product);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch product" });
  }
};

// ================= STORE OWNER - GET OWN PRODUCTS =================
export const getMyProducts = async (req, res) => {
  const storeId = req.user.store?._id;

  const products = await Product.find({
    store: storeId,
  });

  res.json(products);
};

// ================= CREATE PRODUCT =================
export const createProduct = async (req, res) => {
  try {
    const storeId = req.user.store?._id;

    if (!storeId) {
      return res.status(403).json({
        message: "You do not own a store",
      });
    }

    const { title, description, price, type, stock } =
      req.body;

    if (!title || !price || !type) {
      return res.status(400).json({
        message: "Required fields missing",
      });
    }

    let baseSlug = slugify(title, {
      lower: true,
      strict: true,
    });

    let slug = baseSlug;
    let counter = 1;

    while (
      await Product.findOne({
        slug,
        store: storeId,
      })
    ) {
      slug = `${baseSlug}-${counter++}`;
    }

    const images = req.files?.length
      ? req.files.map((f) => `/uploads/images/${f.filename}`)
      : [];

    const product = await Product.create({
      title,
      slug,
      description,
      price,
      type,
      images,
      stock: type === "physical" ? Number(stock || 0) : null,
      store: storeId,
    });

    res.status(201).json(product);

  } catch (error) {
    res.status(500).json({
      message: "Failed to create product",
    });
  }
};

// ================= UPDATE PRODUCT =================
export const updateProduct = async (req, res) => {
  try {
    const storeId = req.user.store?._id;

    const product = await Product.findOne({
      _id: req.params.id,
      store: storeId,
    });

    if (!product) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    Object.assign(product, req.body);

    await product.save();

    res.json(product);

  } catch (error) {
    res.status(500).json({
      message: "Update failed",
    });
  }
};

// ================= DELETE PRODUCT =================
export const deleteProduct = async (req, res) => {
  try {
    const storeId = req.user.store?._id;

    const product = await Product.findOne({
      _id: req.params.id,
      store: storeId,
    });

    if (!product) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    await product.deleteOne();

    res.json({ message: "Product deleted" });

  } catch (error) {
    res.status(500).json({
      message: "Delete failed",
    });
  }
};
