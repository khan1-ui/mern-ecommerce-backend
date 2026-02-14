import Product from "../models/Product.js";
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

// ================= GET PRODUCT BY SLUG (STORE SAFE) =================
export const getProductBySlug = async (req, res) => {
  try {
    const { storeSlug, slug } = req.params;

    // 1️⃣ Find store by slug
    const store = await Store.findOne({ slug: storeSlug });

    if (!store) {
      return res.status(404).json({
        message: "Store not found",
      });
    }

    // 2️⃣ Find product inside that store
    const product = await Product.findOne({
      store: store._id,
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
    console.error("GET PRODUCT ERROR:", error);
    res.status(500).json({
      message: "Failed to fetch product",
    });
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
