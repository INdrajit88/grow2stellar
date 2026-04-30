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

export function createApp() {
  const app = express();

  app.use(
    cors({
      origin: [env.clientOrigin, "http://localhost:3000", "http://localhost:3001", "http://localhost:3002"],
      credentials: true,
    }),
  );
  app.use(express.json({ limit: "1mb" }));

  app.get("/health", (req, res) => {
    res.json({ status: "ok", service: "grow2stellar-backend" });
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
