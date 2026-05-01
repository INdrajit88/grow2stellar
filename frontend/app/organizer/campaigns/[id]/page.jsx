"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  listCampaigns,
  listCampaignApplications,
  approveAmbassador,
  rejectAmbassador,
  createQuest,
  listQuests,
} from "../../../../lib/api";

const QUEST_TYPES = [
  { value: "social_post",  label: "Social Media Post" },
  { value: "referral",     label: "Referral Drive" },
  { value: "workshop",     label: "Community Workshop" },
];

const INITIAL_QUEST = { title: "", description: "", rewardAmount: "10", type: "social_post" };

export default function CampaignDetails() {
  const { id } = useParams();
  const router = useRouter();

  const [campaign, setCampaign] = useState(null);
  const [applications, setApplications] = useState([]);
  const [quests, setQuests] = useState([]);
  const [questForm, setQuestForm] = useState(INITIAL_QUEST);
  const [copied, setCopied] = useState(false);

  useEffect(() => { if (id) loadData(); }, [id]);

  async function loadData() {
    const token = window.localStorage.getItem("grow2stellar.token");
    if (!token) return router.push("/");

    const { campaigns: loaded } = await listCampaigns(token);
    const found = loaded.find((c) => c.id === id);
    if (!found) return router.push("/organizer/campaigns");
    setCampaign(found);

    const appsRes = await listCampaignApplications(token, id);
    setApplications(appsRes.ambassadors || []);

    const questsRes = await listQuests(token, id);
    setQuests(questsRes.quests || []);
  }

  async function handleApproveApp(appId) {
    const token = window.localStorage.getItem("grow2stellar.token");
    await approveAmbassador(token, id, appId);
    loadData();
  }

  async function handleRejectApp(appId) {
    const token = window.localStorage.getItem("grow2stellar.token");
    await rejectAmbassador(token, id, appId);
    loadData();
  }

  async function handleCreateQuest(e) {
    e.preventDefault();
    const token = window.localStorage.getItem("grow2stellar.token");
    await createQuest(token, id, questForm);
    setQuestForm(INITIAL_QUEST);
    loadData();
  }

  function copyInviteLink() {
    const link = `${window.location.origin}/join/${campaign.inviteCode}`;
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const qField = (key) => ({
    value: questForm[key],
    onChange: (e) => setQuestForm((p) => ({ ...p, [key]: e.target.value })),
  });

  if (!campaign) {
    return (
      <div className="flex items-center gap-2 text-ink/40 text-sm animate-pulse">
        <div className="w-4 h-4 rounded-full border-2 border-ink/20 border-t-transparent animate-spin" />
        Loading campaign…
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      {/* Back + title */}
      <button
        onClick={() => router.push("/organizer/campaigns")}
        className="flex items-center gap-1.5 text-sm text-ink/40 hover:text-ink mb-5 transition"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back to campaigns
      </button>

      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-ink mb-3">{campaign.title}</h1>
        <div className="flex flex-wrap gap-2">
          <span
            className={`text-xs font-bold px-2.5 py-1 rounded-md ${
              campaign.visibility === "private"
                ? "bg-coral/10 text-coral border border-coral/15"
                : "bg-mint/10 text-mint border border-mint/15"
            }`}
          >
            {campaign.visibility === "private" ? "🔒 Private" : "🌍 Public"}
          </span>
          <span className="text-xs font-bold bg-gold/10 text-gold px-2.5 py-1 rounded-md border border-gold/15">
            {campaign.totalBudget || campaign.rewardAmount || 0} XLM budget
          </span>
        </div>
        <p className="text-sm text-ink/55 mt-3 max-w-2xl leading-relaxed">
          {campaign.description}
        </p>
      </div>

      {/* Private invite link */}
      {campaign.visibility === "private" && (
        <div className="rounded-xl border border-coral/15 bg-coral/5 p-4 sm:p-5 mb-8">
          <h3 className="text-sm font-bold text-coral mb-1">Private Invite Link</h3>
          <p className="text-xs text-ink/50 mb-3">
            Share this link to bypass the public application queue.
          </p>
          <div className="flex gap-2">
            <input
              readOnly
              value={`${typeof window !== "undefined" ? window.location.origin : ""}/join/${campaign.inviteCode}`}
              className="flex-1 min-w-0 rounded-lg border border-ink/10 bg-white px-3 py-2 text-xs font-mono text-ink/60 focus:outline-none"
            />
            <button
              onClick={copyInviteLink}
              className={`shrink-0 rounded-lg px-4 py-2 text-xs font-bold transition ${
                copied
                  ? "bg-mint text-white"
                  : "bg-ink text-white hover:bg-mint"
              }`}
            >
              {copied ? "Copied!" : "Copy"}
            </button>
          </div>
        </div>
      )}

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Applications */}
        <div className="rounded-xl border border-ink/8 bg-white p-5 sm:p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-ink">Applications</h2>
            <span className="text-xs font-bold bg-cloud text-ink/40 px-2 py-1 rounded-md">
              {applications.length} total
            </span>
          </div>

          {applications.length === 0 ? (
            <p className="text-sm text-ink/35">No applications yet.</p>
          ) : (
            <div className="space-y-3">
              {applications.map((app) => {
                let handle = "Unknown";
                let pitch = app.applicationMessage;
                if (app.applicationMessage?.startsWith("{")) {
                  try {
                    const p = JSON.parse(app.applicationMessage);
                    handle = p.handle || handle;
                    pitch = p.pitch || pitch;
                  } catch (_) {}
                }
                return (
                  <div
                    key={app.id}
                    className="rounded-lg border border-ink/8 bg-cloud p-4"
                  >
                    <p className="font-bold text-sm text-ink">{handle}</p>
                    <p className="text-xs text-ink/50 mt-1 italic">"{pitch}"</p>

                    {app.status === "applied" ? (
                      <div className="flex gap-2 mt-3">
                        <button
                          onClick={() => handleApproveApp(app.id)}
                          className="flex-1 rounded-md bg-mint text-white text-xs font-semibold py-1.5 hover:bg-mint/80 transition"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleRejectApp(app.id)}
                          className="flex-1 rounded-md border border-coral/30 text-coral text-xs font-semibold py-1.5 hover:bg-coral hover:text-white hover:border-coral transition"
                        >
                          Reject
                        </button>
                      </div>
                    ) : (
                      <span
                        className={`inline-block mt-2 px-2 py-0.5 text-xs font-bold rounded-md ${
                          app.status === "approved"
                            ? "bg-mint/10 text-mint"
                            : "bg-coral/10 text-coral"
                        }`}
                      >
                        {app.status.toUpperCase()}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Quests */}
        <div className="space-y-5">
          {/* Create quest */}
          <div className="rounded-xl border border-ink/8 bg-white p-5 sm:p-6 shadow-sm">
            <h2 className="font-bold text-ink mb-4">Create Quest</h2>
            <form onSubmit={handleCreateQuest} className="space-y-3">
              <input
                required
                type="text"
                placeholder="Quest title"
                className="w-full rounded-lg border border-ink/10 bg-cloud px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-mint/30 transition"
                {...qField("title")}
              />
              <textarea
                required
                placeholder="What exactly should ambassadors do?"
                rows={2}
                className="w-full rounded-lg border border-ink/10 bg-cloud px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-mint/30 transition resize-none"
                {...qField("description")}
              />
              <div className="flex gap-2">
                <select
                  className="flex-1 rounded-lg border border-ink/10 bg-cloud px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-mint/30 transition"
                  {...qField("type")}
                >
                  {QUEST_TYPES.map((t) => (
                    <option key={t.value} value={t.value}>
                      {t.label}
                    </option>
                  ))}
                </select>
                <input
                  required
                  type="number"
                  min="1"
                  placeholder="XLM"
                  className="w-24 rounded-lg border border-ink/10 bg-cloud px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-mint/30 transition"
                  {...qField("rewardAmount")}
                />
              </div>
              <button
                type="submit"
                className="w-full rounded-lg bg-ink text-white text-sm font-semibold py-2.5 hover:bg-mint transition"
              >
                Launch Quest
              </button>
            </form>
          </div>

          {/* Active quests */}
          <div className="rounded-xl border border-ink/8 bg-white p-5 sm:p-6 shadow-sm">
            <h2 className="font-bold text-ink mb-4">
              Active Quests
              <span className="ml-2 text-xs font-bold bg-cloud text-ink/40 px-2 py-0.5 rounded-md">
                {quests.length}
              </span>
            </h2>
            {quests.length === 0 ? (
              <p className="text-sm text-ink/35">No quests yet.</p>
            ) : (
              <ul className="space-y-2.5">
                {quests.map((q) => (
                  <li
                    key={q.id}
                    className="flex items-start justify-between gap-3 rounded-lg border border-ink/8 bg-cloud p-3"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-ink truncate">{q.title}</p>
                      <p className="text-xs text-ink/45 mt-0.5 line-clamp-1">
                        {q.description}
                      </p>
                    </div>
                    <span className="shrink-0 text-xs font-bold text-mint">
                      {q.rewardAmount} XLM
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
