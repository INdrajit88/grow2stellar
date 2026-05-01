"use client";

import { useEffect, useState } from "react";
import { getMarketplaceCampaigns } from "../../lib/api";
import Link from "next/link";
import Header from "../components/Header";
import Footer from "../components/Footer";

export default function MarketplacePage() {
  const [loading, setLoading] = useState(true);
  const [campaigns, setCampaigns] = useState([]);
  const [search, setSearch] = useState("");
  const [minReward, setMinReward] = useState("");

  useEffect(() => {
    loadMarketplace();
  }, []);

  async function loadMarketplace() {
    setLoading(true);
    try {
      const token = window.localStorage.getItem("grow2stellar.token");
      const { campaigns: loaded } = await getMarketplaceCampaigns(token);
      setCampaigns(loaded);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  }

  const filtered = campaigns.filter((c) => {
    if (
      search &&
      !c.title.toLowerCase().includes(search.toLowerCase()) &&
      !c.description.toLowerCase().includes(search.toLowerCase())
    )
      return false;
    if (
      minReward &&
      Number(c.rewardAmount || c.totalBudget || 0) < Number(minReward)
    )
      return false;
    return true;
  });

  return (
    <div className="flex flex-col min-h-screen bg-cloud">
      <Header />

      <main className="flex-1">
        {/* Page header */}
        <div className="bg-white border-b border-ink/8">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
              <div>
                <h1 className="text-3xl sm:text-4xl font-bold text-ink mb-2">
                  Campaign Marketplace
                </h1>
                <p className="text-ink/50 max-w-xl">
                  Open bounties from brands looking for ambassadors. Apply,
                  complete quests, and earn XLM automatically via Soroban.
                </p>
              </div>
              <div className="shrink-0">
                <span className="inline-flex items-center gap-2 rounded-full bg-mint/10 border border-mint/20 px-3 py-1.5 text-xs font-semibold text-mint">
                  <span className="w-1.5 h-1.5 rounded-full bg-mint animate-pulse" />
                  {campaigns.length} campaigns live
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-8">
          {/* Filters */}
          <div className="rounded-xl border border-ink/8 bg-white p-4 sm:p-5 mb-8 flex flex-col sm:flex-row gap-3 items-end">
            <div className="flex-1 min-w-0">
              <label className="block text-xs font-semibold uppercase tracking-wider text-ink/40 mb-1.5">
                Search
              </label>
              <div className="relative">
                <svg
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink/30"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  placeholder="Search campaigns…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-ink/10 bg-cloud text-sm focus:outline-none focus:ring-2 focus:ring-mint/30 focus:border-mint/40 transition"
                />
              </div>
            </div>
            <div className="w-full sm:w-44">
              <label className="block text-xs font-semibold uppercase tracking-wider text-ink/40 mb-1.5">
                Min reward (XLM)
              </label>
              <input
                type="number"
                placeholder="0"
                value={minReward}
                onChange={(e) => setMinReward(e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg border border-ink/10 bg-cloud text-sm focus:outline-none focus:ring-2 focus:ring-mint/30 focus:border-mint/40 transition"
              />
            </div>
            <button
              onClick={loadMarketplace}
              className="shrink-0 h-[42px] px-5 rounded-lg bg-ink text-white text-sm font-semibold hover:bg-mint transition"
            >
              Refresh
            </button>
          </div>

          {/* Grid */}
          {loading ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div
                  key={i}
                  className="h-52 rounded-xl bg-ink/5 animate-pulse"
                />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-20 rounded-xl border border-ink/8 bg-white">
              <div className="text-4xl mb-3">🔍</div>
              <p className="font-semibold text-ink/50">No campaigns match your filters.</p>
              <button
                onClick={() => { setSearch(""); setMinReward(""); }}
                className="mt-4 text-sm text-mint hover:underline"
              >
                Clear filters
              </button>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {filtered.map((c) => (
                <article
                  key={c.id}
                  className="group rounded-xl border border-ink/8 bg-white hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 flex flex-col overflow-hidden"
                >
                  {/* Card header accent */}
                  <div className="h-1.5 bg-gradient-to-r from-mint to-mint/40" />

                  <div className="p-5 flex-1 flex flex-col">
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <span className="text-xs font-bold uppercase tracking-wider bg-mint/8 text-mint px-2 py-1 rounded-md">
                        Public Bounty
                      </span>
                      <span className="text-xs font-bold bg-gold/10 text-gold px-2 py-1 rounded-md whitespace-nowrap">
                        {c.totalBudget || c.rewardAmount || 0} XLM
                      </span>
                    </div>

                    <h2 className="text-base font-bold text-ink mb-2 leading-snug">
                      {c.title}
                    </h2>
                    <p className="text-sm text-ink/55 line-clamp-3 leading-relaxed flex-1">
                      {c.description}
                    </p>
                  </div>

                  <div className="px-5 pb-5">
                    <Link
                      href="/ambassador/campaigns"
                      className="block w-full text-center rounded-lg bg-ink text-white text-sm font-semibold py-2.5 group-hover:bg-mint transition"
                    >
                      Apply in Hub →
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
