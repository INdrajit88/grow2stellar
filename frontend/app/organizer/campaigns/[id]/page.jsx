"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { 
  getCurrentUser, 
  listCampaigns, 
  listCampaignApplications,
  approveAmbassador,
  rejectAmbassador,
  createQuest,
  listQuests
} from "../../../../lib/api";

export default function CampaignDetails() {
  const params = useParams();
  const router = useRouter();
  const id = params.id;

  const [campaign, setCampaign] = useState(null);
  const [applications, setApplications] = useState([]);
  const [quests, setQuests] = useState([]);
  const [questForm, setQuestForm] = useState({ title: "", description: "", rewardAmount: "10", type: "social_post" });

  useEffect(() => {
    if (id) loadData();
  }, [id]);

  async function loadData() {
    const token = window.localStorage.getItem("grow2stellar.token");
    if (!token) return router.push("/");
    
    const { campaigns: loaded } = await listCampaigns(token);
    const found = loaded.find(c => c.id === id);
    if (!found) return router.push("/organizer/campaigns");
    
    setCampaign(found);

    const appsRes = await listCampaignApplications(token, id);
    setApplications(appsRes.ambassadors || []);

    const questsRes = await listQuests(token, id);
    setQuests(questsRes.quests || []);
  }

  async function handleApproveApp(appId) {
    const token = window.localStorage.getItem("grow2stellar.token");
    await approveAmbassador(token, campaign.id, appId);
    loadData();
  }

  async function handleRejectApp(appId) {
    const token = window.localStorage.getItem("grow2stellar.token");
    await rejectAmbassador(token, campaign.id, appId);
    loadData();
  }

  async function handleCreateQuest(e) {
    e.preventDefault();
    const token = window.localStorage.getItem("grow2stellar.token");
    await createQuest(token, campaign.id, questForm);
    setQuestForm({ title: "", description: "", rewardAmount: "10", type: "social_post" });
    loadData();
  }

  if (!campaign) return <p className="animate-pulse">Loading Campaign Details...</p>;

  return (
    <div>
      <button onClick={() => router.push("/organizer/campaigns")} className="mb-4 text-sm font-semibold text-ink/60 hover:text-ink">&larr; Back to Campaigns</button>
      <h1 className="text-3xl font-bold mb-2 text-ink">{campaign.title}</h1>
      
      <div className="flex items-center gap-4 mb-8">
         <span className={`font-bold px-3 py-1 rounded text-xs uppercase tracking-widest ${campaign.visibility === 'private' ? 'bg-coral/10 text-coral border border-coral/20' : 'bg-mint/10 text-mint border border-mint/20'}`}>
            {campaign.visibility || "Public"}
         </span>
         <span className="font-bold bg-cloud px-3 py-1 rounded text-ink text-sm border font-mono">Reward: {campaign.rewardAsset || "XLM"}</span>
         <span className="font-bold bg-gold/10 text-gold px-3 py-1 rounded text-sm border border-gold/20">Total Budget: {campaign.totalBudget || campaign.rewardAmount || 0} XLM</span>
      </div>
      
      <p className="text-ink/70 mb-8 max-w-3xl">{campaign.description}</p>

      {campaign.visibility === 'private' && (
        <div className="mb-8 p-4 bg-coral/5 border border-coral/20 rounded-lg max-w-xl">
           <h3 className="font-bold text-coral mb-2">Private Invite Link</h3>
           <p className="text-sm text-ink/70 mb-3">Copy this secure link and send it to specific Ambassadors. They will bypass the public application process and instantly join this campaign.</p>
           <div className="flex gap-2">
              <input type="text" readOnly value={`http://localhost:3000/join/${campaign.inviteCode}`} className="flex-1 bg-white border border-ink/20 rounded px-3 py-2 text-sm font-mono text-ink/80" />
              <button onClick={() => { navigator.clipboard.writeText(`http://localhost:3000/join/${campaign.inviteCode}`); alert('Link Copied!') }} className="bg-ink text-white font-bold px-4 rounded hover:bg-coral transition text-sm">Copy Link</button>
           </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Applications */}
        <div className="rounded-lg border border-ink/10 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-bold mb-4">Ambassador Applications</h2>
          <div className="space-y-4">
            {applications.length === 0 && <p className="text-sm text-ink/60">No pending applications.</p>}
            {applications.map(app => {
              let handle = "Unknown Handle";
              let pitch = app.applicationMessage;
              if (app.applicationMessage?.startsWith("{")) {
                try {
                  const parsed = JSON.parse(app.applicationMessage);
                  handle = parsed.handle || handle;
                  pitch = parsed.pitch || pitch;
                } catch(e) {}
              }
              return (
              <div key={app.id} className="rounded bg-cloud p-4 text-sm border border-ink/5">
                <p className="font-semibold text-lg">{handle}</p>
                <p className="text-ink/70 mt-1 italic">"{pitch}"</p>
                
                {app.status === "applied" ? (
                  <div className="mt-4 flex gap-2">
                    <button onClick={() => handleApproveApp(app.id)} className="rounded bg-mint px-3 py-1.5 font-semibold text-white">Approve</button>
                    <button onClick={() => handleRejectApp(app.id)} className="rounded bg-coral px-3 py-1.5 font-semibold text-white">Reject</button>
                  </div>
                ) : (
                  <span className={`inline-block mt-3 px-2 py-1 text-xs font-bold rounded ${app.status === "approved" ? "bg-mint/10 text-mint" : "bg-coral/10 text-coral"}`}>
                    {app.status.toUpperCase()}
                  </span>
                )}
              </div>
            )})}
          </div>
        </div>

        {/* Quests */}
        <div className="space-y-6">
          <div className="rounded-lg border border-ink/10 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-bold mb-4">Create Quest (Bounty)</h2>
            <form onSubmit={handleCreateQuest} className="space-y-3">
              <input type="text" required placeholder="Task Title" value={questForm.title} onChange={e => setQuestForm({...questForm, title: e.target.value})} className="w-full text-sm p-2 border rounded" />
              <textarea required placeholder="What exactly do they need to do?" rows={2} value={questForm.description} onChange={e => setQuestForm({...questForm, description: e.target.value})} className="w-full text-sm p-2 border rounded" />
              <div className="flex gap-2">
                <select className="flex-1 text-sm border p-2 rounded" value={questForm.type} onChange={e => setQuestForm({...questForm, type: e.target.value})}>
                  <option value="social_post">Social Media Post</option>
                  <option value="referral">Referral Drive</option>
                  <option value="workshop">Community Workshop</option>
                </select>
                <input type="number" required placeholder="Reward (XLM)" value={questForm.rewardAmount} onChange={e => setQuestForm({...questForm, rewardAmount: e.target.value})} className="w-32 text-sm p-2 border rounded" />
              </div>
              <button type="submit" className="w-full text-sm bg-ink text-white py-2 rounded font-bold hover:bg-mint transition">Launch Quest</button>
            </form>
          </div>

          <div className="rounded-lg border border-ink/10 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-bold mb-4">Active Quests</h2>
            {quests.length === 0 && <p className="text-sm text-ink/60">No quests created yet.</p>}
            <ul className="space-y-3">
              {quests.map(q => (
                <li key={q.id} className="p-3 border rounded text-sm bg-cloud">
                  <div className="flex justify-between items-start">
                    <p className="font-bold text-ink">{q.title}</p>
                    <span className="text-mint font-bold">{q.rewardAmount} XLM</span>
                  </div>
                  <p className="text-xs text-ink/70 mt-1">{q.description}</p>
                </li>
              ))}
            </ul>
          </div>
        </div>

      </div>
    </div>
  );
}
