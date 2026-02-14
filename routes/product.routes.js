import express from "express";
import Product from "../models/Product.js";
import { getProductsByStore,getProductBySlug } from "../controllers/product.controller.js";

const router = express.Router();

// 🔥 Marketplace - All published products
router.get("/", async (req, res) => {
  try {
    const products = await Product.find({
      isPublished: true,
      store: { $exists: true },
    }).populate("store", "name slug");

    res.json(products);
  } catch (error) {
    console.error("MARKETPLACE ERROR:", error);
    res.status(500).json({
      message: "Failed to fetch products",
    });
  }
});

// 🔥 Get products by storeId (admin use)
router.get("/store/:storeId/products", getProductsByStore);

// 🔥 NEW: Get single product by storeSlug + productSlug
router.get(
  "/store/:storeSlug/product/:slug",getProductBySlug);

export default router;
