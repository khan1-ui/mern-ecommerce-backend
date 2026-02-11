import express from "express";
import Store from "../models/Store.js";
import Product from "../models/Product.js";

const router = express.Router();

router.get("/:slug", async (req, res) => {
  try {
    const store = await Store.findOne({ slug: req.params.slug });

    if (!store) {
      return res.status(404).json({ message: "Store not found" });
    }

    const products = await Product.find({
      store: store._id,
      isPublished: true,
    });

    res.json({
      store,
      products,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
