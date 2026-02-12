import express from "express";
import protect from "../middlewares/auth.middleware.js";
import { authorizeRoles } from "../middlewares/role.middleware.js";

import {
  createOrder,
  getMyOrders,
  getStoreOrders,
  updateOrderStatus,
  getAllOrdersSuperAdmin,
} from "../controllers/order.controller.js";

const router = express.Router();

/* ================= CUSTOMER ================= */

// Create order
router.post(
  "/",
  protect,
  authorizeRoles("customer"),
  createOrder
);

// Get my orders
router.get(
  "/my",
  protect,
  authorizeRoles("customer"),
  getMyOrders
);

/* ================= STORE OWNER ================= */

// Get store orders
router.get(
  "/store",
  protect,
  authorizeRoles("storeOwner"),
  getStoreOrders
);

// Update order status (store owner)
router.put(
  "/:id/status",
  protect,
  authorizeRoles("storeOwner"),
  updateOrderStatus
);

/* ================= SUPERADMIN ================= */

// Get all orders
router.get(
  "/all",
  protect,
  authorizeRoles("superadmin"),
  getAllOrdersSuperAdmin
);

export default router;
