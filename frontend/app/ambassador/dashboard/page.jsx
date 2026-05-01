"use client";

import { useEffect, useState } from "react";
import { getCurrentUser, listMyReferrals, listCampaigns } from "../../../lib/api";
import StatCard from "../../components/StatCard";
import Link from "next/link";

export default function AmbassadorDashboard() {
  const [stats, setStats] = useState({
    appliedHunts: 0,
    approvedHunts: 0,
    totalClicks: 0,
    estimatedEarnings: 0,
  });
  const [referrals, setReferrals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(null);

  useEffect(() => { load(); }, []);

  async function load() {
    const token = window.localStorage.getItem("grow2stellar.token");
    if (!token) return setLoading(false);

    try {
      const { user } = await getCurrentUser(token);
      const { campaigns } = await listCampaigns(token);

      let applied = 0;
      let approvedCount = 0;
      for (const c of campaigns) {
        if (c.viewer?.applicationStatus) applied++;
        if (c.viewer?.applicationStatus === "approved") approvedCount++;
      }

      const { referrals: loaded } = await listMyReferrals(token);
      const approved = loaded.filter((r) => r.status === "approved");
      setReferrals(approved);

      const clicks = approved.reduce(
        (sum, r) => sum + (r.clickStats?.totalCount || 0),
        0
      );
      setStats({
        appliedHunts: applied,
        approvedHunts: approvedCount,
        totalClicks: clicks,
        estimatedEarnings: 0,
      });
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  }

  function copyLink(ref) {
    const link = `${window.location.origin}/api/campaigns/${ref.campaignId}/click/${ref.id}`;
    navigator.clipboard.writeText(link);
    setCopied(ref.id);
    setTimeout(() => setCopied(null), 2000);
  }

  return (
    <div className="animate-fade-in">
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-ink">Ambassador Hub</h1>
        <p className="text-ink/50 mt-1 text-sm">Your earnings, referrals, and quest activity.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-10">
        <StatCard title="Applied" value={stats.appliedHunts} color="ink" icon="📋" />
        <StatCard title="Approved" value={stats.approvedHunts} color="mint" icon="✅" />
        <StatCard title="Link Clicks" value={stats.totalClicks} color="ink" icon="🔗" />
        <StatCard
          title="Pending XLM"
          value={`${stats.estimatedEarnings}`}
          subtitle="XLM"
          color="gold"
          icon="⭐"
        />
      </div>

      {/* Referral links */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-ink">Active Referral Links</h2>
        <Link
          href="/ambassador/campaigns"
          className="text-sm font-semibold text-mint hover:underline"
        >
          Browse campaigns →
        </Link>
      </div>

      {loading ? (
        <div className="grid sm:grid-cols-2 gap-4">
          {[1, 2].map((i) => (
            <div key={i} className="h-32 rounded-xl bg-ink/5 animate-pulse" />
          ))}
        </div>
      ) : referrals.length === 0 ? (
        <div className="rounded-xl border border-ink/8 bg-white p-8 text-center">
          <div className="text-2xl mb-2">🔗</div>
          <p className="text-sm font-semibold text-ink/40">
            No active referral links yet.
          </p>
          <p className="text-xs text-ink/30 mt-1">
            Get approved for a campaign to receive your unique link.
          </p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {referrals.map((ref) => (
            <div
              key={ref.id}
              className="rounded-xl border border-mint/15 bg-white p-5 shadow-sm"
            >
              <div className="flex items-center justify-between mb-3">
                <p className="font-bold text-sm text-ink">{ref.campaignName}</p>
                <span className="text-xs font-bold bg-mint/10 text-mint px-2 py-0.5 rounded-md">
                  Active
                </span>
              </div>

              <div className="rounded-lg bg-cloud border border-ink/8 px-3 py-2 mb-3 flex items-center gap-2">
                <span className="text-xs font-mono text-ink/50 truncate flex-1">
                  {typeof window !== "undefined"
                    ? `${window.location.origin}/r/${ref.id}`
                    : `/r/${ref.id}`}
                </span>
                <button
                  onClick={() => copyLink(ref)}
                  className={`shrink-0 text-xs font-bold px-2 py-1 rounded transition ${
                    copied === ref.id
                      ? "bg-mint text-white"
                      : "bg-ink text-white hover:bg-mint"
                  }`}
                >
                  {copied === ref.id ? "✓" : "Copy"}
                </button>
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className="text-ink/40 font-medium">Total clicks</span>
                <span className="font-bold text-ink text-base">
                  {ref.clickStats?.totalCount || 0}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
