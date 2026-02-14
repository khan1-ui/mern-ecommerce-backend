import express from "express";
import protect from "../middlewares/auth.middleware.js";
import {
  getCart,
  addToCart,
  removeFromCart,
} from "../controllers/cart.controller.js";

const router = express.Router();

router.get("/", protect, getCart);
router.post("/", protect, addToCart);
router.delete("/:productId", protect, removeFromCart);

export default router;
