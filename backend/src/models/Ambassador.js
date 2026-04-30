import { randomUUID } from "node:crypto";

export const ambassadorStatuses = ["applied", "approved", "rejected", "suspended"];

export function createAmbassadorApplication({
  campaignId,
  userId,
  walletAddress,
  applicationMessage,
}) {
  const now = new Date().toISOString();

  return {
    id: randomUUID(),
    campaignId,
    userId,
    walletAddress,
    status: "applied",
    applicationMessage,
    referralCode: null,
    referralLink: null,
    approvedAt: null,
    rejectedAt: null,
    rejectedReason: "",
    createdAt: now,
    updatedAt: now,
  };
}

export function publicAmbassador(ambassador) {
  return {
    id: ambassador.id,
    campaignId: ambassador.campaignId,
    userId: ambassador.userId,
    walletAddress: ambassador.walletAddress,
    status: ambassador.status,
    applicationMessage: ambassador.applicationMessage,
    referralCode: ambassador.referralCode,
    referralLink: ambassador.referralLink,
    approvedAt: ambassador.approvedAt,
    rejectedAt: ambassador.rejectedAt,
    rejectedReason: ambassador.rejectedReason,
    createdAt: ambassador.createdAt,
    updatedAt: ambassador.updatedAt,
  };
}
