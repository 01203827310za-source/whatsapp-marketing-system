import dotenv from "dotenv";
import fs from "node:fs";
import path from "node:path";
import { z } from "zod";

const apiRoot = path.resolve(__dirname, "..", "..");
const repoRoot = path.resolve(apiRoot, "..", "..");
const shouldOverrideLocalEnv = process.env.NODE_ENV !== "test";
const placeholderEnvValue = "replace-me";
const configuredEnvValue = (name: string, minLength = 1) =>
  z
    .string({ required_error: `${name} is required` })
    .min(minLength, minLength === 1 ? `${name} is required` : `${name} must be at least ${minLength} characters`)
    .refine((value) => value !== placeholderEnvValue, `${name} must be configured; replace the default "replace-me" value`);
const optionalConfiguredEnvValue = () =>
  z
    .string()
    .optional()
    .transform((value) => (value === placeholderEnvValue ? undefined : value))
    .pipe(z.string().min(1).optional());

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
  CORS_ORIGIN: z.string().optional(),
  WHATSAPP_VERIFY_TOKEN: configuredEnvValue("WHATSAPP_VERIFY_TOKEN", 8),
  WHATSAPP_APP_SECRET: configuredEnvValue("WHATSAPP_APP_SECRET", 8),
  WHATSAPP_ACCESS_TOKEN: configuredEnvValue("WHATSAPP_ACCESS_TOKEN", 8),
  WHATSAPP_PHONE_NUMBER_ID: configuredEnvValue("WHATSAPP_PHONE_NUMBER_ID"),
  CLOUDINARY_CLOUD_NAME: optionalConfiguredEnvValue(),
  CLOUDINARY_API_KEY: optionalConfiguredEnvValue(),
  CLOUDINARY_API_SECRET: optionalConfiguredEnvValue(),
  BROADCAST_BATCH_SIZE: z.coerce.number().default(50),
  BROADCAST_DELAY_MS: z.coerce.number().default(1000)
});

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  console.error("Invalid environment configuration:");
  for (const issue of parsedEnv.error.issues) {
    console.error(`- ${issue.path.join(".") || "env"}: ${issue.message}`);
  }
  throw new Error("Invalid environment configuration");
}

export const env = parsedEnv.data;
export const corsOrigins =
  env.CORS_ORIGIN?.split(",")
    .map((origin) => origin.trim())
    .filter(Boolean) ?? [];
