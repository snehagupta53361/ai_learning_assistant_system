import multer from "multer";

// Configure storage
const storage = multer.memoryStorage();

// File filter - only PDFs allowed
const fileFilter = (req, file, callback) => {
  if (file.mimetype === "application/pdf") {
    return callback(null, true);
  }
  callback(new Error("Only PDF files are allowed."), false);
};
// Configure multer upload
const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
});

export default upload;
