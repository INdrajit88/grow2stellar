import { env } from "../config/env.js";
import {
  getCampaignReferralStats,
  listMyReferrals,
  trackReferralClick,
} from "../services/referralService.js";

function getIpAddress(req) {
  const forwardedFor = req.headers["x-forwarded-for"];

  if (typeof forwardedFor === "string" && forwardedFor.length > 0) {
    return forwardedFor.split(",")[0].trim();
  }

  return req.ip;
}

function clickMetadata(req) {
  return {
    ipAddress: getIpAddress(req),
    userAgent: req.get("user-agent"),
    referrer: req.get("referer"),
    landingPath: req.originalUrl,
  };
}

export async function trackReferralApi(req, res) {
  const result = await trackReferralClick({
    referralCode: req.params.referralCode,
    ...clickMetadata(req),
  });

  res.status(201).json(result);
}

export async function redirectReferral(req, res) {
  const result = await trackReferralClick({
    referralCode: req.params.referralCode,
    ...clickMetadata(req),
  });

  const destination = new URL(env.clientOrigin);
  destination.searchParams.set("campaignId", result.campaign.id);
  destination.searchParams.set("ref", result.ambassador.referralCode);

  res.redirect(302, destination.toString());
}

export async function getMyReferrals(req, res) {
  const referrals = await listMyReferrals(req.auth.userId);
  res.json({ referrals });
}

export async function getCampaignStats(req, res) {
  const stats = await getCampaignReferralStats({
    campaignId: req.params.campaignId,
    organizerId: req.auth.userId,
  });

  res.json({ stats });
}
