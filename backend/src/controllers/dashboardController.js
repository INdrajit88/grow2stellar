import { getState } from "../store/jsonStore.js";

export async function getGlobalStats(req, res) {
  const state = await getState();
  const userId = req.auth?.userId;

  let totalCampaigns = state.campaigns.length;
  let totalClicks = state.referralClicks.length;
  let totalXlmPaidOut = 0;
  let totalApprovedSubmissions = state.submissions.filter(s => s.status === "approved").length;

  state.submissions.filter(s => s.status === "approved" && s.payoutTxHash).forEach(submission => {
    const quest = state.quests.find(q => q.id === submission.questId);
    if (quest && quest.rewardAmount) {
      totalXlmPaidOut += quest.rewardAmount;
    }
  });

  res.json({
    stats: {
      totalCampaigns,
      totalClicks,
      totalXlmPaidOut,
      totalApprovedSubmissions,
    }
  });
}

export async function getLeaderboard(req, res) {
  const state = await getState();

  // Aggregate stats per ambassador
  const ambassadorStats = {};
  
  state.ambassadors.forEach(a => {
    if (a.status === "approved") {
      ambassadorStats[a.id] = {
        userId: a.userId,
        walletAddress: a.walletAddress,
        totalClicks: 0,
        approvedQuests: 0,
        xlmEarned: 0,
      };
    }
  });

  state.referralClicks.forEach(click => {
    if (ambassadorStats[click.ambassadorId]) {
      ambassadorStats[click.ambassadorId].totalClicks++;
    }
  });

  state.submissions.forEach(sub => {
    if (sub.status === "approved" && ambassadorStats[sub.ambassadorId]) {
      ambassadorStats[sub.ambassadorId].approvedQuests++;
      const quest = state.quests.find(q => q.id === sub.questId);
      if (quest) {
         ambassadorStats[sub.ambassadorId].xlmEarned += quest.rewardAmount;
      }
    }
  });

  const leaderboard = Object.values(ambassadorStats)
    .sort((a, b) => b.xlmEarned - a.xlmEarned || b.approvedQuests - a.approvedQuests)
    .slice(0, 50); // Top 50

  // Attach display names if any
  const enrichedLeaderboard = leaderboard.map(entry => {
    const user = state.users.find(u => u.id === entry.userId);
    return {
      ...entry,
      displayName: user?.displayName || user?.walletAddress.slice(0, 8) + "...",
    };
  });

  res.json({ leaderboard: enrichedLeaderboard });
}
