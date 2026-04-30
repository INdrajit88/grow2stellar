"use client";

import { useEffect, useState } from "react";
import { getMarketplaceCampaigns } from "../../lib/api";
import Link from "next/link";
import CampaignCard from "../components/CampaignCard";

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
      // Even if no token, the API allows optionalAuth and returns public campaigns
      const { campaigns: loaded } = await getMarketplaceCampaigns(token);
      setCampaigns(loaded);
    } catch(err) {
      console.error(err);
    }
    setLoading(false);
  }

  const filtered = campaigns.filter(c => {
    if (search && !c.title.toLowerCase().includes(search.toLowerCase()) && !c.description.toLowerCase().includes(search.toLowerCase())) return false;
    if (minReward && Number(c.rewardAmount || c.totalBudget || 0) < Number(minReward)) return false;
    return true;
  });

  return (
    <main className="min-h-screen bg-cloud font-sans text-ink">
      <header className="border-b border-ink/10 bg-white shadow-sm">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between p-5 md:px-8 md:py-4">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded bg-mint text-white">
              <span className="font-bold">G</span>
            </div>
            <h1 className="text-xl font-bold tracking-tight text-ink hidden sm:block">
              Grow2Stellar
            </h1>
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/ambassador/dashboard" className="text-sm font-semibold text-ink/70 hover:text-ink">My Hub</Link>
            <Link href="/" className="text-sm font-semibold border border-mint/30 bg-mint/10 text-mint px-4 py-1.5 rounded hover:bg-mint hover:text-white transition">Sign In</Link>
          </div>
        </div>
      </header>

      <section className="mx-auto w-full max-w-6xl px-5 py-12 md:px-8">
        <div className="mb-10">
           <h1 className="text-4xl font-bold mb-4 drop-shadow-sm">Global Marketplace</h1>
           <p className="text-lg text-ink/70 max-w-2xl leading-relaxed">Discover public projects, brands, and organizers looking for partners to help them grow. Find bounties that pay out automatically in native XLM.</p>
        </div>

        <div className="bg-white border border-ink/10 rounded-xl p-6 shadow-sm mb-8 flex flex-col sm:flex-row gap-4 justify-between items-end">
           <div className="w-full sm:w-1/2">
             <label className="text-xs font-bold uppercase text-ink/50 block mb-2">Search Campaigns</label>
             <input type="text" placeholder="Search by name, keyword, brand..." value={search} onChange={e => setSearch(e.target.value)} className="w-full border p-3 rounded-md bg-cloud/50 focus:bg-white transition text-sm" />
           </div>
           <div className="w-full sm:w-1/3">
             <label className="text-xs font-bold uppercase text-ink/50 block mb-2">Minimum Reward (XLM)</label>
             <input type="number" placeholder="0" value={minReward} onChange={e => setMinReward(e.target.value)} className="w-full border p-3 rounded-md bg-cloud/50 focus:bg-white transition text-sm" />
           </div>
           <button onClick={loadMarketplace} className="h-[46px] px-6 bg-ink text-white font-bold rounded hover:bg-mint transition text-sm">Refresh</button>
        </div>

        {loading ? (
          <div className="grid md:grid-cols-3 gap-6">
             <div className="h-48 bg-ink/5 animate-pulse rounded-xl"></div>
             <div className="h-48 bg-ink/5 animate-pulse rounded-xl"></div>
             <div className="h-48 bg-ink/5 animate-pulse rounded-xl"></div>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filtered.length === 0 && <p className="col-span-full text-center p-12 text-ink/50 bg-white border border-ink/10 rounded-xl font-semibold">No public campaigns found matching your criteria.</p>}
            
            {filtered.map(c => (
              <div key={c.id} className="group rounded-xl border border-ink/10 bg-white shadow-sm hover:shadow-md transition-all flex flex-col justify-between overflow-hidden">
                 <div className="p-6">
                    <div className="flex justify-between items-start mb-3">
                       <span className="text-xs font-bold uppercase tracking-widest bg-mint/10 text-mint px-2 py-1 rounded">Public Bounty</span>
                       <span className="text-xs font-bold bg-gold/10 text-gold px-2 py-1 rounded">Budget: {c.totalBudget || c.rewardAmount || 0} XLM</span>
                    </div>
                    <h2 className="text-xl font-bold text-ink mb-2">{c.title}</h2>
                    <p className="text-sm text-ink/70 line-clamp-3">{c.description}</p>
                 </div>
                 
                 <div className="p-4 border-t border-ink/5 bg-cloud/30">
                    <Link href={`/ambassador/campaigns`} className="block w-full text-center bg-ink text-white font-semibold py-2 rounded text-sm hover:bg-mint transition shadow-sm">
                       Apply inside Hub &rarr;
                    </Link>
                 </div>
              </div>
            ))}
          </div>
        )}

      </section>
    </main>
  );
}
