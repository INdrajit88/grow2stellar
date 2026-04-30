import { randomUUID } from "node:crypto";

export const questTypes = ["referral", "social_post", "workshop", "other"];

export function createQuest({ campaignId, input }) {
  const now = new Date().toISOString();
  const rewardAmount = Number(input.rewardAmount || 0);

  return {
    id: randomUUID(),
    campaignId,
    title: input.title?.trim() || "Untitled Quest",
    description: input.description?.trim() || "",
    type: questTypes.includes(input.type) ? input.type : "other",
    rewardAmount,
    createdAt: now,
    updatedAt: now,
  };
}

export function publicQuest(quest) {
  return {
    id: quest.id,
    campaignId: quest.campaignId,
    title: quest.title,
    description: quest.description,
    type: quest.type,
    rewardAmount: quest.rewardAmount,
    createdAt: quest.createdAt,
    updatedAt: quest.updatedAt,
  };
}
