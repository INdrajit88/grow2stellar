import { createQuest as buildQuest, publicQuest } from "../models/Quest.js";
import { createSubmission as buildSubmission, publicSubmission } from "../models/Submission.js";
import { badRequest, notFound } from "../utils/httpError.js";
import { getState, updateState } from "../store/jsonStore.js";
import crypto from "crypto";
import { Keypair, Asset, TransactionBuilder, Operation, Networks } from "@stellar/stellar-sdk";
import { env } from "../config/env.js";

function normalizeQuestInput(input) {
  const title = String(input.title || "").trim();
  const rewardAmount = Number(input.rewardAmount || 0);

  if (title.length < 3) {
    throw badRequest("Quest title must be at least 3 characters");
  }

  if (!Number.isFinite(rewardAmount) || rewardAmount < 0) {
    throw badRequest("Quest reward amount must be a positive number or zero");
  }

  return { ...input, title, rewardAmount };
}

export async function listQuests(campaignId) {
  const state = await getState();
  const campaign = state.campaigns.find(c => c.id === campaignId);
  
  if (!campaign) {
    throw notFound("Campaign not found");
  }

  return state.quests
    .filter(quest => quest.campaignId === campaignId)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .map(publicQuest);
}

export async function createQuest(campaignId, organizerId, input) {
  const normalizedInput = normalizeQuestInput(input);

  return updateState((state) => {
    const campaign = state.campaigns.find((c) => c.id === campaignId);

    if (!campaign) {
      throw notFound("Campaign not found");
    }

    if (campaign.organizerId !== organizerId) {
      throw badRequest("Only the organizer can create quests for this campaign");
    }

    const quest = buildQuest({ campaignId, input: normalizedInput });
    state.quests.push(quest);

    return publicQuest(quest);
  });
}

export async function listSubmissions(questId) {
  const state = await getState();
  return state.submissions
    .filter(sub => sub.questId === questId)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .map(publicSubmission);
}

export async function createSubmission(questId, userId, input) {
  return updateState((state) => {
    const quest = state.quests.find(q => q.id === questId);
    if (!quest) {
      throw notFound("Quest not found");
    }

    const ambassador = state.ambassadors.find(a => 
      a.campaignId === quest.campaignId && a.userId === userId && a.status === "approved"
    );

    if (!ambassador) {
      throw badRequest("You must be an approved ambassador to submit proofs for this quest");
    }

    if (!input.proofUrl || input.proofUrl.trim().length === 0) {
        throw badRequest("Proof URL is required");
    }

    const submission = buildSubmission({
      questId,
      ambassadorId: ambassador.id,
      input,
    });

    state.submissions.push(submission);

    return publicSubmission(submission);
  });
}

async function executeSorobanPayout(destinationPublicKey, amountXLM, proofUrl) {
  if (!env.stellarWebAuthSecret) {
    throw new Error("Stellar funder secret is not configured");
  }

  // Create SHA-256 hash of the proof
  const proofHash = crypto.createHash("sha256").update(proofUrl).digest("hex");
  
  // Note: For a live Soroban call, you would specify the deployed contract ID here
  const contractId = process.env.STELLAR_REWARD_CONTRACT_ID || "CDZ3..."; 
  
  console.log(`[Soroban] Calling contract ${contractId} to pay ${amountXLM} to ${destinationPublicKey} for proof hash ${proofHash}`);

  // In a full production environment, this would use the Soroban RPC Server:
  // const server = new rpc.Server("https://soroban-testnet.stellar.org");
  // ... build the Contract call with xdr.ScVal argument translations ...
  // ... simulate, build, sign, and send transaction ...

  // Returning a mocked transaction hash for the MVP dashboard
  return "soroban_tx_" + proofHash.substring(0, 16);
}

export async function approveSubmission(questId, submissionId, organizerId) {
  // Pre-fetch state to validate before triggering blockchain
  const state = await getState();
  const quest = state.quests.find(q => q.id === questId);
  if (!quest) throw notFound("Quest not found");

  const campaign = state.campaigns.find(c => c.id === quest.campaignId);
  if (!campaign || campaign.organizerId !== organizerId) {
    throw badRequest("Only the organizer can approve submissions");
  }

  const submission = state.submissions.find(s => s.id === submissionId && s.questId === questId);
  if (!submission) throw notFound("Submission not found");

  if (submission.status !== "pending") {
    throw badRequest(`Submission is already ${submission.status}`);
  }

  const ambassador = state.ambassadors.find(a => a.id === submission.ambassadorId);
  if (!ambassador) {
    throw notFound("Ambassador not found");
  }

  let txHash = null;
  if (quest.rewardAmount > 0) {
    try {
      txHash = await executeSorobanPayout(ambassador.walletAddress, quest.rewardAmount, submission.proofUrl);
    } catch (e) {
      console.error("Soroban Execution Failed:", e);
      throw badRequest("Soroban execution failed: " + e.message);
    }
  }

  return updateState((draftState) => {
    // Re-find in draft payload
    const draftSubmission = draftState.submissions.find(s => s.id === submissionId);
    if (draftSubmission && draftSubmission.status === "pending") {
        draftSubmission.status = "approved";
        draftSubmission.updatedAt = new Date().toISOString();
        draftSubmission.payoutTxHash = txHash;
        return publicSubmission(draftSubmission);
    }
    throw badRequest("Submission could not be updated");
  });
}

export async function rejectSubmission(questId, submissionId, organizerId) {
  return updateState((state) => {
    const quest = state.quests.find(q => q.id === questId);
    if (!quest) throw notFound("Quest not found");

    const campaign = state.campaigns.find(c => c.id === quest.campaignId);
    if (!campaign || campaign.organizerId !== organizerId) {
      throw badRequest("Only the organizer can reject submissions");
    }

    const submission = state.submissions.find(s => s.id === submissionId && s.questId === questId);
    if (!submission) throw notFound("Submission not found");

    if (submission.status !== "pending") {
      throw badRequest(`Submission is already ${submission.status}`);
    }

    submission.status = "rejected";
    submission.updatedAt = new Date().toISOString();

    return publicSubmission(submission);
  });
}
