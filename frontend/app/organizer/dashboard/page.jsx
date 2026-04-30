"use client";

import { useEffect, useState } from "react";
import { getCurrentUser, listCampaigns } from "../../../lib/api";
import StatCard from "../../components/StatCard";
import CampaignCard from "../../components/CampaignCard";

export default function OrganizerDashboard() {
  const [stats, setStats] = useState({ totalCampaigns: 0, activeCampaigns: 0, totalBudget: 0 });
  const [campaigns, setCampaigns] = useState([]);

  useEffect(() => {
    const load = async () => {
      const token = window.localStorage.getItem("grow2stellar.token");
      if (!token) return;
      const { user } = await getCurrentUser(token);
      const { campaigns: loaded } = await listCampaigns(token);
      const myCampaigns = loaded.filter(c => c.organizerId === user.id);
      
      setCampaigns(myCampaigns);
      setStats({
        totalCampaigns: myCampaigns.length,
        activeCampaigns: myCampaigns.filter(c => c.status !== "closed").length,
        totalBudget: myCampaigns.reduce((sum, c) => sum + parseInt(c.rewardAmount || 0), 0)
      });
    };
    load();
  }, []);

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6 text-ink">Organizer Hub</h1>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-10">
        <StatCard title="My Campaigns" value={stats.totalCampaigns} color="mint" />
        <StatCard title="Marketplace (Public)" value={campaigns.filter(c=>c.visibility !== 'private').length} color="ink" />
        <StatCard title="Invite Only (Private)" value={campaigns.filter(c=>c.visibility === 'private').length} color="coral" />
        <StatCard title="Total Budget Target" value={`${stats.totalBudget} XLM`} color="gold" />
      </div>

      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-ink">Recent Campaigns</h2>
        <a href="/organizer/campaigns" className="text-sm font-semibold text-mint hover:underline">View All &rarr;</a>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {campaigns.length === 0 ? (
          <p className="text-ink/60 col-span-2">No campaigns found. Head to the Campaigns tab to create one.</p>
        ) : (
          campaigns.slice(0, 4).map(c => <CampaignCard key={c.id} campaign={c} role="organizer" />)
        )}
      </div>
    </div>
  );
}
