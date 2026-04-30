import Sidebar from "../components/Sidebar";

export default function AmbassadorLayout({ children }) {
  const links = [
    { label: "Dashboard", href: "/ambassador/dashboard" },
    { label: "Available Campaigns", href: "/ambassador/campaigns" },
    { label: "My Submissions", href: "/ambassador/submissions" },
  ];

  return (
    <div className="flex w-full items-start">
      <Sidebar role="Ambassador" links={links} />
      <div className="flex-1 min-w-0 p-5 md:p-8">
        {children}
      </div>
    </div>
  );
}
