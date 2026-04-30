"use client";

import { useEffect, useState } from "react";
import { getCurrentUser, listCampaigns, createCampaign as apiCreateCampaign } from "../../../lib/api";
import CampaignCard from "../../components/CampaignCard";

export default function OrganizerCampaigns() {
  const [campaigns, setCampaigns] = useState([]);
  const [form, setForm] = useState({ title: "", description: "", totalBudget: "100" });

  useEffect(() => {
    loadCampaigns();
  }, []);

  async function loadCampaigns() {
    const token = window.localStorage.getItem("grow2stellar.token");
    if (!token) return;
    const { user } = await getCurrentUser(token);
    const { campaigns: loaded } = await listCampaigns(token);
    setCampaigns(loaded.filter(c => c.organizerId === user.id));
  }

  async function handleCreate(e) {
    e.preventDefault();
    const token = window.localStorage.getItem("grow2stellar.token");
    await apiCreateCampaign(token, {
      title: form.title,
      description: form.description,
      rewardAmount: form.totalBudget,
      rewardAsset: "XLM",
      visibility: form.visibility || "public",
    });
    setForm({ title: "", description: "", totalBudget: "100", visibility: "public" });
    loadCampaigns();
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6 text-ink">My Campaigns</h1>
      
      <div className="mb-10 bg-cloud/50 p-6 rounded-lg border border-ink/10">
        <h2 className="text-xl font-bold mb-4">Create New Campaign</h2>
        <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input required type="text" placeholder="Campaign Title" value={form.title} onChange={e => setForm({...form, title: e.target.value})} className="p-2 border rounded" />
          <div className="flex gap-2">
             <input required type="number" placeholder="Total Budget (XLM)" value={form.totalBudget} onChange={e => setForm({...form, totalBudget: e.target.value})} className="p-2 border rounded flex-1" />
             <select value={form.visibility || "public"} onChange={e => setForm({...form, visibility: e.target.value})} className="p-2 border rounded bg-white">
                <option value="public">🌍 Public (Marketplace)</option>
                <option value="private">🔒 Private (Invite Only)</option>
             </select>
          </div>
          <textarea required placeholder="Description" rows={3} value={form.description} onChange={e => setForm({...form, description: e.target.value})} className="p-2 border rounded md:col-span-2" />
          <button type="submit" className="md:col-span-2 bg-ink text-white font-bold py-2 rounded hover:bg-mint transition">Launch Campaign</button>
        </form>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
         {campaigns.length === 0 ? <p className="text-ink/60 col-span-2">No campaigns found.</p> : null}
         {campaigns.map(c => <CampaignCard key={c.id} campaign={c} role="organizer" />)}
      </div>
    </div>
  );
}
