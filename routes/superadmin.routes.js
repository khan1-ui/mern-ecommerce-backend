import express from "express";
import protect from "../middlewares/auth.middleware.js";
import { authorizeRoles } from "../middlewares/role.middleware.js";
import {
  getPlatformStats,
  getAllUsers,
  getAllStores,
  getAllProducts,
} from "../controllers/superadmin.controller.js";

const router = express.Router();

// 🔥 Platform Stats
router.get(
  "/stats",
  protect,
  authorizeRoles("superadmin"),
  getPlatformStats
);

// 🔥 Get all users
router.get(
  "/users",
  protect,
  authorizeRoles("superadmin"),
  getAllUsers
);

// 🔥 Get all stores
router.get(
  "/stores",
  protect,
  authorizeRoles("superadmin"),
  getAllStores
);

// 🔥 Get all products (global)
router.get(
  "/products",
  protect,
  authorizeRoles("superadmin"),
  getAllProducts
);

export default router;
