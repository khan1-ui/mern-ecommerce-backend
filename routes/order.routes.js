import express from "express";
import protect from "../middlewares/auth.middleware.js";
import {
  createOrder,
  getMyOrders,
  updateOrderStatus,
} from "../controllers/order.controller.js";

const router = express.Router();

// USER
router.post("/", protect, createOrder);
router.get("/my", protect, getMyOrders);

// ADMIN (later protect with admin middleware)
router.put("/:id/status", protect, updateOrderStatus);

export default router;
