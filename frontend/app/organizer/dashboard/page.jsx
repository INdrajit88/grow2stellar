"use client";

import { useEffect, useState } from "react";
import { getCurrentUser, listCampaigns } from "../../../lib/api";
import StatCard from "../../components/StatCard";
import CampaignCard from "../../components/CampaignCard";
import Link from "next/link";

export default function OrganizerDashboard() {
  const [stats, setStats] = useState({
    totalCampaigns: 0,
    publicCampaigns: 0,
    privateCampaigns: 0,
    totalBudget: 0,
  });
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { load(); }, []);

  async function load() {
    const token = window.localStorage.getItem("grow2stellar.token");
    if (!token) return setLoading(false);

    try {
      const { user } = await getCurrentUser(token);
      const { campaigns: loaded } = await listCampaigns(token);
      const mine = loaded.filter((c) => c.organizerId === user.id);

      setCampaigns(mine);
      setStats({
        totalCampaigns: mine.length,
        publicCampaigns: mine.filter((c) => c.visibility !== "private").length,
        privateCampaigns: mine.filter((c) => c.visibility === "private").length,
        totalBudget: mine.reduce(
          (sum, c) => sum + parseInt(c.rewardAmount || c.totalBudget || 0),
          0
        ),
      });
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  }

  return (
    <div className="animate-fade-in">
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-ink">Organizer Hub</h1>
        <p className="text-ink/50 mt-1 text-sm">
          Manage campaigns, review submissions, and track payouts.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-10">
        <StatCard title="Campaigns" value={stats.totalCampaigns} color="mint" icon="🚀" />
        <StatCard title="Public" value={stats.publicCampaigns} color="ink" icon="🌍" />
        <StatCard title="Private" value={stats.privateCampaigns} color="coral" icon="🔒" />
        <StatCard
          title="Total Budget"
          value={stats.totalBudget}
          subtitle="XLM"
          color="gold"
          icon="⭐"
        />
      </div>

      {/* Recent campaigns */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-ink">Recent Campaigns</h2>
        <Link
          href="/organizer/campaigns"
          className="text-sm font-semibold text-mint hover:underline"
        >
          View all →
        </Link>
      </div>

      {loading ? (
        <div className="grid sm:grid-cols-2 gap-4">
          {[1, 2].map((i) => (
            <div key={i} className="h-40 rounded-xl bg-ink/5 animate-pulse" />
          ))}
        </div>
      ) : campaigns.length === 0 ? (
        <div className="rounded-xl border border-ink/8 bg-white p-8 text-center">
          <div className="text-2xl mb-2">🚀</div>
          <p className="text-sm font-semibold text-ink/40">No campaigns yet.</p>
          <Link
            href="/organizer/campaigns"
            className="mt-3 inline-block text-sm text-mint hover:underline font-semibold"
          >
            Create your first campaign →
          </Link>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {campaigns.slice(0, 4).map((c) => (
            <CampaignCard key={c.id} campaign={c} role="organizer" />
          ))}
        </div>
      )}
    </div>
  );
}
