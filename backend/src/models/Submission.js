import { randomUUID } from "node:crypto";

export const submissionStatuses = ["pending", "approved", "rejected"];

export function createSubmission({ questId, ambassadorId, input }) {
  const now = new Date().toISOString();

  return {
    id: randomUUID(),
    questId,
    ambassadorId,
    status: "pending",
    proofUrl: input.proofUrl?.trim() || "",
    comments: input.comments?.trim() || "",
    payoutTxHash: null,
    createdAt: now,
    updatedAt: now,
  };
}

export function publicSubmission(submission) {
  return {
    id: submission.id,
    questId: submission.questId,
    ambassadorId: submission.ambassadorId,
    status: submission.status,
    proofUrl: submission.proofUrl,
    comments: submission.comments,
    payoutTxHash: submission.payoutTxHash,
    createdAt: submission.createdAt,
    updatedAt: submission.updatedAt,
  };
}
