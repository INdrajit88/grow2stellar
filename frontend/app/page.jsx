"use client";

import { useEffect, useState } from "react";
import { getCurrentUser } from "../lib/api";
import {
  connectFreighterWallet,
  getFreighterNetwork,
  signChallengeTransaction,
} from "../lib/freighter";
import Link from "next/link";

const storedTokenKey = "grow2stellar.token";

export default function HomePage() {
  const [status, setStatus] = useState("idle");
  const [message, setMessage] = useState("");
  const [walletAddress, setWalletAddress] = useState("");
  const [user, setUser] = useState(null);
  const [token, setToken] = useState("");

  useEffect(() => {
    const token = window.localStorage.getItem(storedTokenKey);
    if (!token) return;

    setToken(token);
    setStatus("loading");
    getCurrentUser(token)
      .then(({ user: currentUser }) => {
        setUser(currentUser);
        setWalletAddress(currentUser.walletAddress);
        setStatus("authenticated");
        setMessage("Wallet session restored. Please select your workspace below.");
      })
      .catch(() => {
        window.localStorage.removeItem(storedTokenKey);
        setToken("");
        setStatus("idle");
      });
  }, []);

  async function handleConnect() {
    try {
      setStatus("loading");
      setMessage("Checking network...");
      const networkDetails = await getFreighterNetwork();
      if (!networkDetails || !networkDetails.network.toUpperCase().includes("TESTNET")) {
        throw new Error("Please switch Freighter to TESTNET.");
      }

      setMessage("Requesting address...");
      const address = await connectFreighterWallet();
      setWalletAddress(address);

      setMessage("Requesting authentication challenge...");
      const res1 = await fetch("http://localhost:4000/api/auth/nonce", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ walletAddress: address }),
      });
      const data1 = await res1.json();
      if (!res1.ok) throw new Error(data1.error?.message || "Failed to fetch nonce");

      setMessage("Please sign the authentication challenge in Freighter...");
      const signedTransaction = await signChallengeTransaction({
        transaction: data1.transaction,
        address,
        networkPassphrase: networkDetails.networkPassphrase,
      });

      setMessage("Verifying signature...");
      const res2 = await fetch("http://localhost:4000/api/auth/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ signedTransaction, walletAddress: address }),
      });
      const data2 = await res2.json();
      if (!res2.ok) throw new Error(data2.error?.message || "Verification failed");

      window.localStorage.setItem(storedTokenKey, data2.token);
      setToken(data2.token);
      setUser(data2.user);
      setStatus("authenticated");
      setMessage("Authentication successful! Please select your workspace below.");
    } catch (err) {
      console.error(err);
      setStatus("error");
      setMessage(err.message || "An unknown error occurred.");
    }
  }

  function handleDisconnect() {
    window.localStorage.removeItem(storedTokenKey);
    setUser(null);
    setToken("");
    setWalletAddress("");
    setStatus("idle");
    setMessage("Disconnected successfully.");
  }

  return (
    <main className="min-h-screen bg-cloud text-ink font-sans">
      <header className="border-b border-ink/10 bg-white">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between p-5 md:px-8 md:py-6">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded bg-mint text-white">
              <span className="font-bold">G</span>
            </div>
            <h1 className="text-xl font-bold tracking-tight text-ink">
              Grow2Stellar
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/marketplace" className="text-sm font-semibold text-mint hover:underline">
              Explore Marketplace
            </Link>
            {user && (
              <button onClick={handleDisconnect} className="text-sm font-semibold text-coral border border-coral px-3 py-1.5 rounded hover:bg-coral hover:text-white transition">
                Logout
              </button>
            )}
          </div>
        </div>
      </header>

      <section className="mx-auto grid w-full max-w-6xl gap-12 px-5 py-12 md:grid-cols-2 md:px-8 md:py-20 lg:py-24">
        <div className="flex flex-col justify-center">
          <span className="mb-4 inline-block w-fit rounded-full bg-mint/10 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-mint border-mint/20 border">
            Web3 Growth Platform
          </span>

          <div className="space-y-4">
            <h1 className="max-w-3xl text-4xl font-semibold leading-tight md:text-5xl">
              Connect your Stellar wallet to start earning from real growth.
            </h1>
            <p className="max-w-2xl text-lg leading-8 text-ink/70">
              One identity to rule them all. Choose your path: organize campaigns and pay bounties, or become a partner to hunt quests for XLM.
            </p>
          </div>
        </div>

        <div className="rounded-lg border border-ink/10 bg-white p-6 shadow-sm flex flex-col justify-center">
          <div className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-semibold">Decentralized Login</label>
              <input
                readOnly
                value={walletAddress || "No Active Wallet Connection"}
                className="w-full rounded-md border border-ink/15 bg-cloud px-3 py-3 text-sm text-ink/80 font-mono"
              />
            </div>

            {user ? (
              <div className="rounded-md border border-mint/30 bg-mint/10 p-4 text-sm">
                <p className="font-semibold text-mint">Identity Verified</p>
                <p className="mt-1 break-all text-ink/70">Your Freighter wallet session is securely established.</p>
              </div>
            ) : (
              <div className="rounded-md border border-ink/10 bg-cloud p-4 text-sm text-ink/70">
                You must sign an authentication challenge to proceed into a workspace.
              </div>
            )}

            {!user && (
              <button
                type="button"
                onClick={handleConnect}
                disabled={status === "loading"}
                className="w-full rounded-md bg-ink px-5 py-3 font-semibold text-white transition hover:bg-mint disabled:cursor-not-allowed disabled:bg-ink/45"
              >
                {status === "loading" ? "Validating Signature..." : "Connect Freighter Wallet"}
              </button>
            )}

            {message && (
              <p className={`text-sm ${status === "error" ? "text-coral" : "text-ink/70"}`}>
                {message}
              </p>
            )}
          </div>
        </div>
      </section>

      {user && (
        <section className="mx-auto w-full max-w-6xl px-5 pb-20 md:px-8 border-t border-ink/10 pt-12 animate-fade-in">
          <div className="mb-8">
            <h2 className="text-3xl font-bold">Select Workspace</h2>
            <p className="text-ink/70 mt-2">Enter the dashboard corresponding to your role to continue.</p>
          </div>
          
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            
            {/* Organizer Portal */}
            <div className="group rounded-xl border border-ink/10 bg-white p-6 shadow-sm hover:shadow-lg transition-all flex flex-col justify-between h-full">
              <div>
                <h2 className="text-xl font-bold bg-mint text-white inline-block px-3 py-1 rounded-md mb-3">Organizer / Admin</h2>
                <p className="text-ink/70 mb-5 text-sm leading-relaxed">Access the creator studio. Launch new campaigns, manage structural quests, review proof submissions, and approve instant Soroban payouts to ambassadors.</p>
              </div>
              <Link href="/organizer/dashboard" className="block w-full text-center rounded bg-ink py-3 text-sm font-semibold text-white group-hover:bg-mint transition">
                Enter Organizer Portal &rarr;
              </Link>
            </div>

            {/* Ambassador Portal */}
            <div className="group rounded-xl border border-ink/10 bg-white p-6 shadow-sm hover:shadow-lg transition-all flex flex-col justify-between h-full">
              <div>
                <h2 className="text-xl font-bold bg-gold/90 text-white inline-block px-3 py-1 rounded-md mb-3">Partner / Ambassador</h2>
                <p className="text-ink/70 mb-5 text-sm leading-relaxed">Access the hunter's lodge. Discover available bounties, submit proof of your marketing and promotional work, and watch your XLM earnings grow.</p>
              </div>
              <Link href="/ambassador/dashboard" className="block w-full text-center rounded bg-ink py-3 text-sm font-semibold text-white group-hover:bg-gold transition">
                Enter Partner Portal &rarr;
              </Link>
            </div>
            
          </div>
        </section>
      )}
    </main>
  );
}
