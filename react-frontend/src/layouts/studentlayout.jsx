
import { useState } from "react";
import {
    LayoutDashboard,
    BookOpen,
    ClipboardList,
    Library,
    History,
    UserCircle,
    Bell,
    LogOut,
    Menu,
    X
} from "lucide-react";

import { NavLink, Outlet, useNavigate, useLocation } from "react-router-dom";

const menuItems = [
    {
        name: "Dashboard",
        icon: LayoutDashboard,
        path: "/student/dashboard"
    },
    {
        name: "Browse Books",
        icon: BookOpen,
        path: "/student/browse"
    },
    {
        name: "My Requests",
        icon: ClipboardList,
        path: "/student/requests"
    },
    {
        name: "My Issued Books",
        icon: Library,
        path: "/student/issued"
    },
    {
        name: "Borrowing History",
        icon: History,
        path: "/student/history"
    },
    {
        name: "My Profile",
        icon: UserCircle,
        path: "/student/profile"
    }
];

export default function StudentLayout() {
    const navigate = useNavigate();
    const location = useLocation();

const currentPage =
    menuItems.find((item) => item.path === location.pathname)?.name
    || "Student Portal";
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const studentName =
        sessionStorage.getItem("studentName") || "Student";

    const handleLogout = () => {
        sessionStorage.removeItem("studentToken");
        sessionStorage.removeItem("studentName");
        navigate("/");
    };

    return (
        <div className="min-h-screen bg-slate-50">

            {/* MOBILE OVERLAY */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* SIDEBAR */}
            <aside
                className={`fixed top-0 left-0 z-50 w-64 h-screen bg-slate-950 text-white p-5 flex flex-col transition-transform duration-300 ${
                    sidebarOpen
                        ? "translate-x-0"
                        : "-translate-x-full"
                } lg:translate-x-0`}
            >

                <div className="flex items-center justify-between mb-10">
                    <div>
                        <h1 className="text-2xl font-bold text-blue-400">
                            Smart Library
                        </h1>

                        <p className="text-slate-400 text-sm mt-1">
                            Student Portal
                        </p>
                    </div>

                    <button
                        onClick={() => setSidebarOpen(false)}
                        className="lg:hidden text-slate-300"
                    >
                        <X size={22} />
                    </button>
                </div>

                <p className="text-xs text-slate-500 mb-4">
                    STUDENT MENU
                </p>

                <nav className="space-y-2 flex-1">

                    {menuItems.map((item) => {
                        const Icon = item.icon;

                        return (
                            <NavLink
                                key={item.name}
                                to={item.path}
                                onClick={() => setSidebarOpen(false)}
                                className={({ isActive }) =>
                                    `flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition ${
                                        isActive
                                            ? "bg-blue-600 text-white shadow-lg"
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

                <div className="border-t border-slate-800 pt-4">

                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-3 text-red-400 hover:bg-slate-800 rounded-xl"
                    >
                        <LogOut size={19} />
                        Logout
                    </button>

                </div>

            </aside>

            {/* MAIN CONTENT */}
            <div className="lg:ml-64 min-h-screen">

                {/* NAVBAR */}
                <header className="h-20 bg-white border-b border-slate-200 px-4 sm:px-6 lg:px-8 flex items-center justify-between sticky top-0 z-30">

                    <div className="flex items-center gap-3">

                        <button
                            onClick={() => setSidebarOpen(true)}
                            className="lg:hidden text-slate-700"
                        >
                            <Menu size={25} />
                        </button>

                        <div>
                            <h2 className="text-lg sm:text-xl font-bold text-slate-800">
    {currentPage}
</h2>

                            <p className="text-xs sm:text-sm text-slate-500">
                                Welcome back, {studentName}
                            </p>
                        </div>

                    </div>

                    <div className="flex items-center gap-3 sm:gap-5">

                        <button
                            onClick={() => navigate("/student/notifications")}
                            className="relative text-slate-600 hover:text-blue-600"
                        >
                            <Bell size={22} />
                        </button>

                        <div className="flex items-center gap-2">
                            <UserCircle
                                size={32}
                                className="text-blue-600"
                            />

                            <div className="hidden sm:block">
                                <p className="text-sm font-semibold text-slate-800">
                                    {studentName}
                                </p>

                                <p className="text-xs text-slate-500">
                                    Student
                                </p>
                            </div>
                        </div>

                    </div>

                </header>

                {/* PAGE CONTENT */}
<main className="min-h-[calc(100vh-80px)] w-full">
    <Outlet />
</main>

            </div>

        </div>
    );
}
