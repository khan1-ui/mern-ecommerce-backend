import express from "express";
import { protect } from "../middlewares/auth.middleware.js";
import {
  createStripeSession,
  stripeWebhook,
} from "../controllers/payment.controller.js";

const router = express.Router();

/* Protected route */
router.post("/stripe/create-session", protect, createStripeSession);

/* Webhook route */
router.post(
  "/stripe/webhook",
  express.raw({ type: "application/json" }),
  stripeWebhook
);

export default router;
