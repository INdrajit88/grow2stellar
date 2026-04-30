import Sidebar from "../components/Sidebar";

export default function AdminLayout({ children }) {
  // Sidebar config for Admin
  const links = [
    { label: "Overview", href: "/admin/dashboard" },
    { label: "Campaigns", href: "/admin/campaigns" },
    { label: "Users Registry", href: "/admin/users" },
  ];

  return (
    <div className="flex w-full items-start">
      <Sidebar role="Admin" links={links} />
      <div className="flex-1 min-w-0 p-5 md:p-8">
        {children}
      </div>
    </div>
  );
}
