import {
  createAmbassadorApplication,
  publicAmbassador,
} from "../models/Ambassador.js";
import { assignReferralIdentity } from "./referralService.js";
import { assertCampaignOwner } from "./campaignService.js";
import { badRequest, conflict, notFound } from "../utils/httpError.js";
import { getState, updateState } from "../store/jsonStore.js";

function normalizeApplicationMessage(message) {
  const normalized = String(message || "").trim();

  if (normalized.length < 10 || normalized.length > 800) {
    throw badRequest("Application message must be between 10 and 800 characters");
  }

  return normalized;
}

function findCampaign(state, campaignId) {
  const campaign = state.campaigns.find((item) => item.id === campaignId);

  if (!campaign) {
    throw notFound("Campaign not found");
  }

  return campaign;
}

function findAmbassador(state, campaignId, ambassadorId) {
  const ambassador = state.ambassadors.find(
    (item) => item.id === ambassadorId && item.campaignId === campaignId,
  );

  if (!ambassador) {
    throw notFound("Ambassador application not found");
  }

  return ambassador;
}

export async function applyToCampaign({
  campaignId,
  userId,
  walletAddress,
  applicationMessage,
}) {
  const normalizedMessage = normalizeApplicationMessage(applicationMessage);

  return updateState((state) => {
    const campaign = findCampaign(state, campaignId);

    if (campaign.status !== "active") {
      throw badRequest("This campaign is not accepting applications");
    }

    if (campaign.organizerId === userId) {
      throw badRequest("Organizers cannot apply to their own campaigns");
    }

    const existing = state.ambassadors.find(
      (item) => item.campaignId === campaignId && item.userId === userId,
    );

    if (existing) {
      throw conflict("You have already applied to this campaign");
    }

    const user = state.users.find((item) => item.id === userId);

    if (!user) {
      throw notFound("User not found");
    }

    const ambassador = createAmbassadorApplication({
      campaignId,
      userId,
      walletAddress,
      applicationMessage: normalizedMessage,
    });

    user.roleFlags.ambassador = true;
    user.updatedAt = new Date().toISOString();
    state.ambassadors.push(ambassador);

    return publicAmbassador(ambassador);
  });
}

export async function listCampaignApplications({ campaignId, organizerId }) {
  const state = await getState();
  const campaign = findCampaign(state, campaignId);

  assertCampaignOwner(campaign, organizerId);

  return [...state.ambassadors]
    .filter((ambassador) => ambassador.campaignId === campaignId)
    .sort((left, right) => right.createdAt.localeCompare(left.createdAt))
    .map((ambassador) => ({
      ...publicAmbassador(ambassador),
      clickCount: state.referralClicks.filter(
        (click) => click.ambassadorId === ambassador.id,
      ).length,
    }));
}

export async function approveAmbassador({ campaignId, ambassadorId, organizerId }) {
  return updateState((state) => {
    const campaign = findCampaign(state, campaignId);
    assertCampaignOwner(campaign, organizerId);

    const ambassador = findAmbassador(state, campaignId, ambassadorId);

    if (ambassador.status === "approved") {
      assignReferralIdentity(state, ambassador);
      return publicAmbassador(ambassador);
    }

    if (ambassador.status === "suspended") {
      throw badRequest("Suspended ambassadors cannot be approved in the MVP");
    }

    const now = new Date().toISOString();
    ambassador.status = "approved";
    ambassador.approvedAt = now;
    ambassador.rejectedAt = null;
    ambassador.rejectedReason = "";
    assignReferralIdentity(state, ambassador);
    ambassador.updatedAt = now;

    return publicAmbassador(ambassador);
  });
}

export async function rejectAmbassador({
  campaignId,
  ambassadorId,
  organizerId,
  rejectedReason,
}) {
  return updateState((state) => {
    const campaign = findCampaign(state, campaignId);
    assertCampaignOwner(campaign, organizerId);

    const ambassador = findAmbassador(state, campaignId, ambassadorId);
    const now = new Date().toISOString();

    ambassador.status = "rejected";
    ambassador.approvedAt = null;
    ambassador.rejectedAt = now;
    ambassador.rejectedReason = String(rejectedReason || "").trim().slice(0, 300);
    ambassador.updatedAt = now;

    return publicAmbassador(ambassador);
  });
}
