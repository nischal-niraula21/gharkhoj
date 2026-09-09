import fs from "fs/promises";
import path from "path";
import crypto from "crypto";
import { v2 as cloudinary } from "cloudinary";

const cloudinaryEnabled = Boolean(
  process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET
);

if (cloudinaryEnabled) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
}

const uploadCloudinary = (buffer) =>
  new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: process.env.CLOUDINARY_FOLDER || "gharkhoj/rooms", resource_type: "image", transformation: [{ quality: "auto", fetch_format: "auto" }] },
      (error, result) => (error ? reject(error) : resolve({ url: result.secure_url, publicId: result.public_id }))
    );
    stream.end(buffer);
  });

export const uploadImage = async (file, baseUrl) => {
  if (cloudinaryEnabled) return uploadCloudinary(file.buffer);

  const extByType = { "image/jpeg": ".jpg", "image/png": ".png", "image/webp": ".webp", "image/gif": ".gif" };
  const ext = extByType[file.mimetype] || ".jpg";
  const fileName = `${Date.now()}-${crypto.randomBytes(8).toString("hex")}${ext}`;
  const uploadDir = path.resolve("server/uploads");
  await fs.mkdir(uploadDir, { recursive: true });
  await fs.writeFile(path.join(uploadDir, fileName), file.buffer);
  return { url: `${baseUrl}/uploads/${fileName}`, publicId: `local:${fileName}` };
};

export const deleteImage = async (image) => {
  if (!image?.publicId) return;
  if (image.publicId.startsWith("local:")) {
    const fileName = image.publicId.slice(6);
    await fs.unlink(path.resolve("server/uploads", fileName)).catch(() => { });
    return;
  }
  if (cloudinaryEnabled) await cloudinary.uploader.destroy(image.publicId).catch(() => { });
};
