"use client";

import { useEffect, useState } from "react";
import { getCurrentUser, listMyReferrals, listCampaigns } from "../../../lib/api";
import StatCard from "../../components/StatCard";

export default function AmbassadorDashboard() {
  const [stats, setStats] = useState({ appliedHunts: 0, approvedHunts: 0, totalClicks: 0, estimatedEarnings: 0 });
  const [referrals, setReferrals] = useState([]);

  useEffect(() => {
    const load = async () => {
      const token = window.localStorage.getItem("grow2stellar.token");
      if (!token) return;
      const { user } = await getCurrentUser(token);
      
      const { campaigns } = await listCampaigns(token);
      let applied = 0;
      let approvedCampaignsCount = 0;
      for (const c of campaigns) {
        if (c.viewer?.applicationStatus) applied++;
        if (c.viewer?.applicationStatus === 'approved') approvedCampaignsCount++;
      }

      const { referrals: loaded } = await listMyReferrals(token);
      const approved = loaded.filter(r => r.status === "approved");
      setReferrals(approved);
      
      const clicks = approved.reduce((sum, r) => sum + (r.clickStats?.totalCount || 0), 0);
      setStats({
        appliedHunts: applied,
        approvedHunts: approvedCampaignsCount,
        totalClicks: clicks,
        estimatedEarnings: 0 // Mock until real earnings endpoint
      });
    };
    load();
  }, []);

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6 text-ink">Ambassador Hub</h1>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-10">
        <StatCard title="Applied Bounties" value={stats.appliedHunts} color="ink" />
        <StatCard title="Exclusive Joined" value={stats.approvedHunts} color="mint" />
        <StatCard title="Link Clicks" value={stats.totalClicks} color="ink" />
        <StatCard title="Pending XLM" value={`${stats.estimatedEarnings} XLM`} color="gold" />
      </div>

      <h2 className="text-xl font-bold mb-4 text-ink">My Active Referral Links</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {referrals.length === 0 ? (
          <p className="text-ink/60 col-span-2">You don't have any approved referral links yet.</p>
        ) : (
          referrals.map(ref => (
            <div key={ref.id} className="rounded-lg border border-mint/20 bg-mint/5 p-4 text-sm">
              <p className="font-bold text-ink">{ref.campaignName}</p>
              <div className="mt-3 space-y-2 border-t border-mint/20 pt-3">
                <p className="text-xs uppercase text-ink/60">Your Unique Link</p>
                <input readOnly value={`${window.location.origin}/api/campaigns/${ref.campaignId}/click/${ref.id}`} className="w-full rounded border border-ink/15 px-2 py-1 text-xs" />
              </div>
              <div className="mt-3 flex items-center justify-between">
                <span className="text-xs font-semibold text-ink/60">Total Real Clicks:</span>
                <span className="text-lg font-bold text-ink">{ref.clickStats?.totalCount || 0}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
