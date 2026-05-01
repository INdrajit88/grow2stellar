"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

export default function Sidebar({ role, links }) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);

  // Close on route change
  useEffect(() => { setMobileOpen(false); }, [pathname]);

  function handleLogout() {
    window.localStorage.removeItem("grow2stellar.token");
    router.push("/");
  }

  const NavContent = () => (
    <>
      <div className="p-5 flex-1 overflow-y-auto">
        <p className="text-[10px] font-bold uppercase tracking-widest text-ink/35 mb-4 px-1">
          {role} Panel
        </p>
        <nav className="flex flex-col gap-1">
          {links.map((link) => {
            const isActive =
              pathname === link.href || pathname.startsWith(link.href + "/");
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                  isActive
                    ? "bg-mint text-white shadow-sm"
                    : "text-ink/65 hover:bg-white hover:text-ink hover:shadow-sm"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="p-5 border-t border-ink/8">
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 rounded-lg border border-coral/30 text-coral px-3 py-2.5 text-sm font-semibold hover:bg-coral hover:text-white hover:border-coral transition"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          Disconnect
        </button>
      </div>
    </>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden md:flex w-56 lg:w-60 shrink-0 flex-col border-r border-ink/8 bg-cloud/50 min-h-[calc(100vh-64px)] sticky top-16">
        <NavContent />
      </aside>

      {/* Mobile top bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-ink/10 px-2 py-2 flex items-center justify-around">
        {links.map((link) => {
          const isActive =
            pathname === link.href || pathname.startsWith(link.href + "/");
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                isActive ? "text-mint" : "text-ink/50 hover:text-ink"
              }`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full mb-0.5 ${
                  isActive ? "bg-mint" : "bg-transparent"
                }`}
              />
              {link.label}
            </Link>
          );
        })}
        <button
          onClick={handleLogout}
          className="flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-coral"
        >
          <span className="w-1.5 h-1.5 rounded-full mb-0.5 bg-transparent" />
          Exit
        </button>
      </div>
    </>
  );
}
