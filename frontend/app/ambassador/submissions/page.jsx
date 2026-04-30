"use client";

import { useEffect, useState } from "react";
import { getCurrentUser, listCampaigns, listQuests, listSubmissions } from "../../../lib/api";

export default function AmbassadorSubmissions() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState([]); // Array of { campaign, quest, submission }

  useEffect(() => {
    loadMySubmissions();
  }, []);

  async function loadMySubmissions() {
    setLoading(true);
    const token = window.localStorage.getItem("grow2stellar.token");
    if (!token) return;

    try {
      const { user } = await getCurrentUser(token);
      const { campaigns } = await listCampaigns(token);
      
      const externalCampaigns = campaigns.filter(c => c.organizerId !== user.id && c.viewer?.applicationStatus === 'approved');

      const allData = [];
      
      for (const campaign of externalCampaigns) {
        const { quests } = await listQuests(token, campaign.id);
        
        for (const quest of quests) {
          const { submissions } = await listSubmissions(token, campaign.id, quest.id);
          // Filter only the submissions created by the current ambassador user.
          // Note: our current API lists ALL submissions if you ask, but wait, `listSubmissions` logic in backend says:
          // if req.user is ambassador, it only returns their own submissions!
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

  const pending = data.filter(d => d.submission.status === "pending");
  const reviewed = data.filter(d => d.submission.status !== "pending");

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6 text-ink">My Submissions</h1>
      <p className="text-ink/70 mb-8 max-w-2xl">Track the payout status of all your submitted web3 proofs and quests.</p>

      {loading ? (
        <p className="animate-pulse text-ink/70">Scanning blockchain for your rewards...</p>
      ) : (
        <div className="space-y-10">

          <section>
             <h2 className="text-xl font-bold mb-4 text-ink">Pending Payouts</h2>
             <div className="grid md:grid-cols-2 gap-4">
               {pending.length === 0 && <p className="col-span-2 text-ink/60 bg-white border border-ink/10 rounded p-4 font-semibold text-center mt-2">No pending claims right now. Go hunt some quests!</p>}
               {pending.map(({ campaign, quest, submission }) => (
                 <div key={submission.id} className="bg-white border border-ink/10 rounded-lg p-5 flex flex-col justify-between">
                    <div>
                      <p className="font-bold text-xs uppercase text-ink/60">{campaign.title}</p>
                      <p className="font-bold text-lg text-ink mt-1">{quest.title}</p>
                      <a href={submission.proofUrl} target="_blank" className="text-mint underline break-all inline-block my-2 text-sm">{submission.proofUrl}</a>
                    </div>
                    <div className="mt-3 pt-3 border-t border-ink/5 flex justify-between items-center">
                       <span className="text-sm font-bold bg-cloud px-2 py-1 rounded text-ink/70">Waiting for review...</span>
                       <span className="text-gold font-bold">{quest.rewardAmount} XLM</span>
                    </div>
                 </div>
               ))}
             </div>
          </section>

          <section>
            <h2 className="text-xl font-bold text-ink mb-4">Past Earning History</h2>
            <div className="w-full overflow-x-auto rounded-lg border border-ink/10 bg-white shadow-sm">
              <table className="w-full text-left text-sm">
                <thead className="bg-cloud text-ink/70 border-b border-ink/10">
                  <tr>
                    <th className="px-4 py-3 font-semibold uppercase">Campaign</th>
                    <th className="px-4 py-3 font-semibold uppercase">Quest</th>
                    <th className="px-4 py-3 font-semibold uppercase">Claimed URL</th>
                    <th className="px-4 py-3 font-semibold uppercase">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-ink/10">
                  {reviewed.length === 0 && <tr><td colSpan={4} className="px-4 py-6 text-center text-ink/60">No history found yet.</td></tr>}
                  {reviewed.map(({ campaign, quest, submission }) => (
                     <tr key={submission.id}>
                       <td className="px-4 py-3 text-ink/80">{campaign.title}</td>
                       <td className="px-4 py-3 font-semibold">{quest.title} <span className="text-mint font-bold ml-1">({quest.rewardAmount} XLM)</span></td>
                       <td className="px-4 py-3"><a className="text-mint underline truncate inline-block max-w-[150px]" href={submission.proofUrl} target="_blank">View</a></td>
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
