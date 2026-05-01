import Sidebar from "../components/Sidebar";

export const metadata = {
  title: "Ambassador Hub",
};

const links = [
  { label: "Dashboard", href: "/ambassador/dashboard" },
  { label: "Campaigns", href: "/ambassador/campaigns" },
  { label: "Submissions", href: "/ambassador/submissions" },
];

export default function AmbassadorLayout({ children }) {
  return (
    <div className="flex min-h-screen bg-cloud">
      <Sidebar role="Ambassador" links={links} />
      {/* pb-20 on mobile to clear the bottom nav bar */}
      <div className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 pb-24 md:pb-8">
        {children}
      </div>
    </div>
  );
}
