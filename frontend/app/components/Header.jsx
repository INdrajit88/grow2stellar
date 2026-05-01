"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_LINKS = [
  { label: "Marketplace", href: "/marketplace" },
  { label: "How it works", href: "/#how-it-works" },
  { label: "Docs", href: "https://github.com/INdrajit88/grow2stellar#readme", external: true },
];

export default function Header({ user, onDisconnect }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close menu on route change
  useEffect(() => { setMenuOpen(false); }, [pathname]);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    document.body.classList.toggle("mobile-nav-open", menuOpen);
    return () => document.body.classList.remove("mobile-nav-open");
  }, [menuOpen]);

  const walletShort = user?.walletAddress
    ? `${user.walletAddress.slice(0, 4)}…${user.walletAddress.slice(-4)}`
    : null;

  return (
    <header
      className={`sticky top-0 z-50 w-full transition-all duration-200 ${
        scrolled
          ? "bg-white/95 backdrop-blur-md shadow-sm border-b border-ink/8"
          : "bg-white border-b border-ink/10"
      }`}
    >
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 shrink-0">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-mint text-white font-black text-sm select-none">
            G2S
          </div>
          <span className="text-lg font-bold tracking-tight text-ink hidden xs:block">
            Grow2Stellar
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1">
          {NAV_LINKS.map((link) =>
            link.external ? (
              <a
                key={link.href}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-2 text-sm font-medium text-ink/60 hover:text-ink rounded-md hover:bg-cloud transition"
              >
                {link.label}
              </a>
            ) : (
              <Link
                key={link.href}
                href={link.href}
                className={`px-3 py-2 text-sm font-medium rounded-md transition ${
                  pathname === link.href
                    ? "text-mint bg-mint/8"
                    : "text-ink/60 hover:text-ink hover:bg-cloud"
                }`}
              >
                {link.label}
              </Link>
            )
          )}
        </nav>

        {/* Desktop right actions */}
        <div className="hidden md:flex items-center gap-3">
          {user ? (
            <>
              <span className="text-xs font-mono bg-cloud border border-ink/10 px-3 py-1.5 rounded-full text-ink/60">
                {walletShort}
              </span>
              <Link
                href="/organizer/dashboard"
                className="text-sm font-semibold text-ink/70 hover:text-ink px-3 py-1.5 rounded-md hover:bg-cloud transition"
              >
                Organizer
              </Link>
              <Link
                href="/ambassador/dashboard"
                className="text-sm font-semibold text-ink/70 hover:text-ink px-3 py-1.5 rounded-md hover:bg-cloud transition"
              >
                Ambassador
              </Link>
              <button
                onClick={onDisconnect}
                className="text-sm font-semibold text-coral border border-coral/40 px-3 py-1.5 rounded-md hover:bg-coral hover:text-white hover:border-coral transition"
              >
                Disconnect
              </button>
            </>
          ) : (
            <Link
              href="/"
              className="text-sm font-semibold bg-ink text-white px-4 py-2 rounded-md hover:bg-mint transition"
            >
              Connect Wallet
            </Link>
          )}
        </div>

        {/* Mobile hamburger */}
        <button
          onClick={() => setMenuOpen((v) => !v)}
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          aria-expanded={menuOpen}
          className="md:hidden flex flex-col justify-center items-center w-9 h-9 gap-1.5 rounded-md hover:bg-cloud transition"
        >
          <span
            className={`block h-0.5 w-5 bg-ink rounded transition-all duration-200 ${
              menuOpen ? "rotate-45 translate-y-2" : ""
            }`}
          />
          <span
            className={`block h-0.5 w-5 bg-ink rounded transition-all duration-200 ${
              menuOpen ? "opacity-0" : ""
            }`}
          />
          <span
            className={`block h-0.5 w-5 bg-ink rounded transition-all duration-200 ${
              menuOpen ? "-rotate-45 -translate-y-2" : ""
            }`}
          />
        </button>
      </div>

      {/* Mobile drawer */}
      <div
        className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${
          menuOpen ? "max-h-screen opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="border-t border-ink/10 bg-white px-4 pb-6 pt-4 space-y-1">
          {NAV_LINKS.map((link) =>
            link.external ? (
              <a
                key={link.href}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center px-3 py-2.5 text-sm font-medium text-ink/70 hover:text-ink hover:bg-cloud rounded-md transition"
              >
                {link.label}
                <svg className="ml-1 w-3 h-3 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            ) : (
              <Link
                key={link.href}
                href={link.href}
                className="flex items-center px-3 py-2.5 text-sm font-medium text-ink/70 hover:text-ink hover:bg-cloud rounded-md transition"
              >
                {link.label}
              </Link>
            )
          )}

          <div className="pt-3 border-t border-ink/10 space-y-2">
            {user ? (
              <>
                <div className="px-3 py-2 text-xs font-mono text-ink/50 bg-cloud rounded-md">
                  {walletShort}
                </div>
                <Link
                  href="/organizer/dashboard"
                  className="flex items-center px-3 py-2.5 text-sm font-semibold text-ink hover:bg-cloud rounded-md transition"
                >
                  Organizer Portal
                </Link>
                <Link
                  href="/ambassador/dashboard"
                  className="flex items-center px-3 py-2.5 text-sm font-semibold text-ink hover:bg-cloud rounded-md transition"
                >
                  Ambassador Portal
                </Link>
                <button
                  onClick={onDisconnect}
                  className="w-full text-left px-3 py-2.5 text-sm font-semibold text-coral hover:bg-coral/5 rounded-md transition"
                >
                  Disconnect Wallet
                </button>
              </>
            ) : (
              <Link
                href="/"
                className="block w-full text-center bg-ink text-white font-semibold py-2.5 rounded-md hover:bg-mint transition text-sm"
              >
                Connect Wallet
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
