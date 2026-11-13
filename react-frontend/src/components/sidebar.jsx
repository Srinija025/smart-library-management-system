
import {
  LayoutDashboard,
  BookOpen,
  Users,
  ArrowLeftRight,
  ClipboardList,
  RotateCcw,
  Tags,
  ChartColumn,
  Settings,
  LogOut
} from "lucide-react";

import { NavLink, useNavigate } from "react-router-dom";

const menuItems = [
  { name: "Dashboard", icon: LayoutDashboard, path: "/admin/dashboard" },
  { name: "Books", icon: BookOpen, path: "/admin/books" },
  { name: "Students", icon: Users, path: "/admin/students" },
  { name: "Categories", icon: Tags, path: "/admin/categories" },
  { name: "Borrowings", icon: ArrowLeftRight, path: "/admin/borrowings" },
  { name: "Book Requests", icon: ClipboardList, path: "/admin/requests" },
  { name: "Return Requests", icon: RotateCcw, path: "/admin/returns" },
  { name: "Reports", icon: ChartColumn, path: "/admin/reports" },
];

export default function Sidebar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    sessionStorage.removeItem("adminToken");
    sessionStorage.removeItem("adminName");
    navigate("/");
  };

  return (
    <aside className="w-64 min-h-screen bg-slate-950 text-white p-5 flex flex-col shrink-0">

      <div className="mb-10">
        <h1 className="text-2xl font-bold text-blue-400">
          Smart Library
        </h1>
        <p className="text-slate-400 text-sm mt-1">
          Management System
        </p>
      </div>

      <p className="text-xs text-slate-500 mb-4">
        MAIN MENU
      </p>

      <nav className="space-y-2 flex-1">
        {menuItems.map((item) => {
          const Icon = item.icon;

          return (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) =>
                `w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition ${
                  isActive
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-900/30"
                    : "text-slate-300 hover:bg-slate-800"
                }`
              }
            >
              <Icon size={19} />
              {item.name}
            </NavLink>
          );
        })}
      </nav>

      <div className="border-t border-slate-800 pt-4 space-y-2">

        <button
          onClick={() => navigate("/admin/settings")}
          className="w-full flex items-center gap-3 px-4 py-3 text-slate-300 hover:bg-slate-800 rounded-xl"
        >
          <Settings size={19} />
          Settings
        </button>

        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 text-red-400 hover:bg-slate-800 rounded-xl"
        >
          <LogOut size={19} />
          Logout
        </button>

      </div>
    </aside>
  );
}
