import express from "express";
import multer from "multer";

import protect from "../middlewares/auth.middleware.js";
import { authorizeRoles } from "../middlewares/role.middleware.js";

import {
  createProduct,
  getMyProducts,
  updateProduct,
  deleteProduct,
} from "../controllers/product.controller.js";
import { getStoreStats,
        getStoreRevenue, 
        getMyStoreOrders,
        updateOrderStatusByStoreOwner,
        updateStoreSettings,
        getStoreBySlug,       
        } from "../controllers/storeOwner.controller.js";

import { importStoreProducts } from "../controllers/storeImport.controller.js";

const router = express.Router();

// 🔒 Multer config with limit
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});

// 🔥 Create product
router.post(
  "/products",
  protect,
  authorizeRoles("storeOwner"),
  createProduct
);

// 🔥 Get own store products
router.get(
  "/products",
  protect,
  authorizeRoles("storeOwner"),
  getMyProducts
);

// 🔥 Update product
router.put(
  "/products/:id",
  protect,
  authorizeRoles("storeOwner"),
  updateProduct
);

// 🔥 Delete product
router.delete(
  "/products/:id",
  protect,
  authorizeRoles("storeOwner"),
  deleteProduct
);

// 🔥 Import JSON for store
router.post(
  "/import",
  protect,
  authorizeRoles("storeOwner"),
  upload.single("file"),
  importStoreProducts
);
router.get(
  "/stats",
  protect,
  authorizeRoles("storeOwner"),
  getStoreStats
);

router.get(
  "/revenue", 
  protect,
  authorizeRoles("storeOwner"),
  getStoreRevenue
);
export default router;
router.get(
  "/orders",
  protect,
  authorizeRoles("storeOwner"),
  getMyStoreOrders
);

// 🔥 Update order status
router.put(
  "/:orderId/status",
  protect,
  authorizeRoles("storeOwner"),
  updateOrderStatusByStoreOwner
);
 router.put(
  "/settings",
  protect, 
  authorizeRoles("storeOwner"),
  updateStoreSettings
);
// ⚠️ Always keep dynamic route at bottom
router.get("/store/:slug", getStoreBySlug);