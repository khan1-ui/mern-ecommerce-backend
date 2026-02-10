import multer from "multer";
import path from "path";

// ================= STORAGE =================
const storage = multer.diskStorage({
  destination(req, file, cb) {
    if (file.fieldname === "images") {
      cb(null, "uploads/images");
    } else if (file.fieldname === "file") {
      cb(null, "uploads/files");
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
