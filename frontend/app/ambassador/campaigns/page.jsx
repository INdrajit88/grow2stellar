"use client";

import { useEffect, useState } from "react";
import { getCurrentUser, listCampaigns, applyToCampaign, listQuests, createSubmission } from "../../../lib/api";

export default function AmbassadorCampaigns() {
  const [loading, setLoading] = useState(true);
  const [campaigns, setCampaigns] = useState([]);
  const [applyForms, setApplyForms] = useState({});
  const [questsByCampaign, setQuestsByCampaign] = useState({});
  const [submissionForms, setSubmissionForms] = useState({});
  const [token, setSessionToken] = useState("");

  useEffect(() => {
    loadLiveCampaigns();
  }, []);

  async function loadLiveCampaigns() {
    setLoading(true);
    const sessionToken = window.localStorage.getItem("grow2stellar.token");
    if (!sessionToken) return;
    setSessionToken(sessionToken);

    try {
      const { user } = await getCurrentUser(sessionToken);
      const { campaigns: loaded } = await listCampaigns(sessionToken);
      
      const externalOnly = loaded.filter(c => c.organizerId !== user.id);
      setCampaigns(externalOnly);
    } catch(err) {
      console.error(err);
    }
    setLoading(false);
  }

  async function handleApply(campaignId) {
    const handle = applyForms[`${campaignId}_handle`];
    const pitch = applyForms[`${campaignId}_pitch`];
    if(!handle || !pitch) return alert("Fill all fields");

    await applyToCampaign(token, campaignId, JSON.stringify({ handle, pitch }));
    loadLiveCampaigns();
  }

  async function loadCampaignQuests(campaignId) {
    const { quests } = await listQuests(token, campaignId);
    setQuestsByCampaign({ ...questsByCampaign, [campaignId]: quests });
  }

  async function handleSubmitProof(e, campaignId, questId) {
    e.preventDefault();
    const url = submissionForms[`${questId}_url`];
    const notes = submissionForms[`${questId}_notes`];
    
    await createSubmission(token, questId, { proofUrl: url, notes });
    alert("Proof submitted! The organizer will review it.");
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6 text-ink">Bounty Board</h1>
      <p className="text-ink/70 mb-8 max-w-2xl">Discover live campaigns, apply to be a partner, and submit proof of your marketing quests to earn XLM rewards directly from Soroban.</p>

      {loading ? (
        <p className="animate-pulse text-ink/70">Fetching active bounties...</p>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {campaigns.length === 0 && <p className="col-span-2 text-ink/60 p-6 bg-white border border-ink/10 rounded-lg">No open campaigns taking applications right now.</p>}

          {campaigns.map((c) => (
            <div key={c.id} className="rounded-xl border border-ink/10 bg-white shadow-sm overflow-hidden flex flex-col">
              <div className="p-6 pb-4 border-b border-ink/5 flex-1">
                <div className="flex justify-between items-start mb-2">
                   <h2 className="text-xl font-bold text-ink">{c.title}</h2>
                   <span className="text-xs bg-gold/10 text-gold font-bold px-2 py-1 rounded">Budget: {c.totalBudget} XLM</span>
                </div>
                <p className="text-sm text-ink/70 mb-4">{c.description}</p>
                
                {/* Application state */}
                {!c.viewer?.applicationStatus ? (
                  <div className="bg-cloud p-4 rounded mt-4 space-y-2 border border-ink/5">
                    <p className="text-xs font-bold uppercase text-ink/60 drop-shadow-sm mb-2">Partner Application</p>
                    <input type="text" placeholder="Your Twitter/Discord Handle" className="w-full text-xs p-2 border rounded" onChange={e => setApplyForms({...applyForms, [`${c.id}_handle`]: e.target.value})} />
                    <textarea placeholder="Why you?" rows={2} className="w-full text-xs p-2 border rounded" onChange={e => setApplyForms({...applyForms, [`${c.id}_pitch`]: e.target.value})} />
                    <button onClick={() => handleApply(c.id)} className="w-full bg-ink text-white font-bold py-1.5 text-xs rounded hover:bg-mint transition">Send Application</button>
                  </div>
                ) : (
                  <div className={`p-3 rounded text-sm font-semibold border ${
                      c.viewer.applicationStatus === 'approved' ? 'bg-mint/10 border-mint/20 text-mint' : 
                      c.viewer.applicationStatus === 'rejected' ? 'bg-coral/10 border-coral/20 text-coral' : 
                      'bg-gold/10 border-gold/20 text-gold'
                  }`}>
                    Application Status: {c.viewer.applicationStatus.toUpperCase()}
                  </div>
                )}
              </div>

              {/* Quests available only to approved */}
              {c.viewer?.applicationStatus === 'approved' && (
                <div className="p-6 pt-4 bg-ink/[0.02]">
                  <div className="flex justify-between items-center mb-4">
                     <h3 className="font-bold text-sm text-ink">Bounties / Quests</h3>
                     <button onClick={() => loadCampaignQuests(c.id)} className="text-xs text-mint font-bold hover:underline">Refresh Available</button>
                  </div>
                  
                  {questsByCampaign[c.id] && questsByCampaign[c.id].length === 0 && <p className="text-xs text-ink/60">No live quests currently.</p>}
                  
                  <div className="space-y-3">
                    {(questsByCampaign[c.id] || []).map(q => (
                       <div key={q.id} className="bg-white border border-ink/10 rounded p-3">
                          <div className="flex justify-between">
                            <p className="font-bold text-sm text-ink">{q.title}</p>
                            <span className="text-mint font-bold text-xs">{q.rewardAmount} XLM</span>
                          </div>
                          <p className="text-xs text-ink/60 mt-1 mb-3">{q.description}</p>
                          <form onSubmit={(e) => handleSubmitProof(e, c.id, q.id)} className="space-y-2">
                             <input type="url" required placeholder="Proof URL (e.g. valid tweet link)" className="w-full text-xs p-2 border rounded" onChange={e => setSubmissionForms({...submissionForms, [`${q.id}_url`]: e.target.value})} />
                             <input type="text" placeholder="Notes (optional)" className="w-full text-xs p-2 border border-dashed rounded" onChange={e => setSubmissionForms({...submissionForms, [`${q.id}_notes`]: e.target.value})} />
                             <button type="submit" className="w-full text-xs bg-ink text-white font-bold py-1.5 rounded hover:bg-mint transition border">Submit XLM Claim</button>
                          </form>
                       </div>
                    ))}
                  </div>
                </div>
              )}

            </div>
          ))}

        </div>
      )}
    </div>
  );
}
