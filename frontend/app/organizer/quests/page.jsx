"use client";

import { useEffect, useState } from "react";
import { getCurrentUser, listCampaigns, listQuests, listSubmissions, approveSubmission, rejectSubmission } from "../../../lib/api";

export default function OrganizerQuests() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState([]); // Array of { campaign, quest, submission }

  useEffect(() => {
    loadGlobalSubmissions();
  }, []);

  async function loadGlobalSubmissions() {
    setLoading(true);
    const token = window.localStorage.getItem("grow2stellar.token");
    if (!token) return;

    try {
      const { user } = await getCurrentUser(token);
      const { campaigns } = await listCampaigns(token);
      const myCampaigns = campaigns.filter(c => c.organizerId === user.id);

      const allData = [];
      
      for (const campaign of myCampaigns) {
        const { quests } = await listQuests(token, campaign.id);
        
        for (const quest of quests) {
          const { submissions } = await listSubmissions(token, campaign.id, quest.id);
          for (const sub of submissions) {
             allData.push({ campaign, quest, submission: sub });
          }
        }
      }
      
      setData(allData.sort((a, b) => new Date(b.submission.createdAt) - new Date(a.submission.createdAt)));
    } catch(err) {
      console.error(err);
    }
    setLoading(false);
  }

  async function handleApprove(cId, qId, sId) {
    const token = window.localStorage.getItem("grow2stellar.token");
    await approveSubmission(token, cId, qId, sId);
    loadGlobalSubmissions();
  }

  async function handleReject(cId, qId, sId) {
    const token = window.localStorage.getItem("grow2stellar.token");
    await rejectSubmission(token, cId, qId, sId);
    loadGlobalSubmissions();
  }

  const pending = data.filter(d => d.submission.status === "pending");
  const reviewed = data.filter(d => d.submission.status !== "pending");

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6 text-ink">Quests & Approvals</h1>
      <p className="text-ink/70 mb-8 max-w-2xl">Review proof of work submitted by ambassadors across all your campaigns and trigger Soroban payouts.</p>

      {loading ? (
        <p className="animate-pulse text-ink/70">Loading global submissions...</p>
      ) : (
        <div className="space-y-12">
          
          {/* Pending Submissions */}
          <section>
            <h2 className="text-xl font-bold bg-mint text-white inline-block px-3 py-1 rounded-md mb-4">Requires Action: {pending.length}</h2>
            {pending.length === 0 ? (
              <div className="p-6 bg-white border border-ink/10 rounded-lg text-ink/60">No pending submissions to review. You're all caught up!</div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {pending.map(({ campaign, quest, submission }) => (
                  <div key={submission.id} className="bg-white border border-mint/30 shadow-sm rounded-lg p-5">
                    <p className="text-xs font-bold text-mint uppercase">{campaign.title}</p>
                    <h3 className="font-semibold text-lg">{quest.title} <span className="text-ink/50 ml-1 text-sm bg-cloud px-2 py-0.5 rounded">Reward: {quest.rewardAmount} XLM</span></h3>
                    
                    <div className="mt-4 border-t border-ink/10 pt-3 text-sm">
                      <p className="font-semibold">Submitted Proof:</p>
                      <a href={submission.proofUrl} target="_blank" className="text-mint underline break-all inline-block my-1">{submission.proofUrl}</a>
                      {submission.notes && <p className="italic text-ink/70">"{submission.notes}"</p>}
                    </div>

                    <div className="mt-5 flex gap-2">
                      <button onClick={() => handleApprove(campaign.id, quest.id, submission.id)} className="flex-1 bg-ink text-white font-semibold py-2 rounded hover:bg-mint transition">Approve & Pay</button>
                      <button onClick={() => handleReject(campaign.id, quest.id, submission.id)} className="flex-1 border border-coral text-coral font-semibold py-2 rounded hover:bg-coral hover:text-white transition">Reject Proof</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Past History */}
          <section>
            <h2 className="text-xl font-bold text-ink mb-4">Review History</h2>
            <div className="w-full overflow-x-auto rounded-lg border border-ink/10 bg-white shadow-sm">
              <table className="w-full text-left text-sm">
                <thead className="bg-cloud text-ink/70 border-b border-ink/10">
                  <tr>
                    <th className="px-4 py-3 font-semibold uppercase">Campaign</th>
                    <th className="px-4 py-3 font-semibold uppercase">Quest</th>
                    <th className="px-4 py-3 font-semibold uppercase">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-ink/10">
                  {reviewed.length === 0 && <tr><td colSpan={3} className="px-4 py-6 text-center text-ink/60">No history found.</td></tr>}
                  {reviewed.map(({ campaign, quest, submission }) => (
                     <tr key={submission.id}>
                       <td className="px-4 py-3 text-ink/80">{campaign.title}</td>
                       <td className="px-4 py-3 font-semibold">{quest.title}</td>
                       <td className="px-4 py-3">
                         <span className={`px-2 py-1 text-xs font-bold rounded ${submission.status === 'approved' ? 'bg-mint/10 text-mint' : 'bg-coral/10 text-coral'}`}>
                           {submission.status.toUpperCase()}
                         </span>
                       </td>
                     </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

        </div>
      )}
    </div>
  );
}
