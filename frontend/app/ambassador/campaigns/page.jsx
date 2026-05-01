"use client";

import { useEffect, useState } from "react";
import {
  getCurrentUser,
  listCampaigns,
  applyToCampaign,
  listQuests,
  createSubmission,
} from "../../../lib/api";

const STATUS_STYLES = {
  approved: "bg-mint/10 border-mint/20 text-mint",
  rejected: "bg-coral/10 border-coral/20 text-coral",
  applied:  "bg-gold/10 border-gold/20 text-gold",
};

export default function AmbassadorCampaigns() {
  const [loading, setLoading] = useState(true);
  const [campaigns, setCampaigns] = useState([]);
  const [applyForms, setApplyForms] = useState({});
  const [questsByCampaign, setQuestsByCampaign] = useState({});
  const [submissionForms, setSubmissionForms] = useState({});
  const [token, setToken] = useState("");

  useEffect(() => { loadLiveCampaigns(); }, []);

  async function loadLiveCampaigns() {
    setLoading(true);
    const t = window.localStorage.getItem("grow2stellar.token");
    if (!t) return setLoading(false);
    setToken(t);
    try {
      const { user } = await getCurrentUser(t);
      const { campaigns: loaded } = await listCampaigns(t);
      setCampaigns(loaded.filter((c) => c.organizerId !== user.id));
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  }

  async function handleApply(campaignId) {
    const handle = applyForms[`${campaignId}_handle`];
    const pitch  = applyForms[`${campaignId}_pitch`];
    if (!handle || !pitch) return alert("Fill in both fields.");
    await applyToCampaign(token, campaignId, JSON.stringify({ handle, pitch }));
    loadLiveCampaigns();
  }

  async function loadCampaignQuests(campaignId) {
    const { quests } = await listQuests(token, campaignId);
    setQuestsByCampaign((prev) => ({ ...prev, [campaignId]: quests }));
  }

  async function handleSubmitProof(e, questId) {
    e.preventDefault();
    const url   = submissionForms[`${questId}_url`];
    const notes = submissionForms[`${questId}_notes`];
    await createSubmission(token, questId, { proofUrl: url, notes });
    alert("Proof submitted — the organizer will review it shortly.");
  }

  return (
    <div className="animate-fade-in">
      {/* Page header */}
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-ink">Bounty Board</h1>
        <p className="text-ink/50 mt-1 text-sm max-w-xl">
          Apply to campaigns, complete quests, and earn XLM automatically via Soroban.
        </p>
      </div>

      {loading ? (
        <div className="grid sm:grid-cols-2 gap-5">
          {[1, 2].map((i) => (
            <div key={i} className="h-48 rounded-xl bg-ink/5 animate-pulse" />
          ))}
        </div>
      ) : campaigns.length === 0 ? (
        <div className="rounded-xl border border-ink/8 bg-white p-10 text-center">
          <div className="text-3xl mb-3">🎯</div>
          <p className="font-semibold text-ink/50">No open campaigns right now.</p>
          <p className="text-sm text-ink/35 mt-1">Check back soon or explore the marketplace.</p>
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2">
          {campaigns.map((c) => (
            <div
              key={c.id}
              className="rounded-xl border border-ink/8 bg-white shadow-sm flex flex-col overflow-hidden"
            >
              {/* Card top accent */}
              <div className="h-1 bg-gradient-to-r from-mint to-mint/30" />

              <div className="p-5 flex-1 flex flex-col gap-4">
                {/* Title row */}
                <div className="flex items-start justify-between gap-3">
                  <h2 className="text-base font-bold text-ink leading-snug">{c.title}</h2>
                  <span className="shrink-0 text-xs font-bold bg-gold/10 text-gold px-2 py-1 rounded-md">
                    {c.totalBudget} XLM
                  </span>
                </div>

                <p className="text-sm text-ink/55 leading-relaxed line-clamp-2">{c.description}</p>

                {/* Application state */}
                {!c.viewer?.applicationStatus ? (
                  <div className="rounded-lg border border-ink/8 bg-cloud p-4 space-y-2.5">
                    <p className="text-xs font-bold uppercase tracking-wider text-ink/40">
                      Apply as Ambassador
                    </p>
                    <input
                      type="text"
                      placeholder="Twitter / Discord handle"
                      className="w-full rounded-lg border border-ink/10 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-mint/30 transition"
                      onChange={(e) =>
                        setApplyForms((p) => ({ ...p, [`${c.id}_handle`]: e.target.value }))
                      }
                    />
                    <textarea
                      placeholder="Why are you a good fit?"
                      rows={2}
                      className="w-full rounded-lg border border-ink/10 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-mint/30 transition resize-none"
                      onChange={(e) =>
                        setApplyForms((p) => ({ ...p, [`${c.id}_pitch`]: e.target.value }))
                      }
                    />
                    <button
                      onClick={() => handleApply(c.id)}
                      className="w-full rounded-lg bg-ink text-white text-sm font-semibold py-2 hover:bg-mint transition"
                    >
                      Send Application
                    </button>
                  </div>
                ) : (
                  <div
                    className={`rounded-lg border px-4 py-2.5 text-sm font-semibold ${
                      STATUS_STYLES[c.viewer.applicationStatus] || STATUS_STYLES.applied
                    }`}
                  >
                    Status: {c.viewer.applicationStatus.toUpperCase()}
                  </div>
                )}

                {/* Quests — only for approved ambassadors */}
                {c.viewer?.applicationStatus === "approved" && (
                  <div className="border-t border-ink/8 pt-4">
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-xs font-bold uppercase tracking-wider text-ink/40">
                        Available Quests
                      </p>
                      <button
                        onClick={() => loadCampaignQuests(c.id)}
                        className="text-xs font-semibold text-mint hover:underline"
                      >
                        Load quests
                      </button>
                    </div>

                    {questsByCampaign[c.id]?.length === 0 && (
                      <p className="text-xs text-ink/40">No live quests yet.</p>
                    )}

                    <div className="space-y-3">
                      {(questsByCampaign[c.id] || []).map((q) => (
                        <div
                          key={q.id}
                          className="rounded-lg border border-ink/8 bg-cloud p-3"
                        >
                          <div className="flex items-center justify-between mb-1">
                            <p className="text-sm font-bold text-ink">{q.title}</p>
                            <span className="text-xs font-bold text-mint">{q.rewardAmount} XLM</span>
                          </div>
                          <p className="text-xs text-ink/50 mb-3">{q.description}</p>
                          <form
                            onSubmit={(e) => handleSubmitProof(e, q.id)}
                            className="space-y-2"
                          >
                            <input
                              type="url"
                              required
                              placeholder="Proof URL (tweet, post, etc.)"
                              className="w-full rounded-md border border-ink/10 bg-white px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-mint/30 transition"
                              onChange={(e) =>
                                setSubmissionForms((p) => ({
                                  ...p,
                                  [`${q.id}_url`]: e.target.value,
                                }))
                              }
                            />
                            <input
                              type="text"
                              placeholder="Notes (optional)"
                              className="w-full rounded-md border border-dashed border-ink/10 bg-white px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-mint/30 transition"
                              onChange={(e) =>
                                setSubmissionForms((p) => ({
                                  ...p,
                                  [`${q.id}_notes`]: e.target.value,
                                }))
                              }
                            />
                            <button
                              type="submit"
                              className="w-full rounded-md bg-ink text-white text-xs font-semibold py-2 hover:bg-mint transition"
                            >
                              Submit Proof →
                            </button>
                          </form>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
