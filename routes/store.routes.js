import express from "express";
import multer from "multer";
import Store from "../models/Store.js";
import Product from "../models/Product.js";
import { protect } from "../middlewares/auth.middleware.js";

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
router.put("/settings", protect, async (req, res) => {
  try {
    const store = await Store.findById(req.user.store._id);

    if (!store) {
      return res.status(404).json({
        message: "Store not found",
      });
    }

    store.name = req.body.name || store.name;
    store.description = req.body.description || store.description;
    store.logo = req.body.logo || store.logo;
    store.banner = req.body.banner || store.banner;
    store.themeColor = req.body.themeColor || store.themeColor;

    const updatedStore = await store.save();

    res.json(updatedStore);

  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});
const upload = multer({ storage: multer.memoryStorage() });

router.post(
  "/import-products",
  protect,
  upload.single("file"),
  async (req, res) => {
    try {
      if (!req.user.store) {
        return res.status(403).json({
          message: "You do not own a store",
        });
      }

      if (!req.file) {
        return res.status(400).json({
          message: "No file uploaded",
        });
      }

      const jsonData = JSON.parse(
        req.file.buffer.toString()
      );

      if (!Array.isArray(jsonData)) {
        return res.status(400).json({
          message: "Invalid JSON format",
        });
      }

      // 🔥 attach store automatically
      const productsWithStore = jsonData.map(
        (item) => ({
          ...item,
          store: req.user.store._id,
        })
      );

      await Product.insertMany(productsWithStore, {
        ordered: false,
      });

      res.json({
        message: "Products imported successfully",
      });

    } catch (error) {
      console.error("IMPORT ERROR:", error);
      res.status(500).json({
        message: "Import failed",
      });
    }
  }
);
export default router;
