"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getCampaignByInviteCode, joinCampaignByInvite } from "../../../lib/api";
import { connectFreighterWallet, getFreighterNetwork, signChallengeTransaction } from "../../../lib/freighter";

export default function JoinCampaignPage() {
  const params = useParams();
  const router = useRouter();
  const { inviteCode } = params;

  const [campaign, setCampaign] = useState(null);
  const [error, setError] = useState("");
  const [status, setStatus] = useState("loading"); // loading | ready | authenticating | joining | success

  useEffect(() => {
    loadInvite();
  }, [inviteCode]);

  async function loadInvite() {
    try {
      const { campaign: data } = await getCampaignByInviteCode(null, inviteCode);
      setCampaign(data);
      setStatus("ready");
    } catch(err) {
       setError(err.message || "Invalid or expired invite link.");
       setStatus("error");
    }
  }

  async function handleAccept() {
    try {
      setStatus("authenticating");
      let token = window.localStorage.getItem("grow2stellar.token");
      
      // If the user isn't logged in, instantly run Freighter Auth flow inline!
      if (!token) {
        const networkDetails = await getFreighterNetwork();
        if (!networkDetails || !networkDetails.network.toUpperCase().includes("TESTNET")) throw new Error("Please switch Freighter to TESTNET.");
        
        const address = await connectFreighterWallet();
        
        const res1 = await fetch("http://localhost:4000/api/auth/nonce", {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ walletAddress: address }),
        });
        const data1 = await res1.json();
        if (!res1.ok) throw new Error(data1.error?.message || "Failed to fetch nonce");
        
        const signedTransaction = await signChallengeTransaction({
          transaction: data1.transaction,
          address,
          networkPassphrase: networkDetails.networkPassphrase,
        });

        const res2 = await fetch("http://localhost:4000/api/auth/verify", {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ signedTransaction, walletAddress: address }),
        });
        const data2 = await res2.json();
        if (!res2.ok) throw new Error(data2.error?.message || "Verification failed");

        token = data2.token;
        window.localStorage.setItem("grow2stellar.token", token);
      }

      setStatus("joining");
      await joinCampaignByInvite(token, inviteCode);
      setStatus("success");
      
      setTimeout(() => {
         router.push("/ambassador/campaigns");
      }, 1500);

    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to join private campaign.");
      setStatus("ready"); // revert
    }
  }

  if (status === "loading") return <div className="min-h-screen flex items-center justify-center bg-cloud"><p className="animate-pulse font-bold text-ink/60">Loading Secure Invite...</p></div>;

  if (status === "error") return (
    <div className="min-h-screen flex items-center justify-center bg-cloud">
      <div className="bg-white p-8 rounded-xl border border-coral/20 max-w-md text-center shadow-sm">
        <h1 className="text-xl font-bold text-coral mb-2">Invite Failed</h1>
        <p className="text-ink/70">{error}</p>
        <button onClick={() => router.push('/')} className="mt-6 bg-ink text-white px-4 py-2 rounded text-sm hover:bg-mint transition">Go Home</button>
      </div>
    </div>
  );

  return (
    <main className="min-h-screen bg-cloud flex items-center justify-center p-4 font-sans">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl border border-ink/10 overflow-hidden">
        <div className="bg-ink p-8 text-white text-center">
           <span className="inline-block bg-mint/20 text-mint px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-4">Exclusive Invite</span>
           <h1 className="text-2xl font-bold mb-2">You have been invited!</h1>
           <p className="text-white/70">Join as an Ambassador to earn XLM.</p>
        </div>
        
        <div className="p-8">
           <div className="mb-6">
              <h2 className="text-xl font-bold text-ink">{campaign?.title}</h2>
              <div className="flex gap-2 mt-2">
                 <span className="text-xs bg-gold/10 text-gold font-bold px-2 py-1 rounded">Budget: {campaign?.totalBudget} XLM</span>
                 <span className="text-xs bg-cloud text-ink/70 font-bold px-2 py-1 rounded border">Private Access</span>
              </div>
           </div>

           <p className="text-sm text-ink/70 mb-8 p-4 bg-cloud border border-ink/5 rounded-lg italic">
             "{campaign?.description}"
           </p>

           {error && <p className="text-sm text-coral mb-4 text-center font-semibold bg-coral/10 py-2 rounded">{error}</p>}

           {status === "success" ? (
             <button className="w-full bg-mint text-white font-bold py-3 rounded text-lg flex justify-center items-center gap-2">
               <span>✓ Successfully Joined</span>
             </button>
           ) : (
             <button 
               onClick={handleAccept} 
               disabled={status !== "ready"}
               className="w-full bg-ink text-white font-bold py-3 rounded text-lg hover:bg-mint transition disabled:bg-ink/50"
             >
               {status === "authenticating" ? "Awaiting Wallet Signature..." : status === "joining" ? "Accepting Invite..." : "Connect Wallet to Accept"}
             </button>
           )}
           
           <p className="text-center text-xs text-ink/40 mt-4">By accepting, you bypass the public application process and instantly become an approved Ambassador for this campaign.</p>
        </div>
      </div>
    </main>
  );
}
