import {
  applyToCampaign as applyToCampaignRecord,
  approveAmbassador as approveAmbassadorRecord,
  listCampaignApplications as listCampaignApplicationRecords,
  rejectAmbassador as rejectAmbassadorRecord,
} from "../services/ambassadorService.js";

export async function applyToCampaign(req, res) {
  const ambassador = await applyToCampaignRecord({
    campaignId: req.params.campaignId,
    userId: req.auth.userId,
    walletAddress: req.auth.walletAddress,
    applicationMessage: req.body.applicationMessage,
  });

  res.status(201).json({ ambassador });
}

export async function listCampaignApplications(req, res) {
  const ambassadors = await listCampaignApplicationRecords({
    campaignId: req.params.campaignId,
    organizerId: req.auth.userId,
  });

  res.json({ ambassadors });
}

export async function approveAmbassador(req, res) {
  const ambassador = await approveAmbassadorRecord({
    campaignId: req.params.campaignId,
    ambassadorId: req.params.ambassadorId,
    organizerId: req.auth.userId,
  });

  res.json({ ambassador });
}

export async function rejectAmbassador(req, res) {
  const ambassador = await rejectAmbassadorRecord({
    campaignId: req.params.campaignId,
    ambassadorId: req.params.ambassadorId,
    organizerId: req.auth.userId,
    rejectedReason: req.body.rejectedReason,
  });

  res.json({ ambassador });
}
