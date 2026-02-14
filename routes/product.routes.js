import express from "express";
import {
  getProductsByStore,
  getProductBySlug,
} from "../controllers/product.controller.js";

const router = express.Router();
// 🔥 Get all published products (Marketplace)
router.get("/", async (req, res) => {
  try {
    const products = await Product.find({
      isPublished: true,
      store: { $exists: true }
    });

    res.json(products);
  } catch (error) {
    console.error("MARKETPLACE ERROR:", error);
    res.status(500).json({
      message: "Failed to fetch products",
    });
  }
});

// 🔥 Get products by store
router.get(
  "/store/:storeId/products",
  getProductsByStore
);

// 🔥 Get single product by slug inside store
router.get(
  "/store/:storeId/products/:slug",
  getProductBySlug
);

export default router;
