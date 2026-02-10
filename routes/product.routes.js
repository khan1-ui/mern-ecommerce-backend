import express from "express";
import {
  getProducts,
  getProductBySlug,
  getProductStats, 
  
} from "../controllers/product.controller.js";

const router = express.Router();

// Public routes
router.get("/", getProducts);
router.get("/stats", getProductStats);   
router.get("/:slug", getProductBySlug);


export default router;
