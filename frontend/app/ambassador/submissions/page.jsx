"use client";

import { useEffect, useState } from "react";
import { getCurrentUser, listCampaigns, listQuests, listSubmissions } from "../../../lib/api";

export default function AmbassadorSubmissions() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState([]);

  useEffect(() => { loadMySubmissions(); }, []);

  async function loadMySubmissions() {
    setLoading(true);
    const token = window.localStorage.getItem("grow2stellar.token");
    if (!token) return setLoading(false);

    try {
      const { user } = await getCurrentUser(token);
      const { campaigns } = await listCampaigns(token);
      const approved = campaigns.filter(
        (c) => c.organizerId !== user.id && c.viewer?.applicationStatus === "approved"
      );

      const rows = [];
      for (const campaign of approved) {
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

  const pending  = data.filter((d) => d.submission.status === "pending");
  const reviewed = data.filter((d) => d.submission.status !== "pending");

  return (
    <div className="animate-fade-in">
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-ink">My Submissions</h1>
        <p className="text-ink/50 mt-1 text-sm">Track the review status of all your proof submissions.</p>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 rounded-xl bg-ink/5 animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="space-y-10">
          {/* Pending */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <h2 className="text-lg font-bold text-ink">Pending Review</h2>
              {pending.length > 0 && (
                <span className="rounded-full bg-gold/15 text-gold text-xs font-bold px-2.5 py-0.5">
                  {pending.length}
                </span>
              )}
            </div>

            {pending.length === 0 ? (
              <div className="rounded-xl border border-ink/8 bg-white p-8 text-center">
                <div className="text-2xl mb-2">✅</div>
                <p className="text-sm font-semibold text-ink/40">
                  Nothing pending — go hunt some quests!
                </p>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 gap-4">
                {pending.map(({ campaign, quest, submission }) => (
                  <div
                    key={submission.id}
                    className="rounded-xl border border-gold/20 bg-white p-5"
                  >
                    <p className="text-xs font-bold uppercase tracking-wider text-ink/35 mb-1">
                      {campaign.title}
                    </p>
                    <p className="font-bold text-ink mb-2">{quest.title}</p>
                    <a
                      href={submission.proofUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-mint text-xs underline break-all block mb-3"
                    >
                      {submission.proofUrl}
                    </a>
                    <div className="flex items-center justify-between pt-3 border-t border-ink/8">
                      <span className="text-xs bg-gold/10 text-gold font-bold px-2 py-1 rounded-md">
                        Awaiting review
                      </span>
                      <span className="font-bold text-mint text-sm">
                        {quest.rewardAmount} XLM
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* History */}
          <section>
            <h2 className="text-lg font-bold text-ink mb-4">Earning History</h2>
            <div className="rounded-xl border border-ink/8 bg-white overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-cloud border-b border-ink/8">
                    <tr>
                      {["Campaign", "Quest", "Proof", "Status"].map((h) => (
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
                          colSpan={4}
                          className="px-4 py-8 text-center text-ink/35 text-sm"
                        >
                          No history yet.
                        </td>
                      </tr>
                    ) : (
                      reviewed.map(({ campaign, quest, submission }) => (
                        <tr key={submission.id} className="hover:bg-cloud/50 transition">
                          <td className="px-4 py-3 text-ink/70 text-xs">{campaign.title}</td>
                          <td className="px-4 py-3 font-semibold text-ink text-xs">
                            {quest.title}
                            <span className="ml-1.5 text-mint font-bold">
                              {quest.rewardAmount} XLM
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <a
                              href={submission.proofUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-mint text-xs underline"
                            >
                              View →
                            </a>
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
