import express from "express";
import dotenv from "dotenv";
import path from "path";
import fs from "fs";
import cors from "cors";

import connectDB from "./config/db.js";

import authRoutes from "./routes/auth.routes.js";
import productRoutes from "./routes/product.routes.js";
import orderRoutes from "./routes/order.routes.js";
import adminRoutes from "./routes/admin.routes.js";
import downloadRoutes from "./routes/download.routes.js";
import invoiceRoutes from "./routes/invoice.routes.js";

// ------------------ CONFIG ------------------
dotenv.config();
connectDB();

const app = express();
const __dirname = path.resolve();

console.log("🔥 EXPRESS RUNNING 🔥");

// ------------------ CORS ------------------
const allowedOrigins = [
  "http://localhost:5173",
  "https://mern-sell.netlify.app",
  "https://mern-ecommerce-sell.netlify.app",
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true); // allow Postman etc.

      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        console.log("❌ Blocked by CORS:", origin);
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);

// ------------------ BODY PARSER ------------------
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ------------------ UPLOAD FOLDER AUTO CREATE ------------------
const uploadPath = path.join(__dirname, "uploads/images");

if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath, { recursive: true });
  console.log("📁 Upload folder created");
}

// Static folder serve
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ------------------ ROUTES ------------------
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/download", downloadRoutes);
app.use("/api", invoiceRoutes);

// ------------------ ROOT ------------------
app.get("/", (req, res) => {
  res.send("🚀 API is running...");
});

// ------------------ GLOBAL ERROR HANDLER ------------------
app.use((err, req, res, next) => {
  console.error("🔥 SERVER ERROR:", err.message);
  res.status(500).json({
    message: err.message || "Server Error",
  });
});

// ------------------ SERVER ------------------
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
