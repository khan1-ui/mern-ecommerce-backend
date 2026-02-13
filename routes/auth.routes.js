import express from "express";
import {
  registerUser,
  loginUser,
  updateProfile,
  getMe,
} from "../controllers/auth.controller.js";
import protect from "../middlewares/auth.middleware.js";

const router = express.Router();

// Public Routes
router.post("/register", registerUser);
router.post("/login", loginUser);
router.put("/profile", protect, updateProfile);

// Protected Route
router.get("/me", protect, getMe);

export default router;
