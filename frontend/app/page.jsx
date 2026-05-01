"use client";

import { useEffect, useState } from "react";
import { getCurrentUser } from "../lib/api";
import {
  connectFreighterWallet,
  getFreighterNetwork,
  signChallengeTransaction,
} from "../lib/freighter";
import Link from "next/link";
import Header from "./components/Header";
import Footer from "./components/Footer";

const TOKEN_KEY = "grow2stellar.token";

const HOW_IT_WORKS = [
  {
    step: "01",
    title: "Connect your wallet",
    body: "Sign in with Freighter — no email, no password. Your Stellar address is your identity.",
    color: "mint",
  },
  {
    step: "02",
    title: "Pick a campaign",
    body: "Browse public bounties on the marketplace or get invited to private campaigns by organizers.",
    color: "gold",
  },
  {
    step: "03",
    title: "Complete quests",
    body: "Submit proof of your work — tweets, blog posts, referral clicks. Organizers review on-chain.",
    color: "coral",
  },
  {
    step: "04",
    title: "Get paid in XLM + G2S",
    body: "Approved submissions trigger an automatic Soroban payout. XLM lands in your wallet instantly.",
    color: "mint",
  },
];

const STATS = [
  { label: "Campaigns live", value: "12+" },
  { label: "Ambassadors active", value: "340+" },
  { label: "XLM distributed", value: "18,500" },
  { label: "Avg. payout time", value: "< 5s" },
];

export default function HomePage() {
  const [status, setStatus] = useState("idle");
  const [message, setMessage] = useState("");
  const [walletAddress, setWalletAddress] = useState("");
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = window.localStorage.getItem(TOKEN_KEY);
    if (!token) return;
    setStatus("loading");
    getCurrentUser(token)
      .then(({ user: u }) => {
        setUser(u);
        setWalletAddress(u.walletAddress);
        setStatus("authenticated");
        setMessage("Session restored — choose your workspace below.");
      })
      .catch(() => {
        window.localStorage.removeItem(TOKEN_KEY);
        setStatus("idle");
      });
  }, []);

  async function handleConnect() {
    try {
      setStatus("loading");
      setMessage("Checking network…");
      const net = await getFreighterNetwork();
      if (!net?.network?.toUpperCase().includes("TESTNET")) {
        throw new Error("Switch Freighter to Stellar Testnet first.");
      }

      setMessage("Requesting address…");
      const address = await connectFreighterWallet();
      setWalletAddress(address);

      setMessage("Fetching auth challenge…");
      const r1 = await fetch("http://localhost:4000/api/auth/nonce", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ walletAddress: address }),
      });
      const d1 = await r1.json();
      if (!r1.ok) throw new Error(d1.error?.message || "Failed to fetch nonce");

      setMessage("Sign the challenge in Freighter…");
      const signed = await signChallengeTransaction({
        transaction: d1.transaction,
        address,
        networkPassphrase: net.networkPassphrase,
      });

      setMessage("Verifying…");
      const r2 = await fetch("http://localhost:4000/api/auth/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ signedTransaction: signed, walletAddress: address }),
      });
      const d2 = await r2.json();
      if (!r2.ok) throw new Error(d2.error?.message || "Verification failed");

      window.localStorage.setItem(TOKEN_KEY, d2.token);
      setUser(d2.user);
      setStatus("authenticated");
      setMessage("Authenticated — choose your workspace below.");
    } catch (err) {
      setStatus("error");
      setMessage(err.message || "Something went wrong.");
    }
  }

  function handleDisconnect() {
    window.localStorage.removeItem(TOKEN_KEY);
    setUser(null);
    setWalletAddress("");
    setStatus("idle");
    setMessage("");
  }

  return (
    <div className="flex flex-col min-h-screen bg-cloud">
      <Header user={user} onDisconnect={handleDisconnect} />

      <main className="flex-1">
        {/* ── Hero ─────────────────────────────────────────────────────────── */}
        <section className="relative overflow-hidden bg-white">
          {/* Subtle grid background */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage:
                "linear-gradient(#16181d 1px, transparent 1px), linear-gradient(90deg, #16181d 1px, transparent 1px)",
              backgroundSize: "40px 40px",
            }}
          />
          {/* Gradient blob */}
          <div
            aria-hidden
            className="pointer-events-none absolute -top-32 -right-32 w-[600px] h-[600px] rounded-full opacity-10"
            style={{
              background:
                "radial-gradient(circle, #0f9f8f 0%, transparent 70%)",
            }}
          />

          <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-16 sm:py-24 lg:py-32">
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
              {/* Left: copy */}
              <div className="animate-fade-in">
                <div className="inline-flex items-center gap-2 rounded-full border border-mint/25 bg-mint/8 px-3 py-1 text-xs font-semibold text-mint mb-6">
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-mint animate-pulse" />
                  Live on Stellar Testnet
                </div>

                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-ink leading-[1.1] tracking-tight mb-6">
                  Earn XLM for{" "}
                  <span className="text-mint">real growth</span>{" "}
                  work.
                </h1>

                <p className="text-lg text-ink/60 leading-relaxed mb-8 max-w-lg">
                  Grow2Stellar connects brands with ambassadors through
                  Soroban smart contracts. Submit proof, get paid
                  automatically — no invoices, no delays.
                </p>

                <div className="flex flex-col xs:flex-row gap-3">
                  <Link
                    href="/marketplace"
                    className="inline-flex items-center justify-center gap-2 rounded-lg bg-mint px-6 py-3 text-sm font-semibold text-white hover:bg-mint/90 transition shadow-sm shadow-mint/20"
                  >
                    Browse Campaigns
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </Link>
                  <a
                    href="https://github.com/INdrajit88/grow2stellar"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 rounded-lg border border-ink/15 bg-white px-6 py-3 text-sm font-semibold text-ink hover:bg-cloud transition"
                  >
                    <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                      <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
                    </svg>
                    View on GitHub
                  </a>
                </div>
              </div>

              {/* Right: wallet connect card */}
              <div className="animate-fade-in" style={{ animationDelay: "0.1s" }}>
                <div className="rounded-2xl border border-ink/10 bg-white shadow-xl shadow-ink/5 p-6 sm:p-8">
                  <div className="mb-6">
                    <h2 className="text-lg font-bold text-ink mb-1">
                      {user ? "Wallet connected" : "Connect your wallet"}
                    </h2>
                    <p className="text-sm text-ink/50">
                      {user
                        ? "Your Stellar identity is verified on-chain."
                        : "Sign a challenge with Freighter to authenticate."}
                    </p>
                  </div>

                  {/* Address display */}
                  <div className="mb-4">
                    <label className="block text-xs font-semibold uppercase tracking-wider text-ink/40 mb-2">
                      Stellar Address
                    </label>
                    <div className="flex items-center gap-2 rounded-lg border border-ink/10 bg-cloud px-3 py-2.5">
                      <div
                        className={`w-2 h-2 rounded-full shrink-0 ${
                          user ? "bg-mint animate-pulse-glow" : "bg-ink/20"
                        }`}
                      />
                      <span className="text-xs font-mono text-ink/60 truncate">
                        {walletAddress || "No wallet connected"}
                      </span>
                    </div>
                  </div>

                  {/* Status message */}
                  {message && (
                    <div
                      className={`mb-4 rounded-lg px-3 py-2.5 text-sm ${
                        status === "error"
                          ? "bg-coral/8 border border-coral/20 text-coral"
                          : status === "authenticated"
                          ? "bg-mint/8 border border-mint/20 text-mint"
                          : "bg-cloud border border-ink/10 text-ink/60"
                      }`}
                    >
                      {message}
                    </div>
                  )}

                  {/* Action */}
                  {!user ? (
                    <button
                      onClick={handleConnect}
                      disabled={status === "loading"}
                      className="w-full rounded-lg bg-ink py-3 text-sm font-semibold text-white hover:bg-mint transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {status === "loading" ? (
                        <span className="flex items-center justify-center gap-2">
                          <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                          </svg>
                          Connecting…
                        </span>
                      ) : (
                        "Connect Freighter Wallet"
                      )}
                    </button>
                  ) : (
                    <div className="space-y-2">
                      <Link
                        href="/organizer/dashboard"
                        className="flex items-center justify-between w-full rounded-lg border border-mint/20 bg-mint/5 px-4 py-3 text-sm font-semibold text-mint hover:bg-mint hover:text-white transition"
                      >
                        <span>Organizer Portal</span>
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </Link>
                      <Link
                        href="/ambassador/dashboard"
                        className="flex items-center justify-between w-full rounded-lg border border-gold/20 bg-gold/5 px-4 py-3 text-sm font-semibold text-gold hover:bg-gold hover:text-white transition"
                      >
                        <span>Ambassador Hub</span>
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </Link>
                    </div>
                  )}

                  <p className="mt-4 text-center text-xs text-ink/30">
                    Requires Freighter browser extension · Stellar Testnet
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Stats bar ────────────────────────────────────────────────────── */}
        <section className="border-y border-ink/8 bg-ink">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-8">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 sm:gap-0 sm:divide-x sm:divide-white/10">
              {STATS.map((s) => (
                <div key={s.label} className="text-center sm:px-6">
                  <div className="text-2xl sm:text-3xl font-bold text-white">{s.value}</div>
                  <div className="text-xs text-white/40 mt-1 font-medium">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── How it works ─────────────────────────────────────────────────── */}
        <section id="how-it-works" className="py-16 sm:py-24">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl font-bold text-ink mb-4">
                How it works
              </h2>
              <p className="text-ink/50 max-w-xl mx-auto">
                Four steps from wallet connect to XLM in your account.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {HOW_IT_WORKS.map((item) => (
                <div
                  key={item.step}
                  className="relative rounded-xl border border-ink/8 bg-white p-6 hover:shadow-md transition"
                >
                  <div className="text-4xl font-black text-ink/5 absolute top-4 right-4 select-none">
                    {item.step}
                  </div>
                  <div
                    className={`inline-flex items-center justify-center w-10 h-10 rounded-lg mb-4 text-white font-bold text-sm ${
                      item.color === "mint"
                        ? "bg-mint"
                        : item.color === "gold"
                        ? "bg-gold"
                        : "bg-coral"
                    }`}
                  >
                    {item.step}
                  </div>
                  <h3 className="font-bold text-ink mb-2">{item.title}</h3>
                  <p className="text-sm text-ink/55 leading-relaxed">{item.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── CTA ──────────────────────────────────────────────────────────── */}
        <section className="py-16 sm:py-20 bg-mint">
          <div className="mx-auto max-w-3xl px-4 sm:px-6 text-center">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Ready to start earning?
            </h2>
            <p className="text-white/70 mb-8 text-lg">
              Browse open campaigns and apply as an ambassador today.
            </p>
            <Link
              href="/marketplace"
              className="inline-flex items-center gap-2 rounded-lg bg-white text-mint font-bold px-8 py-3.5 text-sm hover:bg-cloud transition shadow-lg shadow-mint/30"
            >
              Explore the Marketplace
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
