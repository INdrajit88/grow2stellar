"use client";

import { useEffect, useState } from "react";
import { getDashboardStats } from "../../../lib/api";
import StatCard from "../../components/StatCard";

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    const token = window.localStorage.getItem("grow2stellar.token");
    if (token) {
      getDashboardStats(token).then((data) => setStats(data)).catch(console.error);
    }
  }, []);

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6 text-ink">Global Overview</h1>
      
      {!stats ? (
        <p className="text-ink/60 animate-pulse">Loading global statistics...</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Total Users" value={stats.totalUsers || 0} color="ink" />
          <StatCard title="Global Campaigns" value={stats.totalCampaigns || 0} color="ink" />
          <StatCard title="Total Clicks" value={stats.totalClicks || 0} color="mint" />
          <StatCard title="XLM Rewarded" value={stats.totalPayoutsXLM || 0} color="gold" />
        </div>
      )}
    </div>
  );
}
