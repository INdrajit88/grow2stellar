import { createHash, randomBytes } from "node:crypto";
import { createReferralClick, publicReferralClick } from "../models/ReferralClick.js";
import { assertCampaignOwner } from "./campaignService.js";
import { env } from "../config/env.js";
import { badRequest, notFound } from "../utils/httpError.js";
import { getState, updateState } from "../store/jsonStore.js";

const codeAlphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

function buildReferralCode() {
  const bytes = randomBytes(8);
  let code = "";

  for (const byte of bytes) {
    code += codeAlphabet[byte % codeAlphabet.length];
  }

  return code;
}

function buildReferralLink(referralCode) {
  return `${env.apiPublicUrl.replace(/\/$/, "")}/r/${referralCode}`;
}

function generateUniqueReferralCode(state) {
  for (let attempt = 0; attempt < 20; attempt += 1) {
    const code = buildReferralCode();
    const exists = state.ambassadors.some(
      (ambassador) => ambassador.referralCode === code,
    );

    if (!exists) {
      return code;
    }
  }

  throw new Error("Could not generate a unique referral code");
}

export function assignReferralIdentity(state, ambassador) {
  if (ambassador.referralCode) {
    ambassador.referralLink = ambassador.referralLink || buildReferralLink(ambassador.referralCode);
    return ambassador;
  }

  ambassador.referralCode = generateUniqueReferralCode(state);
  ambassador.referralLink = buildReferralLink(ambassador.referralCode);
  return ambassador;
}

function hashIpAddress(ipAddress) {
  if (!ipAddress) return "";

  return createHash("sha256")
    .update(`${env.jwtSecret || "grow2stellar"}:${ipAddress}`)
    .digest("hex");
}

function getClickCount(state, ambassadorId) {
  return state.referralClicks.filter((click) => click.ambassadorId === ambassadorId).length;
}

function findReferralTarget(state, referralCode) {
  const ambassador = state.ambassadors.find(
    (item) => item.referralCode === referralCode && item.status === "approved",
  );

  if (!ambassador) {
    throw notFound("Referral link not found");
  }

  const campaign = state.campaigns.find((item) => item.id === ambassador.campaignId);

  if (!campaign) {
    throw notFound("Referral campaign not found");
  }

  return { ambassador, campaign };
}

export async function trackReferralClick({
  referralCode,
  ipAddress,
  userAgent,
  referrer,
  landingPath,
}) {
  const normalizedCode = String(referralCode || "").trim().toUpperCase();

  if (!normalizedCode) {
    throw badRequest("Referral code is required");
  }

  return updateState((state) => {
    const { ambassador, campaign } = findReferralTarget(state, normalizedCode);

    if (campaign.status !== "active") {
      throw badRequest("This referral campaign is not active");
    }

    const click = createReferralClick({
      campaignId: campaign.id,
      ambassadorId: ambassador.id,
      referralCode: ambassador.referralCode,
      ipHash: hashIpAddress(ipAddress),
      userAgent: String(userAgent || "").slice(0, 300),
      referrer: String(referrer || "").slice(0, 500),
      landingPath: String(landingPath || "").slice(0, 500),
    });

    state.referralClicks.push(click);

    return {
      click: publicReferralClick(click),
      campaign: {
        id: campaign.id,
        title: campaign.title,
      },
      ambassador: {
        id: ambassador.id,
        referralCode: ambassador.referralCode,
      },
    };
  });
}

export async function listMyReferrals(userId) {
  const state = await getState();

  return state.ambassadors
    .filter(
      (ambassador) =>
        ambassador.userId === userId &&
        ambassador.status === "approved" &&
        ambassador.referralCode,
    )
    .map((ambassador) => {
      const campaign = state.campaigns.find((item) => item.id === ambassador.campaignId);

      return {
        ambassadorId: ambassador.id,
        campaignId: ambassador.campaignId,
        campaignTitle: campaign?.title || "Untitled campaign",
        referralCode: ambassador.referralCode,
        referralLink: ambassador.referralLink || buildReferralLink(ambassador.referralCode),
        clickCount: getClickCount(state, ambassador.id),
      };
    });
}

export async function getCampaignReferralStats({ campaignId, organizerId }) {
  const state = await getState();
  const campaign = state.campaigns.find((item) => item.id === campaignId);

  if (!campaign) {
    throw notFound("Campaign not found");
  }

  assertCampaignOwner(campaign, organizerId);

  const ambassadors = state.ambassadors
    .filter(
      (ambassador) =>
        ambassador.campaignId === campaignId &&
        ambassador.status === "approved" &&
        ambassador.referralCode,
    )
    .map((ambassador) => ({
      ambassadorId: ambassador.id,
      walletAddress: ambassador.walletAddress,
      referralCode: ambassador.referralCode,
      referralLink: ambassador.referralLink || buildReferralLink(ambassador.referralCode),
      clickCount: getClickCount(state, ambassador.id),
    }));

  return {
    campaignId,
    totalClicks: ambassadors.reduce((total, ambassador) => total + ambassador.clickCount, 0),
    ambassadors,
  };
}
