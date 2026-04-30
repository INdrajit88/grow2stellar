import {
  createCampaign as createCampaignRecord,
  getCampaignById,
  listCampaigns as listCampaignRecords,
  listMarketplaceCampaigns as listMarketplaceRecords,
  joinCampaignByInviteCode,
} from "../services/campaignService.js";

export async function listCampaigns(req, res) {
  const campaigns = await listCampaignRecords({ viewerUserId: req.auth?.userId });
  res.json({ campaigns });
}

export async function listMarketplaceCampaigns(req, res) {
  const campaigns = await listMarketplaceRecords({ viewerUserId: req.auth?.userId });
  res.json({ campaigns });
}

export async function getCampaignByInviteCode(req, res) {
  const { inviteCode } = req.params;
  const campaigns = await listCampaignRecords({ viewerUserId: req.auth?.userId });
  const campaign = campaigns.find(c => c.inviteCode === inviteCode);
  if (!campaign) return res.status(404).json({ error: "Invalid or expired invite code." });
  res.json({ campaign });
}

export async function joinCampaignByInvite(req, res) {
  const { inviteCode } = req.params;
  const result = await joinCampaignByInviteCode({
    inviteCode,
    userId: req.auth.userId,
    walletAddress: req.auth.walletAddress,
  });
  res.status(200).json(result);
}

export async function getCampaign(req, res) {
  const campaign = await getCampaignById(req.params.campaignId, {
    viewerUserId: req.auth?.userId,
  });
  res.json({ campaign });
}

export async function createCampaign(req, res) {
  const campaign = await createCampaignRecord({
    organizerId: req.auth.userId,
    organizerWalletAddress: req.auth.walletAddress,
    input: req.body,
  });

  res.status(201).json({ campaign });
}
