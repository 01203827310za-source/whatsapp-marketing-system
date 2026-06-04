import { v2 as cloudinary } from "cloudinary";
import { env } from "../config/env";
import { HttpError } from "../utils/http";

const allowedTypes = new Set(["image/jpeg", "image/png", "image/webp"]);
const imageUploadNotConfiguredMessage = "Image upload service is not configured";
const cloudinaryCredentialNames = ["CLOUDINARY_CLOUD_NAME", "CLOUDINARY_API_KEY", "CLOUDINARY_API_SECRET"] as const;

type CloudinaryError = Error & {
  http_code?: number;
  name?: string;
};

const getCloudinaryCredentialStatus = () => {
  const values = {
    CLOUDINARY_CLOUD_NAME: env.CLOUDINARY_CLOUD_NAME,
    CLOUDINARY_API_KEY: env.CLOUDINARY_API_KEY,
    CLOUDINARY_API_SECRET: env.CLOUDINARY_API_SECRET
  };
  const missing = cloudinaryCredentialNames.filter((name) => !values[name]);
  return {
    available: missing.length === 0,
    missing,
    values
  };
};

const cloudinaryCredentialStatus = getCloudinaryCredentialStatus();

if (cloudinaryCredentialStatus.available) {
  cloudinary.config({
    cloud_name: cloudinaryCredentialStatus.values.CLOUDINARY_CLOUD_NAME,
    api_key: cloudinaryCredentialStatus.values.CLOUDINARY_API_KEY,
    api_secret: cloudinaryCredentialStatus.values.CLOUDINARY_API_SECRET,
    secure: true
  });
  console.log("[image-upload] Cloudinary configured", {
    cloudNamePresent: true,
    apiKeyPresent: true,
    apiSecretPresent: true
  });
} else {
  console.warn("[image-upload] Cloudinary unavailable", {
    reason: "missing credentials",
    missing: cloudinaryCredentialStatus.missing
  });
}

const logImageProviderError = (error: unknown) => {
  const providerError = error as Partial<CloudinaryError> | undefined;
  console.error("[image-upload] Cloudinary upload failed", {
    message: providerError?.message,
    name: providerError?.name,
    http_code: providerError?.http_code
  });
  if (error instanceof Error) console.error(error.stack);
};

const isCloudinaryConfigurationError = (error: unknown) => {
  const providerError = error as Partial<CloudinaryError> | undefined;
  const message = providerError?.message?.toLowerCase() ?? "";
  return message.includes("must supply api_key") || message.includes("must supply cloud_name") || message.includes("must supply api_secret");
};

export const uploadService = {
  validateImage(file: Express.Multer.File) {
    if (!allowedTypes.has(file.mimetype)) throw new HttpError(422, "Only jpeg, png, and webp images are allowed");
    if (file.size > 5 * 1024 * 1024) throw new HttpError(422, "Image must be 5MB or less");
  },

  async uploadImage(file: Express.Multer.File) {
    this.validateImage(file);
    const credentialStatus = getCloudinaryCredentialStatus();
    if (!credentialStatus.available) {
      console.warn("[image-upload] Upload rejected before provider call", {
        reason: "missing credentials",
        missing: credentialStatus.missing
      });
      throw new HttpError(503, imageUploadNotConfiguredMessage, { missing: credentialStatus.missing });
    }
    try {
      const result = await new Promise<{ secure_url: string }>((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: "factory-whatsapp", resource_type: "image" },
          (error, uploadResult) => {
            if (error) reject(error);
            else if (!uploadResult) reject(new Error("Cloudinary upload did not return a result"));
            else resolve({ secure_url: uploadResult.secure_url });
          }
        );
        stream.end(file.buffer);
      });
      return { imageUrl: result.secure_url };
    } catch (error) {
      logImageProviderError(error);
      if (isCloudinaryConfigurationError(error)) throw new HttpError(503, imageUploadNotConfiguredMessage);
      if ((error as Partial<CloudinaryError> | undefined)?.http_code === 401) {
        throw new HttpError(502, "Image upload credentials were rejected by Cloudinary");
      }
      throw new HttpError(502, "Image upload failed");
    }
  }
};
