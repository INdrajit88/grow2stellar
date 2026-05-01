"use client";

import { useEffect, useState } from "react";
import {
  getCurrentUser,
  listCampaigns,
  createCampaign as apiCreateCampaign,
} from "../../../lib/api";
import CampaignCard from "../../components/CampaignCard";

const INITIAL_FORM = {
  title: "",
  description: "",
  totalBudget: "100",
  visibility: "public",
};

export default function OrganizerCampaigns() {
  const [campaigns, setCampaigns] = useState([]);
  const [form, setForm] = useState(INITIAL_FORM);
  const [creating, setCreating] = useState(false);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => { loadCampaigns(); }, []);

  async function loadCampaigns() {
    const token = window.localStorage.getItem("grow2stellar.token");
    if (!token) return;
    const { user } = await getCurrentUser(token);
    const { campaigns: loaded } = await listCampaigns(token);
    setCampaigns(loaded.filter((c) => c.organizerId === user.id));
  }

  async function handleCreate(e) {
    e.preventDefault();
    setCreating(true);
    const token = window.localStorage.getItem("grow2stellar.token");
    await apiCreateCampaign(token, {
      title: form.title,
      description: form.description,
      rewardAmount: form.totalBudget,
      rewardAsset: "XLM",
      visibility: form.visibility,
    });
    setForm(INITIAL_FORM);
    setShowForm(false);
    setCreating(false);
    loadCampaigns();
  }

  const field = (key) => ({
    value: form[key],
    onChange: (e) => setForm((p) => ({ ...p, [key]: e.target.value })),
  });

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-8 gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-ink">My Campaigns</h1>
          <p className="text-ink/50 mt-1 text-sm">
            {campaigns.length} campaign{campaigns.length !== 1 ? "s" : ""} total
          </p>
        </div>
        <button
          onClick={() => setShowForm((v) => !v)}
          className="rounded-lg bg-ink text-white text-sm font-semibold px-4 py-2.5 hover:bg-mint transition"
        >
          {showForm ? "Cancel" : "+ New Campaign"}
        </button>
      </div>

      {/* Create form */}
      {showForm && (
        <div className="rounded-xl border border-ink/8 bg-white p-5 sm:p-6 mb-8 shadow-sm animate-fade-in">
          <h2 className="text-base font-bold text-ink mb-4">Launch a new campaign</h2>
          <form onSubmit={handleCreate} className="grid sm:grid-cols-2 gap-4">
            <input
              required
              type="text"
              placeholder="Campaign title"
              className="rounded-lg border border-ink/10 bg-cloud px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-mint/30 transition"
              {...field("title")}
            />
            <div className="flex gap-2">
              <input
                required
                type="number"
                min="1"
                placeholder="Budget (XLM)"
                className="flex-1 rounded-lg border border-ink/10 bg-cloud px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-mint/30 transition"
                {...field("totalBudget")}
              />
              <select
                className="rounded-lg border border-ink/10 bg-cloud px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-mint/30 transition"
                {...field("visibility")}
              >
                <option value="public">🌍 Public</option>
                <option value="private">🔒 Private</option>
              </select>
            </div>
            <textarea
              required
              placeholder="Describe the campaign goals and what ambassadors should do…"
              rows={3}
              className="sm:col-span-2 rounded-lg border border-ink/10 bg-cloud px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-mint/30 transition resize-none"
              {...field("description")}
            />
            <button
              type="submit"
              disabled={creating}
              className="sm:col-span-2 rounded-lg bg-ink text-white font-semibold py-2.5 text-sm hover:bg-mint transition disabled:opacity-50"
            >
              {creating ? "Launching…" : "Launch Campaign"}
            </button>
          </form>
        </div>
      )}

      {/* Campaign grid */}
      {campaigns.length === 0 ? (
        <div className="rounded-xl border border-ink/8 bg-white p-10 text-center">
          <div className="text-3xl mb-3">🚀</div>
          <p className="font-semibold text-ink/50">No campaigns yet.</p>
          <button
            onClick={() => setShowForm(true)}
            className="mt-4 text-sm text-mint hover:underline font-semibold"
          >
            Create your first campaign →
          </button>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-5">
          {campaigns.map((c) => (
            <CampaignCard key={c.id} campaign={c} role="organizer" />
          ))}
        </div>
      )}
    </div>
  );
}
