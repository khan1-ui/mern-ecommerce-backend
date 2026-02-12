import express from "express";
import protect from "../middlewares/auth.middleware.js";
import { authorizeRoles } from "../middlewares/role.middleware.js";
import { downloadDigitalProduct } from "../controllers/download.controller.js";

const router = express.Router();

// 🔒 Download digital product
router.get(
  "/:productId",
  protect,
  authorizeRoles("customer", "storeOwner", "superadmin"),
  downloadDigitalProduct
);

export default router;
