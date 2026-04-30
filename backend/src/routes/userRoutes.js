import { Router } from "express";
import { getMe, updateMe } from "../controllers/userController.js";
import { requireWalletAuth } from "../middleware/requireWalletAuth.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const userRoutes = Router();

userRoutes.get("/me", requireWalletAuth, asyncHandler(getMe));
userRoutes.patch("/me", requireWalletAuth, asyncHandler(updateMe));
