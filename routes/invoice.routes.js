import express from "express";
import protect from "../middlewares/auth.middleware.js";
import { authorizeRoles } from "../middlewares/role.middleware.js";
import { downloadInvoice } from "../controllers/invoice.controller.js";

const router = express.Router();

// 🔒 Download invoice (Customer / StoreOwner / Superadmin)
router.get(
  "/orders/:orderId/invoice",
  protect,
  authorizeRoles("customer", "storeOwner", "superadmin"),
  downloadInvoice
);

export default router;
