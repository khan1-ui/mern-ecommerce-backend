import express from 'express';
import { protect } from './../middlewares/auth.middleware';
import { createStripeSession,stripeWebhook } from '../controllers/payment.controller';
router.post("/stripe/create-session", protect, createStripeSession);
router.post("/stripe/webhook", express.raw({ type: "application/json" }), stripeWebhook);
