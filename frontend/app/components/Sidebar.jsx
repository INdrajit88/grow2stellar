"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

export default function Sidebar({ role, links }) {
  const pathname = usePathname();
  const router = useRouter();

  function handleLogout() {
    window.localStorage.removeItem("grow2stellar.token");
    router.push("/");
  }

  return (
    <aside className="w-64 flex-shrink-0 border-r border-ink/10 bg-cloud/30 hidden md:flex flex-col justify-between min-h-[calc(100vh-80px)]">
      <div className="p-6">
        <h2 className="text-xs font-bold uppercase tracking-widest text-ink/50 mb-6">
          {role} Panel
        </h2>
        <nav className="flex flex-col gap-2">
          {links.map((link) => {
            const isActive = pathname === link.href || pathname.startsWith(link.href + "/");
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`rounded-md px-4 py-2.5 text-sm font-semibold transition ${
                  isActive
                    ? "bg-mint text-white shadow-sm"
                    : "text-ink/70 hover:bg-white hover:text-ink hover:shadow-sm"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="p-6 border-t border-ink/10">
         <button onClick={handleLogout} className="w-full rounded-md border border-coral text-coral px-4 py-2 text-sm font-semibold transition hover:bg-coral hover:text-white">
           Disconnect Wallet
         </button>
      </div>
    </aside>
  );
}
