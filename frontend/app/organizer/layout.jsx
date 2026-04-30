import Sidebar from "../components/Sidebar";

export default function OrganizerLayout({ children }) {
  const links = [
    { label: "Dashboard", href: "/organizer/dashboard" },
    { label: "My Campaigns", href: "/organizer/campaigns" },
    { label: "Quests & Approvals", href: "/organizer/quests" },
  ];

  return (
    <div className="flex w-full items-start">
      <Sidebar role="Organizer" links={links} />
      <div className="flex-1 min-w-0 p-5 md:p-8">
        {children}
      </div>
    </div>
  );
}
