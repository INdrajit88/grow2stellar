import { Router } from "express";
import { requestChallenge, verifyChallenge } from "../controllers/authController.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const authRoutes = Router();

authRoutes.post("/nonce", asyncHandler(requestChallenge));
authRoutes.post("/challenge", asyncHandler(requestChallenge));
authRoutes.post("/verify", asyncHandler(verifyChallenge));
