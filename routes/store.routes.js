import express from "express";
import protect from "../middlewares/auth.middleware.js";
import { authorizeRoles } from "../middlewares/role.middleware.js";

import {
  getStoreBySlug,
  updateStoreSettings,
  getStoreStats,
  getStoreRevenue,
} from "../controllers/storeOwner.controller.js";

const router = express.Router();

/* ================= PUBLIC ================= */

// Get store by slug (public)
router.get("/:slug", getStoreBySlug);

/* ================= STORE OWNER ================= */

// Update store settings
router.put(
  "/settings",
  protect,
  authorizeRoles("storeOwner"),
  updateStoreSettings
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
