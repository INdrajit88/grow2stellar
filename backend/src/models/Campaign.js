import { randomUUID } from "node:crypto";

export const campaignStatuses = ["active", "paused", "closed"];

export function createCampaign({ organizerId, organizerWalletAddress, input }) {
  const now = new Date().toISOString();
  const totalBudget = Number(input.totalBudget || 0);

  return {
    id: randomUUID(),
    organizerId,
    organizerWalletAddress,
    title: input.title.trim(),
    description: input.description.trim(),
    rewardAsset: "XLM",
    totalBudget,
    remainingBudget: totalBudget,
    status: "active",
    visibility: input.visibility === "private" ? "private" : "public",
    inviteCode: input.visibility === "private" ? randomUUID().substring(0, 8) : null,
    invitedUsers: [],
    createdAt: now,
    updatedAt: now,
  };
}

export function publicCampaign(campaign, viewer = {}) {
  return {
    id: campaign.id,
    organizerId: campaign.organizerId,
    organizerWalletAddress: campaign.organizerWalletAddress,
    title: campaign.title,
    description: campaign.description,
    rewardAsset: campaign.rewardAsset,
    totalBudget: campaign.totalBudget,
    remainingBudget: campaign.remainingBudget,
    status: campaign.status,
    visibility: campaign.visibility || "public",
    inviteCode: campaign.inviteCode,
    invitedUsers: campaign.invitedUsers || [],
    createdAt: campaign.createdAt,
    updatedAt: campaign.updatedAt,
    viewer,
  };
}
