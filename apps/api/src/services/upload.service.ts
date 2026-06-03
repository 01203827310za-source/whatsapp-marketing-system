import { v2 as cloudinary } from "cloudinary";
import { env } from "../config/env";
import { HttpError } from "../utils/http";

cloudinary.config({
  cloud_name: env.CLOUDINARY_CLOUD_NAME,
  api_key: env.CLOUDINARY_API_KEY,
  api_secret: env.CLOUDINARY_API_SECRET
});

const allowedTypes = new Set(["image/jpeg", "image/png", "image/webp"]);

export const uploadService = {
  validateImage(file: Express.Multer.File) {
    if (!allowedTypes.has(file.mimetype)) throw new HttpError(422, "Only jpeg, png, and webp images are allowed");
    if (file.size > 5 * 1024 * 1024) throw new HttpError(422, "Image must be 5MB or less");
  },

  async uploadImage(file: Express.Multer.File) {
    this.validateImage(file);
    const result = await new Promise<{ secure_url: string }>((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder: "factory-whatsapp", resource_type: "image" },
        (error, uploadResult) => {
          if (error || !uploadResult) reject(error);
          else resolve({ secure_url: uploadResult.secure_url });
        }
      );
      stream.end(file.buffer);
    });
    return { imageUrl: result.secure_url };
  }
};
