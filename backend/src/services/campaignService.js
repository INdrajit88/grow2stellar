import { createCampaign as buildCampaign, publicCampaign } from "../models/Campaign.js";
import { createAmbassadorApplication } from "../models/Ambassador.js";
import { badRequest, forbidden, notFound, conflict } from "../utils/httpError.js";
import { getState, updateState } from "../store/jsonStore.js";

function normalizeCampaignInput(input) {
  const title = String(input.title || "").trim();
  const description = String(input.description || "").trim();
  const totalBudget = Number(input.totalBudget || 0);

  if (title.length < 3 || title.length > 100) {
    throw badRequest("Campaign title must be between 3 and 100 characters");
  }

  if (description.length < 10 || description.length > 1000) {
    throw badRequest("Campaign description must be between 10 and 1000 characters");
  }

  if (!Number.isFinite(totalBudget) || totalBudget < 0) {
    throw badRequest("Campaign budget must be a positive number or zero");
  }

  return {
    title,
    description,
    totalBudget,
    visibility: input.visibility || "public",
  };
}

function viewerForCampaign(state, campaign, viewerUserId) {
  if (!viewerUserId) {
    return {
      isOwner: false,
      applicationStatus: null,
      ambassadorId: null,
    };
  }

  const application = state.ambassadors.find(
    (ambassador) =>
      ambassador.campaignId === campaign.id && ambassador.userId === viewerUserId,
  );

  return {
    isOwner: campaign.organizerId === viewerUserId,
    applicationStatus: application?.status || null,
    ambassadorId: application?.id || null,
  };
}

export async function listCampaigns({ viewerUserId } = {}) {
  const state = await getState();

  return [...state.campaigns]
    .sort((left, right) => right.createdAt.localeCompare(left.createdAt))
    .map((campaign) =>
      publicCampaign(campaign, viewerForCampaign(state, campaign, viewerUserId)),
    );
}

export async function listMarketplaceCampaigns({ viewerUserId } = {}) {
  const state = await getState();

  return [...state.campaigns]
    .filter((campaign) => campaign.visibility !== "private")
    .sort((left, right) => right.createdAt.localeCompare(left.createdAt))
    .map((campaign) =>
      publicCampaign(campaign, viewerForCampaign(state, campaign, viewerUserId)),
    );
}

export async function getCampaignById(campaignId, { viewerUserId } = {}) {
  const state = await getState();
  const campaign = state.campaigns.find((item) => item.id === campaignId);

  if (!campaign) {
    throw notFound("Campaign not found");
  }

  return publicCampaign(campaign, viewerForCampaign(state, campaign, viewerUserId));
}

export async function createCampaign({ organizerId, organizerWalletAddress, input }) {
  const normalizedInput = normalizeCampaignInput(input);

  return updateState((state) => {
    const organizer = state.users.find((user) => user.id === organizerId);

    if (!organizer) {
      throw notFound("Organizer user not found");
    }

    const campaign = buildCampaign({
      organizerId,
      organizerWalletAddress,
      input: normalizedInput,
    });

    organizer.roleFlags.organizer = true;
    organizer.updatedAt = new Date().toISOString();
    state.campaigns.push(campaign);

    return publicCampaign(campaign, {
      isOwner: true,
      applicationStatus: null,
      ambassadorId: null,
    });
  });
}

export function assertCampaignOwner(campaign, userId) {
  if (campaign.organizerId !== userId) {
    throw forbidden("Only the campaign organizer can perform this action");
  }
}

export async function joinCampaignByInviteCode({ inviteCode, userId, walletAddress }) {
  if (!inviteCode) throw badRequest("Invite code is required.");
  
  return updateState((state) => {
    const campaign = state.campaigns.find(c => c.inviteCode === inviteCode);
    if (!campaign) throw notFound("Invalid or expired invite code.");
    if (campaign.organizerId === userId) throw badRequest("Organizers cannot join their own campaigns.");

    const existingAmbassador = state.ambassadors.find(
      (item) => item.campaignId === campaign.id && item.userId === userId
    );

    if (existingAmbassador) {
       // If they had a pending or rejected status, maybe bump it to approved since they got the invite,
       // but for simplicity, just throw conflict if they already exist
       throw conflict("You have already applied or joined this campaign.");
    }

    const ambassador = createAmbassadorApplication({
      campaignId: campaign.id,
      userId,
      walletAddress,
      applicationMessage: `Joined via Invite Link [${inviteCode}]`,
    });
    
    // Auto approve because it's a private invite code
    ambassador.status = "approved";
    ambassador.approvedAt = new Date().toISOString();

    const user = state.users.find(u => u.id === userId);
    user.roleFlags.ambassador = true;
    user.updatedAt = new Date().toISOString();

    campaign.invitedUsers.push(userId);
    state.ambassadors.push(ambassador);

    return publicCampaign(campaign, {
      isOwner: false,
      applicationStatus: "approved",
      ambassadorId: ambassador.id,
    });
  });
}
