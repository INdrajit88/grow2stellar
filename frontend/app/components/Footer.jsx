import Link from "next/link";

const FOOTER_LINKS = {
  Platform: [
    { label: "Marketplace", href: "/marketplace" },
    { label: "Organizer Portal", href: "/organizer/dashboard" },
    { label: "Ambassador Hub", href: "/ambassador/dashboard" },
  ],
  Resources: [
    { label: "Documentation", href: "https://github.com/INdrajit88/grow2stellar#readme", external: true },
    { label: "Architecture", href: "https://github.com/INdrajit88/grow2stellar/blob/main/docs/architecture.md", external: true },
    { label: "Soroban Contracts", href: "https://github.com/INdrajit88/grow2stellar/tree/main/contracts", external: true },
  ],
  Network: [
    { label: "Stellar Testnet", href: "https://stellar.org", external: true },
    { label: "Soroban SDK", href: "https://soroban.stellar.org", external: true },
    { label: "Freighter Wallet", href: "https://freighter.app", external: true },
  ],
};

const SOCIAL_LINKS = [
  {
    label: "GitHub",
    href: "https://github.com/INdrajit88/grow2stellar",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
        <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
      </svg>
    ),
  },
  {
    label: "Twitter / X",
    href: "https://twitter.com",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
  },
];

export default function Footer() {
  return (
    <footer className="bg-ink text-white/80 mt-auto">
      {/* Main footer grid */}
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-2 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand column */}
          <div className="col-span-2 sm:col-span-2 lg:col-span-1">
            <Link href="/" className="flex items-center gap-2.5 mb-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-mint text-white font-black text-xs select-none">
                G2S
              </div>
              <span className="text-base font-bold text-white">Grow2Stellar</span>
            </Link>
            <p className="text-sm leading-relaxed text-white/50 max-w-xs">
              Web3-native ambassador rewards on Stellar. Earn XLM and G2S tokens for real growth work — settled on-chain, no middlemen.
            </p>
            <div className="flex items-center gap-3 mt-5">
              {SOCIAL_LINKS.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.label}
                  className="text-white/40 hover:text-mint transition"
                >
                  {s.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(FOOTER_LINKS).map(([section, links]) => (
            <div key={section}>
              <h3 className="text-xs font-bold uppercase tracking-widest text-white/30 mb-4">
                {section}
              </h3>
              <ul className="space-y-2.5">
                {links.map((link) => (
                  <li key={link.label}>
                    {link.external ? (
                      <a
                        href={link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-white/50 hover:text-white transition"
                      >
                        {link.label}
                      </a>
                    ) : (
                      <Link
                        href={link.href}
                        className="text-sm text-white/50 hover:text-white transition"
                      >
                        {link.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Contract info strip */}
        <div className="mt-10 pt-8 border-t border-white/10">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6 text-xs text-white/30 font-mono">
            <span className="flex items-center gap-2">
              <span className="inline-block w-2 h-2 rounded-full bg-mint animate-pulse" />
              Stellar Testnet
            </span>
            <span>Escrow: CXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX</span>
            <span>G2S Token: CXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX</span>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/8">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-white/30">
          <span>© {new Date().getFullYear()} Grow2Stellar. Built on Stellar &amp; Soroban.</span>
          <div className="flex items-center gap-4">
            <a href="https://stellar.org" target="_blank" rel="noopener noreferrer" className="hover:text-white/60 transition">
              Stellar Network
            </a>
            <a href="https://soroban.stellar.org" target="_blank" rel="noopener noreferrer" className="hover:text-white/60 transition">
              Soroban
            </a>
            <Link href="/marketplace" className="hover:text-white/60 transition">
              Marketplace
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
