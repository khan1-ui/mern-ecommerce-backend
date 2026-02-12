import fs from "fs";
import path from "path";
import Product from "../models/Product.js";
import Order from "../models/Order.js";

export const downloadDigitalProduct = async (req, res) => {
  try {
    const userId = req.user._id;
    const { productId } = req.params;

    const product = await Product.findById(productId);

    if (!product || product.type !== "digital") {
      return res.status(404).json({
        message: "Digital product not found",
      });
    }

    // 🔐 Role-based access
    const isSuperAdmin =
      req.user.role === "superadmin";

    const isStoreOwner =
      req.user.store &&
      product.store.toString() ===
        req.user.store._id.toString();

    let hasPurchased = false;

    if (!isSuperAdmin && !isStoreOwner) {
      const order = await Order.findOne({
        user: userId,
        store: product.store,
        paymentStatus: "paid",
        "items.product": productId,
      });

      if (!order) {
        return res.status(403).json({
          message:
            "You have not purchased this product",
        });
      }

      hasPurchased = true;
    }

    // 🔒 File path security
    const uploadsDir = path.join(
      process.cwd(),
      "uploads"
    );

    const filePath = path.join(
      process.cwd(),
      product.digitalFile
    );

    // Ensure file is inside uploads directory
    if (!filePath.startsWith(uploadsDir)) {
      return res.status(403).json({
        message: "Invalid file path",
      });
    }

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        message: "File not found on server",
      });
    }

    res.download(filePath);

  } catch (error) {
    console.error("DOWNLOAD ERROR:", error);
    res.status(500).json({
      message: "Download failed",
    });
  }
};
