import multer from "multer";
import path from "path";
import fs from "fs";

const __dirname = path.resolve();

// ================= CREATE FOLDERS =================
const imagePath = path.join(__dirname, "uploads/images");
const filePath = path.join(__dirname, "uploads/files");

if (!fs.existsSync(imagePath)) {
  fs.mkdirSync(imagePath, { recursive: true });
}

if (!fs.existsSync(filePath)) {
  fs.mkdirSync(filePath, { recursive: true });
}

// ================= STORAGE =================
const storage = multer.diskStorage({
  destination(req, file, cb) {
    if (file.fieldname === "images") {
      cb(null, imagePath);
    } else if (file.fieldname === "file") {
      cb(null, filePath);
    } else {
      cb(new Error("Invalid field"), false);
    }
  },
  filename(req, file, cb) {
    cb(null, `${Date.now()}${path.extname(file.originalname)}`);
  },
});

// ================= FILE FILTER =================
const fileFilter = (req, file, cb) => {
  const imageTypes = /jpg|jpeg|png|webp/;
  const docTypes = /pdf|zip/;

  const ext = path.extname(file.originalname).toLowerCase();

  if (file.fieldname === "images" && imageTypes.test(ext)) {
    cb(null, true);
  } else if (file.fieldname === "file" && docTypes.test(ext)) {
    cb(null, true);
  } else {
    cb(new Error("Unsupported file type"), false);
  }
};

// ================= EXPORTS =================
export const uploadImages = multer({
  storage,
  fileFilter,
}).array("images", 5);

export const uploadDigital = multer({
  storage,
  fileFilter,
}).single("file");
