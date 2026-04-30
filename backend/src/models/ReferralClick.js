import { randomUUID } from "node:crypto";

export function createReferralClick({
  campaignId,
  ambassadorId,
  referralCode,
  ipHash,
  userAgent,
  referrer,
  landingPath,
}) {
  const now = new Date().toISOString();

  return {
    id: randomUUID(),
    campaignId,
    ambassadorId,
    referralCode,
    clickedAt: now,
    ipHash,
    userAgent,
    referrer,
    landingPath,
  };
}

export function publicReferralClick(click) {
  return {
    id: click.id,
    campaignId: click.campaignId,
    ambassadorId: click.ambassadorId,
    referralCode: click.referralCode,
    clickedAt: click.clickedAt,
    userAgent: click.userAgent,
    referrer: click.referrer,
    landingPath: click.landingPath,
  };
}
