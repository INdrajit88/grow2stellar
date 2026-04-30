import { Keypair } from "@stellar/stellar-sdk";

process.env.JWT_SECRET = "campaign-smoke-secret";
process.env.STELLAR_WEB_AUTH_SECRET = Keypair.random().secret();
process.env.DATA_FILE = "./data/smoke-campaigns.json";

const { getOrCreateUserByWallet } = await import("../src/services/userService.js");
const { createCampaign, listCampaigns } = await import(
  "../src/services/campaignService.js"
);
const {
  applyToCampaign,
  approveAmbassador,
  listCampaignApplications,
} = await import("../src/services/ambassadorService.js");
const {
  getCampaignReferralStats,
  listMyReferrals,
  trackReferralClick,
} = await import("../src/services/referralService.js");

const organizerWallet = Keypair.random().publicKey();
const ambassadorWallet = Keypair.random().publicKey();

const organizer = await getOrCreateUserByWallet(organizerWallet);
const ambassadorUser = await getOrCreateUserByWallet(ambassadorWallet);

const campaign = await createCampaign({
  organizerId: organizer.id,
  organizerWalletAddress: organizer.walletAddress,
  input: {
    title: "Launch Ambassadors",
    description: "Reward community members for sharing the launch campaign.",
    totalBudget: 250,
  },
});

const application = await applyToCampaign({
  campaignId: campaign.id,
  userId: ambassadorUser.id,
  walletAddress: ambassadorUser.walletAddress,
  applicationMessage: "I can promote this campaign in two active Stellar groups.",
});

const applications = await listCampaignApplications({
  campaignId: campaign.id,
  organizerId: organizer.id,
});

if (applications.length !== 1 || applications[0].id !== application.id) {
  throw new Error("Campaign applications were not listed for organizer review");
}

const approved = await approveAmbassador({
  campaignId: campaign.id,
  ambassadorId: application.id,
  organizerId: organizer.id,
});

if (approved.status !== "approved") {
  throw new Error("Ambassador application was not approved");
}

if (!approved.referralCode || !approved.referralLink) {
  throw new Error("Approved ambassador did not receive a referral identity");
}

await trackReferralClick({
  referralCode: approved.referralCode,
  ipAddress: "127.0.0.1",
  userAgent: "grow2stellar-smoke",
  referrer: "",
  landingPath: `/r/${approved.referralCode}`,
});

const referralStats = await getCampaignReferralStats({
  campaignId: campaign.id,
  organizerId: organizer.id,
});

if (referralStats.totalClicks !== 1) {
  throw new Error("Referral click was not recorded for campaign stats");
}

const myReferrals = await listMyReferrals(ambassadorUser.id);

if (myReferrals.length !== 1 || myReferrals[0].clickCount !== 1) {
  throw new Error("Ambassador referral summary did not include the tracked click");
}

const visibleCampaigns = await listCampaigns({ viewerUserId: ambassadorUser.id });
const viewerCampaign = visibleCampaigns.find((item) => item.id === campaign.id);

if (viewerCampaign?.viewer.applicationStatus !== "approved") {
  throw new Error("Campaign viewer state did not include approved application");
}

console.log(`Campaign smoke OK for ${campaign.title}`);
