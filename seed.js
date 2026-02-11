import mongoose from "mongoose";
import dotenv from "dotenv";
import Product from "./models/Product.js";
import products from "./data/products.js";

dotenv.config();

mongoose.connect(process.env.MONGO_URI);

const importData = async () => {
  try {
    await Product.deleteMany();
    await Product.insertMany(products);
    console.log("Data Imported!");
    process.exit();
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

importData();
