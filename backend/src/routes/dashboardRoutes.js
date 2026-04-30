import { Router } from "express";
import { getGlobalStats, getLeaderboard } from "../controllers/dashboardController.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { optionalWalletAuth } from "../middleware/optionalWalletAuth.js";

export const dashboardRoutes = Router();

dashboardRoutes.get("/stats", optionalWalletAuth, asyncHandler(getGlobalStats));
dashboardRoutes.get("/leaderboard", optionalWalletAuth, asyncHandler(getLeaderboard));
