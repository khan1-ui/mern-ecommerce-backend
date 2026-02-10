import express from "express";
import protect from "../middlewares/auth.middleware.js";
import { downloadDigitalProduct } from "../controllers/download.controller.js";

const router = express.Router();

router.get("/:productId", protect, downloadDigitalProduct);

export default router;
