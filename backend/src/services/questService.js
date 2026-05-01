import { createQuest as buildQuest, publicQuest } from "../models/Quest.js";
import { createSubmission as buildSubmission, publicSubmission } from "../models/Submission.js";
import { badRequest, notFound } from "../utils/httpError.js";
import { getState, updateState } from "../store/jsonStore.js";
import crypto from "crypto";
import {
  Keypair,
  TransactionBuilder,
  Networks,
  BASE_FEE,
  Contract,
  Address,
  nativeToScVal,
  xdr,
  rpc as SorobanRpc,
} from "@stellar/stellar-sdk";
import { env } from "../config/env.js";

// ─────────────────────────────────────────────────────────────────────────────
// Quest helpers
// ─────────────────────────────────────────────────────────────────────────────

function normalizeQuestInput(input) {
  const title = String(input.title || "").trim();
  const rewardAmount = Number(input.rewardAmount || 0);

  if (title.length < 3) throw badRequest("Quest title must be at least 3 characters");
  if (!Number.isFinite(rewardAmount) || rewardAmount < 0)
    throw badRequest("Quest reward amount must be a positive number or zero");

  return { ...input, title, rewardAmount };
}

export async function listQuests(campaignId) {
  const state = await getState();
  const campaign = state.campaigns.find((c) => c.id === campaignId);
  if (!campaign) throw notFound("Campaign not found");

  return state.quests
    .filter((q) => q.campaignId === campaignId)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .map(publicQuest);
}

export async function createQuest(campaignId, organizerId, input) {
  const normalizedInput = normalizeQuestInput(input);

  return updateState((state) => {
    const campaign = state.campaigns.find((c) => c.id === campaignId);
    if (!campaign) throw notFound("Campaign not found");
    if (campaign.organizerId !== organizerId)
      throw badRequest("Only the organizer can create quests for this campaign");

    const quest = buildQuest({ campaignId, input: normalizedInput });
    state.quests.push(quest);
    return publicQuest(quest);
  });
}

export async function listSubmissions(questId) {
  const state = await getState();
  return state.submissions
    .filter((s) => s.questId === questId)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .map(publicSubmission);
}

export async function createSubmission(questId, userId, input) {
  return updateState((state) => {
    const quest = state.quests.find((q) => q.id === questId);
    if (!quest) throw notFound("Quest not found");

    const ambassador = state.ambassadors.find(
      (a) => a.campaignId === quest.campaignId && a.userId === userId && a.status === "approved"
    );
    if (!ambassador)
      throw badRequest("You must be an approved ambassador to submit proofs for this quest");

    if (!input.proofUrl || input.proofUrl.trim().length === 0)
      throw badRequest("Proof URL is required");

    const submission = buildSubmission({ questId, ambassadorId: ambassador.id, input });
    state.submissions.push(submission);
    return publicSubmission(submission);
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// Soroban payout
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Call the deployed Grow2Stellar escrow contract's `approve_proof_and_pay`
 * function to pay the ambassador on-chain.
 *
 * Returns the Stellar transaction hash on success.
 */
async function executeSorobanPayout(destinationPublicKey, amountXLM, proofUrl, campaignId) {
  const contractId = env.escrowContractId;
  if (!contractId) throw new Error("ESCROW_CONTRACT_ID is not configured");

  const funderSecret = env.stellarWebAuthSecret;
  if (!funderSecret) throw new Error("STELLAR_WEB_AUTH_SECRET (funder) is not configured");

  const funderKeypair = Keypair.fromSecret(funderSecret);
  const server = new SorobanRpc.Server(env.stellarRpcUrl || "https://soroban-testnet.stellar.org");

  // Build a 32-byte proof hash from the proof URL
  const proofHashHex = crypto.createHash("sha256").update(proofUrl).digest("hex");
  const proofHashBytes = Buffer.from(proofHashHex, "hex");

  // Convert JS values → Soroban ScVal
  const campaignIdVal = xdr.ScVal.scvU64(xdr.Uint64.fromString(String(campaignId || 1)));
  const ambassadorVal = new Address(destinationPublicKey).toScVal();
  // reward in stroops (1 XLM = 10_000_000 stroops)
  const rewardStroops = BigInt(Math.round(amountXLM * 10_000_000));
  const rewardVal = xdr.ScVal.scvI128(
    new xdr.Int128Parts({
      hi: xdr.Int64.fromString("0"),
      lo: xdr.Uint64.fromString(rewardStroops.toString()),
    })
  );
  const bonusVal = xdr.ScVal.scvI128(
    new xdr.Int128Parts({
      hi: xdr.Int64.fromString("0"),
      lo: xdr.Uint64.fromString("0"),
    })
  );
  const proofHashVal = xdr.ScVal.scvBytes(proofHashBytes);

  const contract = new Contract(contractId);
  const account = await server.getAccount(funderKeypair.publicKey());

  const tx = new TransactionBuilder(account, {
    fee: BASE_FEE,
    networkPassphrase: env.stellarNetworkPassphrase,
  })
    .addOperation(
      contract.call(
        "approve_proof_and_pay",
        campaignIdVal,
        ambassadorVal,
        rewardVal,
        bonusVal,
        proofHashVal
      )
    )
    .setTimeout(30)
    .build();

  // Simulate first
  const simResult = await server.simulateTransaction(tx);
  if (SorobanRpc.Api.isSimulationError(simResult)) {
    throw new Error(`Soroban simulation failed: ${simResult.error}`);
  }

  // Assemble + sign
  const preparedTx = SorobanRpc.assembleTransaction(tx, simResult).build();
  preparedTx.sign(funderKeypair);

  // Submit
  const sendResult = await server.sendTransaction(preparedTx);
  if (sendResult.status === "ERROR") {
    throw new Error(`Soroban submission failed: ${JSON.stringify(sendResult.errorResult)}`);
  }

  // Poll for confirmation
  const txHash = sendResult.hash;
  let getResult = await server.getTransaction(txHash);
  let attempts = 0;

  while (getResult.status === SorobanRpc.Api.GetTransactionStatus.NOT_FOUND && attempts < 20) {
    await new Promise((r) => setTimeout(r, 1500));
    getResult = await server.getTransaction(txHash);
    attempts++;
  }

  if (getResult.status === SorobanRpc.Api.GetTransactionStatus.FAILED) {
    throw new Error(`Soroban transaction failed on-chain: ${txHash}`);
  }

  console.log(`[Soroban] ✅ Payout confirmed — tx: ${txHash}`);
  return txHash;
}

// ─────────────────────────────────────────────────────────────────────────────
// Approve / reject
// ─────────────────────────────────────────────────────────────────────────────

export async function approveSubmission(questId, submissionId, organizerId) {
  const state = await getState();

  const quest = state.quests.find((q) => q.id === questId);
  if (!quest) throw notFound("Quest not found");

  const campaign = state.campaigns.find((c) => c.id === quest.campaignId);
  if (!campaign || campaign.organizerId !== organizerId)
    throw badRequest("Only the organizer can approve submissions");

  const submission = state.submissions.find(
    (s) => s.id === submissionId && s.questId === questId
  );
  if (!submission) throw notFound("Submission not found");
  if (submission.status !== "pending")
    throw badRequest(`Submission is already ${submission.status}`);

  const ambassador = state.ambassadors.find((a) => a.id === submission.ambassadorId);
  if (!ambassador) throw notFound("Ambassador record not found");

  let txHash = null;

  if (quest.rewardAmount > 0) {
    try {
      txHash = await executeSorobanPayout(
        ambassador.walletAddress,
        quest.rewardAmount,
        submission.proofUrl,
        campaign.onChainId || 1
      );
    } catch (err) {
      console.error("[Soroban] Payout error:", err.message);
      // Fall back to recording the approval without a tx hash rather than
      // blocking the organizer — log the error for debugging.
      txHash = `failed:${err.message.slice(0, 80)}`;
    }
  }

  return updateState((draft) => {
    const sub = draft.submissions.find((s) => s.id === submissionId);
    if (!sub || sub.status !== "pending") throw badRequest("Submission could not be updated");

    sub.status = "approved";
    sub.updatedAt = new Date().toISOString();
    sub.payoutTxHash = txHash;
    return publicSubmission(sub);
  });
}

export async function rejectSubmission(questId, submissionId, organizerId) {
  return updateState((state) => {
    const quest = state.quests.find((q) => q.id === questId);
    if (!quest) throw notFound("Quest not found");

    const campaign = state.campaigns.find((c) => c.id === quest.campaignId);
    if (!campaign || campaign.organizerId !== organizerId)
      throw badRequest("Only the organizer can reject submissions");

    const submission = state.submissions.find(
      (s) => s.id === submissionId && s.questId === questId
    );
    if (!submission) throw notFound("Submission not found");
    if (submission.status !== "pending")
      throw badRequest(`Submission is already ${submission.status}`);

    submission.status = "rejected";
    submission.updatedAt = new Date().toISOString();
    return publicSubmission(submission);
  });
}
