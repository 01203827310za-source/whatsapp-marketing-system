import type { ErrorRequestHandler } from "express";
import { ZodError } from "zod";
import { HttpError } from "../utils/http";

export const errorMiddleware: ErrorRequestHandler = (error, _req, res, _next) => {
  if (error instanceof ZodError) {
    return res.status(422).json({ message: "Validation failed", issues: error.flatten() });
  }

  if (error instanceof HttpError) {
    return res.status(error.status).json({ message: error.message, details: error.details });
  }

  console.error(error);
  return res.status(500).json({
    message: "Internal server error"
  });
};
