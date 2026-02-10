import express from "express";
import protect from "../middlewares/auth.middleware.js";
import admin from "../middlewares/admin.middleware.js";
import {
  uploadImages,
  uploadDigital,
} from "../utils/fileUpload.js";


import {
  createProduct,
  createDigitalProduct,
  getAllProductsAdmin,
  deleteProduct,
  updateProduct,
  getProductByIdAdmin,
} from "../controllers/product.controller.js";

import {
  updateOrderStatus,
  getAllOrdersAdmin,
} from "../controllers/order.controller.js";

import { getAllUsers,getAdminStats,getRevenueStats,} from "../controllers/admin.controller.js";

const router = express.Router();

/* ======================================================
   PRODUCT MANAGEMENT (ADMIN)
====================================================== */
router.get("/users", protect, admin, getAllUsers);
router.get("/stats", protect, admin, getAdminStats);
router.get("/revenue",protect,admin, getRevenueStats);

// Get all products (digital + physical)
router.get("/products",protect,admin,getAllProductsAdmin);

// Physical product (images)
router.post("/products",protect,admin,uploadImages,createProduct);

// Digital product (file)
router.post("/products/digital",protect,admin,uploadDigital,createDigitalProduct);

// Delete product
router.delete("/products/:id",protect,admin,deleteProduct);
router.get("/products/:id",protect,admin,getProductByIdAdmin);
// Update product (with optional images)
router.put("/products/:id",protect,admin,uploadImages,updateProduct);



/* ======================================================
   ORDER MANAGEMENT (ADMIN)
====================================================== */

// Update order status (paid → shipped → delivered)
router.put("/orders/:id/status", protect, admin,updateOrderStatus);
router.get("/orders",protect,admin,getAllOrdersAdmin);


export default router;
