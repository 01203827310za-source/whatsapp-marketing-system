import compression from "compression";
import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import morgan from "morgan";
import { env } from "./config/env";
import { errorMiddleware } from "./middlewares/error.middleware";
import { authRouter } from "./routes/auth.routes";
import { campaignRouter } from "./routes/campaign.routes";
import { customerRouter } from "./routes/customer.routes";
import { analyticsRouter } from "./routes/analytics.routes";
import { productRouter } from "./routes/product.routes";
import { webhookRouter } from "./routes/webhook.routes";
import { userRouter } from "./routes/user.routes";

export const createApp = () => {
  const app = express();

  app.use(helmet());
  app.use(cors({ origin: env.CORS_ORIGIN, credentials: true }));
  app.get("/", (_req, res) => {
  res.json({
    name: "WhatsApp Marketing System",
    status: "running",
    version: "1.0.0"
  });
});
  app.use(compression());
  app.use(cookieParser());
  app.use(morgan(env.NODE_ENV === "production" ? "combined" : "dev"));
  app.use(
    rateLimit({
      windowMs: 60_000,
      max: 300,
      standardHeaders: true,
      legacyHeaders: false
    })
  );
  app.use(
    express.json({
      limit: "2mb",
      verify: (req, _res, buf) => {
        (req as express.Request).rawBody = Buffer.from(buf);
      }
    })
  );

  app.get("/health", (_req, res) => res.json({ status: "ok", timestamp: new Date().toISOString() }));
  app.use("/api/auth", authRouter);
  app.use("/api/customers", customerRouter);
  app.use("/api/campaigns", campaignRouter);
  app.use("/api/products", productRouter);
  app.use("/api/analytics", analyticsRouter);
  app.use("/api/users", userRouter);
  app.use("/webhook/whatsapp", webhookRouter);
  app.use(errorMiddleware);

  return app;
};
