import { Router } from "express";
import {
  applyToCampaign,
  approveAmbassador,
  listCampaignApplications,
  rejectAmbassador,
} from "../controllers/ambassadorController.js";
import {
  createCampaign,
  getCampaign,
  listCampaigns,
  listMarketplaceCampaigns,
  getCampaignByInviteCode,
  joinCampaignByInvite,
} from "../controllers/campaignController.js";
import {
  createQuest,
  listQuests,
} from "../controllers/questController.js";
import { getCampaignStats } from "../controllers/referralController.js";
import { optionalWalletAuth } from "../middleware/optionalWalletAuth.js";
import { requireWalletAuth } from "../middleware/requireWalletAuth.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const campaignRoutes = Router();

campaignRoutes.get("/public/marketplace", optionalWalletAuth, asyncHandler(listMarketplaceCampaigns));
campaignRoutes.get("/invites/:inviteCode", optionalWalletAuth, asyncHandler(getCampaignByInviteCode));
campaignRoutes.post("/invites/:inviteCode/join", requireWalletAuth, asyncHandler(joinCampaignByInvite));
campaignRoutes.get("/", optionalWalletAuth, asyncHandler(listCampaigns));
campaignRoutes.post("/", requireWalletAuth, asyncHandler(createCampaign));
campaignRoutes.get("/:campaignId", optionalWalletAuth, asyncHandler(getCampaign));
campaignRoutes.get(
  "/:campaignId/referrals/stats",
  requireWalletAuth,
  asyncHandler(getCampaignStats),
);

campaignRoutes.post(
  "/:campaignId/quests",
  requireWalletAuth,
  asyncHandler(createQuest),
);
campaignRoutes.get(
  "/:campaignId/quests",
  optionalWalletAuth,
  asyncHandler(listQuests),
);

campaignRoutes.post(
  "/:campaignId/apply",
  requireWalletAuth,
  asyncHandler(applyToCampaign),
);
campaignRoutes.get(
  "/:campaignId/applications",
  requireWalletAuth,
  asyncHandler(listCampaignApplications),
);
campaignRoutes.patch(
  "/:campaignId/ambassadors/:ambassadorId/approve",
  requireWalletAuth,
  asyncHandler(approveAmbassador),
);
campaignRoutes.patch(
  "/:campaignId/ambassadors/:ambassadorId/reject",
  requireWalletAuth,
  asyncHandler(rejectAmbassador),
);
