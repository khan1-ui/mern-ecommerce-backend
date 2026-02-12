import Product from "../models/Product.js";
import slugify from "slugify";
import mongoose from "mongoose";

export const importStoreProducts = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    if (!req.user?.store) {
      return res.status(403).json({
        message: "You don't have a store",
      });
    }

    if (!req.file) {
      return res.status(400).json({
        message: "No file uploaded",
      });
    }

    const storeId = req.user.store._id;

    // 🔒 Parse JSON safely
    let jsonData;

    try {
      jsonData = JSON.parse(
        req.file.buffer.toString()
      );
    } catch {
      return res.status(400).json({
        message: "Invalid JSON file",
      });
    }

    if (!Array.isArray(jsonData)) {
      return res.status(400).json({
        message: "JSON must be an array",
      });
    }

    if (jsonData.length > 500) {
      return res.status(400).json({
        message: "Maximum 500 products allowed per import",
      });
    }

    const productsToInsert = [];

    for (let item of jsonData) {
      if (!item.title || !item.price) {
        throw new Error(
          "Product title and price required"
        );
      }

      const type =
        item.type === "digital"
          ? "digital"
          : "physical";

      let baseSlug = slugify(item.title, {
        lower: true,
        strict: true,
      });

      let slug = baseSlug;
      let counter = 1;

      while (
        await Product.findOne({
          slug,
          store: storeId,
        }).session(session)
      ) {
        slug = `${baseSlug}-${counter++}`;
      }

      productsToInsert.push({
        title: item.title,
        slug,
        description: item.description || "",
        price: Number(item.price),
        type,
        images: Array.isArray(item.images)
          ? item.images
          : [],
        stock:
          type === "physical"
            ? Number(item.stock || 0)
            : null,
        store: storeId,
        isPublished: true,
      });
    }

    await Product.insertMany(productsToInsert, {
      session,
    });

    await session.commitTransaction();

    res.json({
      message: "Products imported successfully",
      count: productsToInsert.length,
    });

  } catch (error) {
    await session.abortTransaction();

    console.error("STORE IMPORT ERROR:", error);

    res.status(500).json({
      message: error.message || "Import failed",
    });
  } finally {
    session.endSession();
  }
};
