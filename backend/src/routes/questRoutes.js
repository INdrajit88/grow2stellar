import { Router } from "express";
import {
  createSubmission,
  listSubmissions,
  approveSubmission,
  rejectSubmission,
} from "../controllers/questController.js";
import { optionalWalletAuth } from "../middleware/optionalWalletAuth.js";
import { requireWalletAuth } from "../middleware/requireWalletAuth.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const questRoutes = Router();

questRoutes.get("/:questId/submissions", requireWalletAuth, asyncHandler(listSubmissions));
questRoutes.post("/:questId/submissions", requireWalletAuth, asyncHandler(createSubmission));
questRoutes.patch("/:questId/submissions/:submissionId/approve", requireWalletAuth, asyncHandler(approveSubmission));
questRoutes.patch("/:questId/submissions/:submissionId/reject", requireWalletAuth, asyncHandler(rejectSubmission));
