import Sidebar from "../components/Sidebar";

export const metadata = {
  title: "Organizer Portal",
};

const links = [
  { label: "Dashboard", href: "/organizer/dashboard" },
  { label: "Campaigns", href: "/organizer/campaigns" },
  { label: "Quests & Approvals", href: "/organizer/quests" },
];

export default function OrganizerLayout({ children }) {
  return (
    <div className="flex min-h-screen bg-cloud">
      <Sidebar role="Organizer" links={links} />
      {/* pb-20 on mobile to clear the bottom nav bar */}
      <div className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 pb-24 md:pb-8">
        {children}
      </div>
    </div>
  );
}
