import express from "express";
import {
  getProductsByStore,
  getProductBySlug,
} from "../controllers/product.controller.js";

const router = express.Router();

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
