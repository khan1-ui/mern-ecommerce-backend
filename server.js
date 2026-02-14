import express from "express";
import dotenv from "dotenv";
import path from "path";
import fs from "fs";
import cors from "cors";

import connectDB from "./config/db.js";

// ------------------ ROUTES ------------------
import superAdminRoutes from "./routes/superadmin.routes.js";
import storeOwnerRoutes from "./routes/storeOwner.routes.js";
import authRoutes from "./routes/auth.routes.js";
import productRoutes from "./routes/product.routes.js";
import orderRoutes from "./routes/order.routes.js";
import downloadRoutes from "./routes/download.routes.js";
import invoiceRoutes from "./routes/invoice.routes.js";
import cartRoutes from "./routes/cart.routes.js"
// ------------------ CONFIG ------------------
dotenv.config();

const app = express();
app.disable("x-powered-by");
const __dirname = path.resolve();

console.log("🚀 Starting Server...");

// ------------------ DATABASE ------------------
connectDB().catch((err) => {
  console.error("❌ DB CONNECTION FAILED");
  process.exit(1);
});

// ------------------ CORS ------------------
const allowedOrigins = (
  process.env.ALLOWED_ORIGINS ||
  "http://localhost:5173"
).split(",");

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);

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

// ------------------ UPLOAD FOLDER ------------------
const uploadPath = path.join(__dirname, "uploads/images");

if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath, { recursive: true });
  console.log("📁 Upload folder created");
}

// ⚠️ NOTE: For production SaaS use Cloudinary / S3 instead
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ------------------ API ROUTES ------------------

// 🔐 Authentication
app.use("/api/auth", authRoutes); 

// 👑 Super Admin
app.use("/api/superadmin", superAdminRoutes);

// 🏪 Store Owner
app.use("/api/store-owner", storeOwnerRoutes);

// 🛍 Public Products
app.use("/api/products", productRoutes); 

// 📦 Orders
app.use("/api/orders", orderRoutes);
app.use("/api/cart", cartRoutes);

// 📄 Downloads & Invoice
app.use("/api/download", downloadRoutes);
app.use("/api/invoice", invoiceRoutes);


// ------------------ ROOT ------------------
app.get("/", (req, res) => {
  res.send("🚀 SaaS API is running...");
});

// ------------------ 404 HANDLER ------------------
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});
app.get("/test", (req, res) => {
  res.send("Server working");
});

// ------------------ GLOBAL ERROR HANDLER ------------------
app.use((err, req, res, next) => {
  console.error("🔥 SERVER ERROR:", err.message);

  res.status(err.statusCode || 500).json({
    success: false,
    message:
      process.env.NODE_ENV === "production"
        ? "Internal Server Error"
        : err.message,
  });
});

// ------------------ SERVER START ------------------
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
