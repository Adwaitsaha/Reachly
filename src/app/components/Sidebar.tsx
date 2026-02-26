import { NavLink } from "react-router";
import {
  LayoutDashboard,
  Users,
  Briefcase,
  Send,
  FileText,
  Bell,
} from "lucide-react";

const navItems = [
  { path: "/", label: "Dashboard", icon: LayoutDashboard },
  { path: "/contacts", label: "Contacts", icon: Users },
  { path: "/jobs", label: "Jobs", icon: Briefcase },
  { path: "/outreach", label: "Outreach", icon: Send },
  { path: "/resumes", label: "Resumes", icon: FileText },
  { path: "/reminders", label: "Reminders", icon: Bell },
];

export function Sidebar() {
  return (
    <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
      <div className="p-6 border-b border-gray-200">
        <h1 className="text-2xl font-semibold text-gray-900">Reachly</h1>
        <p className="text-sm text-gray-500 mt-1">Job Search CRM</p>
      </div>
      
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === "/"}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                isActive
                  ? "bg-emerald-50 text-emerald-700"
                  : "text-gray-700 hover:bg-gray-50"
              }`
            }
          >
            <item.icon className="w-5 h-5" />
            <span className="font-medium">{item.label}</span>
          </NavLink>
        ))}
      </nav>
      
      <div className="p-4 border-t border-gray-200">
        <div className="text-xs text-gray-500">
          <p>Track smarter, land faster.</p>
        </div>
      </div>
    </aside>
  );
}