import express from "express";
import protect from "../middlewares/auth.middleware.js";
import { authorizeRoles } from "../middlewares/role.middleware.js";

import {
  updateStoreSettings,
  getStoreBySlug,
} from "../controllers/storeOwner.controller.js";

const router = express.Router();

/* ================= STORE OWNER ================= */

router.put(
  "/settings",
  protect,
  authorizeRoles("storeOwner"),
  updateStoreSettings
);

/* ================= PUBLIC ================= */

// ⚠️ Always keep dynamic route at bottom
router.get("/:slug", getStoreBySlug);

export default router;
