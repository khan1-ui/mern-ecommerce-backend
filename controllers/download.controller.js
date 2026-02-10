import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import Product from "../models/Product.js";
import Order from "../models/Order.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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
    const order = await Order.findOne({
      user: userId,
      "items.product": productId,
    });

    if (!order) {
      return res.status(403).json({
        message: "You have not purchased this product",
      });
    }    
    const relativePath = product.digitalFile.replace(/^\/+/, "");   
    const filePath = path.join(
      process.cwd(),          
      relativePath
    );  

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        message: "File not found on server",
      });
    }

    res.download(filePath);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Download failed",
    });
  }
};
