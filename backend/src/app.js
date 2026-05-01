import cors from "cors";
import express from "express";
import { env } from "./config/env.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { asyncHandler } from "./utils/asyncHandler.js";
import { authRoutes } from "./routes/authRoutes.js";
import { campaignRoutes } from "./routes/campaignRoutes.js";
import { redirectReferral } from "./controllers/referralController.js";
import { referralRoutes } from "./routes/referralRoutes.js";
import { userRoutes } from "./routes/userRoutes.js";
import { questRoutes } from "./routes/questRoutes.js";
import { dashboardRoutes } from "./routes/dashboardRoutes.js";

const ALLOWED_ORIGINS = [
  "http://localhost:3000",
  "http://localhost:3001",
  "http://localhost:3002",
  "https://grow2stellar.vercel.app",
  env.clientOrigin,
].filter(Boolean);

export function createApp() {
  const app = express();

  // Trust Vercel's proxy
  app.set("trust proxy", 1);

  app.use(
    cors({
      origin: (origin, callback) => {
        // Allow requests with no origin (curl, Postman, server-to-server)
        if (!origin) return callback(null, true);
        if (ALLOWED_ORIGINS.includes(origin)) return callback(null, true);
        callback(new Error(`CORS: origin ${origin} not allowed`));
      },
      credentials: true,
    }),
  );

  // Handle CORS preflight for all routes
  app.options("*", cors());

  app.use(express.json({ limit: "1mb" }));

  app.get("/health", (req, res) => {
    res.json({ status: "ok", service: "grow2stellar-backend", env: process.env.NODE_ENV });
  });

  app.get("/r/:referralCode", asyncHandler(redirectReferral));

  app.use("/api/auth", authRoutes);
  app.use("/api/campaigns", campaignRoutes);
  app.use("/api/referrals", referralRoutes);
  app.use("/api/users", userRoutes);
  app.use("/api/quests", questRoutes);
  app.use("/api/dashboard", dashboardRoutes);

  app.use(errorHandler);

  return app;
}
