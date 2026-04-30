const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });

  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(payload.error?.message || "Request failed");
  }

  return payload;
}

export function requestWalletChallenge(walletAddress) {
  return request("/auth/nonce", {
    method: "POST",
    body: JSON.stringify({ walletAddress }),
  });
}

export function verifyWalletChallenge({ walletAddress, signedTransaction }) {
  return request("/auth/verify", {
    method: "POST",
    body: JSON.stringify({ walletAddress, signedTransaction }),
  });
}

export function getCurrentUser(token) {
  return request("/users/me", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

export function getCampaignByInviteCode(token, inviteCode) {
  return request(`/campaigns/invites/${inviteCode}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
}

export function joinCampaignByInvite(token, inviteCode) {
  return request(`/campaigns/invites/${inviteCode}/join`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
  });
}

export function listCampaigns(token) {
  return request("/campaigns", {
    headers: token
      ? {
          Authorization: `Bearer ${token}`,
        }
      : {},
  });
}

export function getMarketplaceCampaigns(token) {
  return request("/campaigns/public/marketplace", {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
}

export function createCampaign(token, input) {
  return request("/campaigns", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(input),
  });
}

export function applyToCampaign(token, campaignId, applicationMessage) {
  return request(`/campaigns/${campaignId}/apply`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ applicationMessage }),
  });
}

export function listCampaignApplications(token, campaignId) {
  return request(`/campaigns/${campaignId}/applications`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

export function approveAmbassador(token, campaignId, ambassadorId) {
  return request(`/campaigns/${campaignId}/ambassadors/${ambassadorId}/approve`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

export function rejectAmbassador(token, campaignId, ambassadorId, rejectedReason = "") {
  return request(`/campaigns/${campaignId}/ambassadors/${ambassadorId}/reject`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ rejectedReason }),
  });
}

export function listMyReferrals(token) {
  return request("/referrals/me", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

export function getCampaignReferralStats(token, campaignId) {
  return request(`/campaigns/${campaignId}/referrals/stats`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

export function createQuest(token, campaignId, input) {
  return request(`/campaigns/${campaignId}/quests`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(input),
  });
}

export function listQuests(token, campaignId) {
  return request(`/campaigns/${campaignId}/quests`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
}

export function createSubmission(token, questId, input) {
  return request(`/quests/${questId}/submissions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(input),
  });
}

export function listSubmissions(token, questId) {
  return request(`/quests/${questId}/submissions`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

export function approveSubmission(token, questId, submissionId) {
  return request(`/quests/${questId}/submissions/${submissionId}/approve`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

export function rejectSubmission(token, questId, submissionId) {
  return request(`/quests/${questId}/submissions/${submissionId}/reject`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

export function getDashboardStats(token) {
  return request(`/dashboard/stats`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
}

export function getDashboardLeaderboard(token) {
  return request(`/dashboard/leaderboard`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
}
