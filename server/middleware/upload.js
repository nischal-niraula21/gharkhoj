import multer from "multer";

const storage = multer.memoryStorage();
export const roomUpload = multer({
  storage,
  limits: { fileSize: 6 * 1024 * 1024, files: 10 },
  fileFilter: (_req, file, cb) => {
    if (!file.mimetype.startsWith("image/")) return cb(new Error("Only image files are allowed"));
    cb(null, true);
  },
});
