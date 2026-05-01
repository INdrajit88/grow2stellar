"use client";

import { useEffect, useState } from "react";
import {
  getCurrentUser,
  listCampaigns,
  listQuests,
  listSubmissions,
  approveSubmission,
  rejectSubmission,
} from "../../../lib/api";

export default function OrganizerQuests() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState([]);

  useEffect(() => { loadGlobalSubmissions(); }, []);

  async function loadGlobalSubmissions() {
    setLoading(true);
    const token = window.localStorage.getItem("grow2stellar.token");
    if (!token) return setLoading(false);

    try {
      const { user } = await getCurrentUser(token);
      const { campaigns } = await listCampaigns(token);
      const mine = campaigns.filter((c) => c.organizerId === user.id);

      const rows = [];
      for (const campaign of mine) {
        const { quests } = await listQuests(token, campaign.id);
        for (const quest of quests) {
          const { submissions } = await listSubmissions(token, quest.id);
          for (const sub of submissions) {
            rows.push({ campaign, quest, submission: sub });
          }
        }
      }

      setData(
        rows.sort(
          (a, b) =>
            new Date(b.submission.createdAt) - new Date(a.submission.createdAt)
        )
      );
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  }

  async function handleApprove(questId, submissionId) {
    const token = window.localStorage.getItem("grow2stellar.token");
    await approveSubmission(token, questId, submissionId);
    loadGlobalSubmissions();
  }

  async function handleReject(questId, submissionId) {
    const token = window.localStorage.getItem("grow2stellar.token");
    await rejectSubmission(token, questId, submissionId);
    loadGlobalSubmissions();
  }

  const pending  = data.filter((d) => d.submission.status === "pending");
  const reviewed = data.filter((d) => d.submission.status !== "pending");

  return (
    <div className="animate-fade-in">
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-ink">Quests & Approvals</h1>
        <p className="text-ink/50 mt-1 text-sm max-w-xl">
          Review ambassador proof submissions and trigger Soroban payouts.
        </p>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 rounded-xl bg-ink/5 animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="space-y-10">
          {/* Pending */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <h2 className="text-lg font-bold text-ink">Needs Review</h2>
              <span
                className={`rounded-full text-xs font-bold px-2.5 py-0.5 ${
                  pending.length > 0
                    ? "bg-coral/10 text-coral"
                    : "bg-ink/8 text-ink/40"
                }`}
              >
                {pending.length}
              </span>
            </div>

            {pending.length === 0 ? (
              <div className="rounded-xl border border-ink/8 bg-white p-8 text-center">
                <div className="text-2xl mb-2">🎉</div>
                <p className="text-sm font-semibold text-ink/40">
                  All caught up — no pending submissions.
                </p>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 gap-4">
                {pending.map(({ campaign, quest, submission }) => (
                  <div
                    key={submission.id}
                    className="rounded-xl border border-mint/20 bg-white p-5 shadow-sm"
                  >
                    <p className="text-xs font-bold uppercase tracking-wider text-mint mb-1">
                      {campaign.title}
                    </p>
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-bold text-ink">{quest.title}</h3>
                      <span className="text-xs font-bold bg-cloud text-ink/60 px-2 py-1 rounded-md border border-ink/8">
                        {quest.rewardAmount} XLM
                      </span>
                    </div>

                    <div className="rounded-lg bg-cloud border border-ink/8 p-3 mb-4">
                      <p className="text-xs font-semibold text-ink/40 mb-1">Proof submitted</p>
                      <a
                        href={submission.proofUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-mint text-xs underline break-all"
                      >
                        {submission.proofUrl}
                      </a>
                      {submission.notes && (
                        <p className="text-xs text-ink/50 mt-1.5 italic">
                          "{submission.notes}"
                        </p>
                      )}
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => handleApprove(quest.id, submission.id)}
                        className="flex-1 rounded-lg bg-ink text-white text-sm font-semibold py-2 hover:bg-mint transition"
                      >
                        Approve & Pay
                      </button>
                      <button
                        onClick={() => handleReject(quest.id, submission.id)}
                        className="flex-1 rounded-lg border border-coral/30 text-coral text-sm font-semibold py-2 hover:bg-coral hover:text-white hover:border-coral transition"
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* History */}
          <section>
            <h2 className="text-lg font-bold text-ink mb-4">Review History</h2>
            <div className="rounded-xl border border-ink/8 bg-white overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-cloud border-b border-ink/8">
                    <tr>
                      {["Campaign", "Quest", "Status"].map((h) => (
                        <th
                          key={h}
                          className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-ink/40"
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-ink/8">
                    {reviewed.length === 0 ? (
                      <tr>
                        <td
                          colSpan={3}
                          className="px-4 py-8 text-center text-ink/35 text-sm"
                        >
                          No history yet.
                        </td>
                      </tr>
                    ) : (
                      reviewed.map(({ campaign, quest, submission }) => (
                        <tr
                          key={submission.id}
                          className="hover:bg-cloud/50 transition"
                        >
                          <td className="px-4 py-3 text-xs text-ink/60">
                            {campaign.title}
                          </td>
                          <td className="px-4 py-3 text-xs font-semibold text-ink">
                            {quest.title}
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className={`inline-block px-2 py-0.5 text-xs font-bold rounded-md ${
                                submission.status === "approved"
                                  ? "bg-mint/10 text-mint"
                                  : "bg-coral/10 text-coral"
                              }`}
                            >
                              {submission.status.toUpperCase()}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
