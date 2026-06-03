import dotenv from "dotenv";
import fs from "node:fs";
import path from "node:path";
import { z } from "zod";

const apiRoot = path.resolve(__dirname, "..", "..");
const repoRoot = path.resolve(apiRoot, "..", "..");
const shouldOverrideLocalEnv = process.env.NODE_ENV !== "test";
const placeholderEnvValue = "replace-me";

dotenv.config({ path: path.join(repoRoot, ".env") });

const apiEnvPath = path.join(apiRoot, ".env");
if (fs.existsSync(apiEnvPath)) {
  const parsedApiEnv = dotenv.parse(fs.readFileSync(apiEnvPath));

  for (const [key, value] of Object.entries(parsedApiEnv)) {
    if (value === placeholderEnvValue && process.env[key] !== undefined) continue;
    if (process.env[key] === undefined || shouldOverrideLocalEnv) process.env[key] = value;
  }
}

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().default(4000),
  DATABASE_URL: z.string().url(),
  REDIS_URL: z.union([z.string().url(), z.literal("memory")]),
  JWT_ACCESS_SECRET: z.string().min(32),
  JWT_REFRESH_SECRET: z.string().min(32),
  JWT_ACCESS_EXPIRES_IN: z.string().default("15m"),
  JWT_REFRESH_DAYS: z.coerce.number().default(30),
  CORS_ORIGIN: z.string().default("http://localhost:5173"),
  WHATSAPP_VERIFY_TOKEN: z.string().min(8).refine((value) => value !== placeholderEnvValue),
  WHATSAPP_APP_SECRET: z.string().min(8).refine((value) => value !== placeholderEnvValue),
  WHATSAPP_ACCESS_TOKEN: z.string().min(8).refine((value) => value !== placeholderEnvValue),
  WHATSAPP_PHONE_NUMBER_ID: z.string().min(1).refine((value) => value !== placeholderEnvValue),
  CLOUDINARY_CLOUD_NAME: z.string().min(1),
  CLOUDINARY_API_KEY: z.string().min(1),
  CLOUDINARY_API_SECRET: z.string().min(1),
  BROADCAST_BATCH_SIZE: z.coerce.number().default(50),
  BROADCAST_DELAY_MS: z.coerce.number().default(1000)
});

export const env = envSchema.parse(process.env);
