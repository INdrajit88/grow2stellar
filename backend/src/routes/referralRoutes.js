import { Router } from "express";
import {
  getMyReferrals,
  trackReferralApi,
} from "../controllers/referralController.js";
import { requireWalletAuth } from "../middleware/requireWalletAuth.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const referralRoutes = Router();

referralRoutes.get("/me", requireWalletAuth, asyncHandler(getMyReferrals));
referralRoutes.post("/:referralCode/click", asyncHandler(trackReferralApi));
