"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  getCampaignByInviteCode,
  joinCampaignByInvite,
  requestWalletChallenge,
  verifyWalletChallenge,
} from "../../../lib/api";
import {
  connectFreighterWallet,
  getFreighterNetwork,
  signChallengeTransaction,
} from "../../../lib/freighter";
import Link from "next/link";

export default function JoinCampaignPage() {
  const { inviteCode } = useParams();
  const router = useRouter();

  const [campaign, setCampaign] = useState(null);
  const [error, setError] = useState("");
  const [status, setStatus] = useState("loading");

  useEffect(() => { loadInvite(); }, [inviteCode]);

  async function loadInvite() {
    try {
      const { campaign: data } = await getCampaignByInviteCode(null, inviteCode);
      setCampaign(data);
      setStatus("ready");
    } catch (err) {
      setError(err.message || "Invalid or expired invite link.");
      setStatus("error");
    }
  }

  async function handleAccept() {
    try {
      setStatus("authenticating");
      let token = window.localStorage.getItem("grow2stellar.token");

      if (!token) {
        const net = await getFreighterNetwork();
        if (!net?.network?.toUpperCase().includes("TESTNET"))
          throw new Error("Switch Freighter to Stellar Testnet first.");

        const address = await connectFreighterWallet();

        const d1 = await requestWalletChallenge(address);

        const signed = await signChallengeTransaction({
          transaction: d1.transaction,
          address,
          networkPassphrase: net.networkPassphrase,
        });

        const d2 = await verifyWalletChallenge({ walletAddress: address, signedTransaction: signed });
        if (!d2.token) throw new Error("Verification failed");

        token = d2.token;
        window.localStorage.setItem("grow2stellar.token", token);
      }

      setStatus("joining");
      await joinCampaignByInvite(token, inviteCode);
      setStatus("success");
      setTimeout(() => router.push("/ambassador/campaigns"), 1800);
    } catch (err) {
      setError(err.message || "Failed to join campaign.");
      setStatus("ready");
    }
  }

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cloud">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-full border-2 border-mint border-t-transparent animate-spin" />
          <p className="text-sm text-ink/50 font-medium">Loading invite…</p>
        </div>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cloud p-4">
        <div className="w-full max-w-sm rounded-2xl border border-coral/20 bg-white p-8 text-center shadow-lg">
          <div className="text-3xl mb-3">⚠️</div>
          <h1 className="text-lg font-bold text-ink mb-2">Invite not found</h1>
          <p className="text-sm text-ink/55 mb-6">{error}</p>
          <Link
            href="/"
            className="inline-block rounded-lg bg-ink text-white text-sm font-semibold px-5 py-2.5 hover:bg-mint transition"
          >
            Go home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-cloud flex items-center justify-center p-4">
      <div className="w-full max-w-md rounded-2xl border border-ink/10 bg-white shadow-xl overflow-hidden">
        {/* Top banner */}
        <div className="bg-ink px-8 py-8 text-center">
          <span className="inline-block rounded-full bg-mint/20 text-mint text-xs font-bold uppercase tracking-widest px-3 py-1 mb-4">
            Private Invite
          </span>
          <h1 className="text-xl font-bold text-white mb-1">You've been invited</h1>
          <p className="text-white/50 text-sm">
            Join as an ambassador and earn XLM.
          </p>
        </div>

        <div className="p-6 sm:p-8">
          {/* Campaign info */}
          <div className="rounded-xl border border-ink/8 bg-cloud p-4 mb-6">
            <h2 className="font-bold text-ink mb-2">{campaign?.title}</h2>
            <p className="text-sm text-ink/55 leading-relaxed mb-3">
              {campaign?.description}
            </p>
            <div className="flex gap-2 flex-wrap">
              <span className="text-xs font-bold bg-gold/10 text-gold px-2 py-1 rounded-md">
                Budget: {campaign?.totalBudget} XLM
              </span>
              <span className="text-xs font-bold bg-cloud text-ink/50 px-2 py-1 rounded-md border border-ink/8">
                Private Access
              </span>
            </div>
          </div>

          {error && (
            <div className="rounded-lg bg-coral/8 border border-coral/20 text-coral text-sm font-semibold px-4 py-2.5 mb-4 text-center">
              {error}
            </div>
          )}

          {status === "success" ? (
            <div className="rounded-lg bg-mint/10 border border-mint/20 text-mint text-sm font-bold px-4 py-3 text-center flex items-center justify-center gap-2">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
              Joined! Redirecting to your hub…
            </div>
          ) : (
            <button
              onClick={handleAccept}
              disabled={status !== "ready"}
              className="w-full rounded-lg bg-ink text-white font-semibold py-3 text-sm hover:bg-mint transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {status === "authenticating"
                ? "Awaiting wallet signature…"
                : status === "joining"
                ? "Accepting invite…"
                : "Connect Wallet & Accept Invite"}
            </button>
          )}

          <p className="text-center text-xs text-ink/30 mt-4">
            Accepting bypasses the public application queue and grants instant ambassador access.
          </p>
        </div>
      </div>
    </main>
  );
}
