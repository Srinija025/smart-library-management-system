
import { useEffect, useState } from "react";
import {
    BookOpen,
    ClipboardList,
    Library,
    History,
    ArrowRight,
    GraduationCap,
    Search,
    AlertTriangle,
    Clock,
    CheckCircle,
    RefreshCw
} from "lucide-react";

import { useNavigate } from "react-router-dom";
import studentApi from "../../services/studentApi";

export default function StudentDashboard() {
    const navigate = useNavigate();

    const [studentName, setStudentName] = useState(
        sessionStorage.getItem("studentName") || "Student"
    );

    const [summary, setSummary] = useState({
        currently_issued: 0,
        returned_books: 0,
        overdue_books: 0,
        due_soon: 0
    });

    const [notifications, setNotifications] = useState([]);
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const fetchDashboard = async () => {
        try {
            setLoading(true);
            setError("");

            const [
                profileResponse,
                summaryResponse,
                notificationResponse,
                requestResponse
            ] = await Promise.all([
                studentApi.get("/student/me"),
                studentApi.get("/student/summary"),
                studentApi.get("/student/notifications"),
                studentApi.get("/student/requests")
            ]);

            const profile = profileResponse.data;

            const name = profile.student_name || "Student";

            setStudentName(name);
            sessionStorage.setItem("studentName", name);

            setSummary({
                currently_issued: Number(summaryResponse.data.currently_issued || 0),
                returned_books: Number(summaryResponse.data.returned_books || 0),
                overdue_books: Number(summaryResponse.data.overdue_books || 0),
                due_soon: Number(summaryResponse.data.due_soon || 0)
            });

            setNotifications(
                Array.isArray(notificationResponse.data)
                    ? notificationResponse.data
                    : []
            );

            setRequests(
                Array.isArray(requestResponse.data)
                    ? requestResponse.data
                    : []
            );

        } catch (err) {
            console.error("Student dashboard error:", err);

            setError(
                err.response?.data?.message ||
                "Unable to load dashboard information."
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDashboard();
    }, []);

    const quickActions = [
        {
            title: "Browse Books",
            description: "Explore the library collection and find books.",
            icon: BookOpen,
            color: "bg-blue-100 text-blue-600",
            path: "/student/browse"
        },
        {
            title: "My Requests",
            description: "Track your book requests and their status.",
            icon: ClipboardList,
            color: "bg-purple-100 text-purple-600",
            path: "/student/requests"
        },
        {
            title: "Issued Books",
            description: "View borrowed books and their due dates.",
            icon: Library,
            color: "bg-emerald-100 text-emerald-600",
            path: "/student/issued"
        },
        {
            title: "Borrowing History",
            description: "Check your previous borrowing records.",
            icon: History,
            color: "bg-orange-100 text-orange-600",
            path: "/student/history"
        }
    ];

    const stats = [
        {
            title: "Currently Issued",
            value: summary.currently_issued,
            icon: BookOpen,
            color: "bg-blue-100 text-blue-600"
        },
        {
            title: "Pending Requests",
            value: requests.filter(
                request => request.status === "Pending"
            ).length,
            icon: Clock,
            color: "bg-purple-100 text-purple-600"
        },
        {
            title: "Overdue Books",
            value: summary.overdue_books,
            icon: AlertTriangle,
            color: "bg-red-100 text-red-600"
        },
        {
            title: "Returned Books",
            value: summary.returned_books,
            icon: CheckCircle,
            color: "bg-emerald-100 text-emerald-600"
        }
    ];

    return (
        <div className="space-y-8 p-5 sm:p-7">

            {/* WELCOME SECTION */}

            <section className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-700 to-indigo-600 p-6 sm:p-10 text-white shadow-lg">

                <div className="relative z-10 max-w-2xl">

                    <p className="text-blue-100 text-sm font-medium mb-3">
                        STUDENT PORTAL
                    </p>

                    <h1 className="text-2xl sm:text-4xl font-bold mb-3">
                        Welcome back, {studentName}!
                    </h1>

                    <p className="text-blue-100 text-sm sm:text-base leading-relaxed mb-6">
                        Discover books, manage your borrowing requests
                        and keep track of your library activity.
                    </p>

                    <button
                        onClick={() => navigate("/student/browse")}
                        className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-semibold text-blue-700 hover:bg-blue-50 transition"
                    >
                        <Search size={18} />
                        Explore Books
                        <ArrowRight size={17} />
                    </button>

                </div>

                <GraduationCap
                    size={190}
                    className="absolute -right-8 -bottom-10 text-white/10"
                />

            </section>


            {/* REFRESH AND ERROR */}

            <div className="flex justify-between items-center">

                <div>
                    <h2 className="text-xl font-bold text-slate-800">
                        Dashboard Overview
                    </h2>

                    <p className="text-sm text-slate-500 mt-1">
                        Your library activity at a glance.
                    </p>
                </div>

                <button
                    onClick={fetchDashboard}
                    disabled={loading}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-600 hover:bg-slate-100 text-sm"
                >
                    <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
                    Refresh
                </button>

            </div>

            {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl p-4">
                    {error}
                </div>
            )}


            {/* STATISTICS CARDS */}

            <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">

                {stats.map((stat) => {
                    const Icon = stat.icon;

                    return (
                        <div
                            key={stat.title}
                            className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm"
                        >

                            <div className="flex justify-between items-center">

                                <div>
                                    <p className="text-sm text-slate-500">
                                        {stat.title}
                                    </p>

                                    <h2 className="text-3xl font-bold text-slate-800 mt-3">
                                        {loading ? "..." : stat.value}
                                    </h2>
                                </div>

                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${stat.color}`}>
                                    <Icon size={24} />
                                </div>

                            </div>

                        </div>
                    );
                })}

            </section>


            {/* QUICK ACCESS */}

            <section>

                <div className="mb-5">
                    <h2 className="text-xl font-bold text-slate-800">
                        Quick Access
                    </h2>

                    <p className="text-sm text-slate-500 mt-1">
                        Access your student library services.
                    </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">

                    {quickActions.map((action) => {
                        const Icon = action.icon;

                        return (
                            <button
                                key={action.title}
                                onClick={() => navigate(action.path)}
                                className="group text-left bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-lg hover:-translate-y-1 transition duration-200"
                            >

                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${action.color}`}>
                                    <Icon size={23} />
                                </div>

                                <h3 className="text-base font-bold text-slate-800 mt-5">
                                    {action.title}
                                </h3>

                                <p className="text-sm text-slate-500 mt-2 min-h-10">
                                    {action.description}
                                </p>

                                <div className="flex items-center gap-2 text-blue-600 text-sm font-semibold mt-5">
                                    Open
                                    <ArrowRight
                                        size={16}
                                        className="group-hover:translate-x-1 transition"
                                    />
                                </div>

                            </button>
                        );
                    })}

                </div>

            </section>


            {/* NOTIFICATIONS */}

            <section className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">

                <div className="flex items-center justify-between mb-5">

                    <div>
                        <h2 className="text-xl font-bold text-slate-800">
                            Due Date Notifications
                        </h2>

                        <p className="text-sm text-slate-500 mt-1">
                            Books that are overdue or due soon.
                        </p>
                    </div>

                    <AlertTriangle className="text-orange-500" size={25} />

                </div>

                {loading ? (
                    <p className="text-slate-500 text-sm">
                        Loading notifications...
                    </p>
                ) : notifications.length === 0 ? (
                    <p className="text-slate-500 text-sm bg-slate-50 p-4 rounded-xl">
                        No overdue or upcoming due-date notifications.
                    </p>
                ) : (

                    <div className="space-y-3">

                        {notifications.map((notification) => (

                            <div
                                key={notification.borrowing_id}
                                className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-slate-50 p-4 rounded-xl"
                            >

                                <div>
                                    <h3 className="font-semibold text-slate-800">
                                        {notification.title}
                                    </h3>

                                    <p className="text-sm text-slate-500 mt-1">
                                        Due date: {notification.due_date}
                                    </p>
                                </div>

                                <span className={`text-xs font-semibold px-3 py-2 rounded-full w-fit ${
                                    notification.notification_type === "Overdue"
                                        ? "bg-red-100 text-red-600"
                                        : "bg-orange-100 text-orange-600"
                                }`}>
                                    {notification.notification_type === "Overdue"
                                        ? `Overdue by ${notification.overdue_days} days`
                                        : "Due Soon"}
                                </span>

                            </div>

                        ))}

                    </div>

                )}

            </section>


            {/* RECENT BOOK REQUESTS */}

            <section className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">

                <div className="flex justify-between items-center mb-5">

                    <div>
                        <h2 className="text-xl font-bold text-slate-800">
                            Recent Book Requests
                        </h2>

                        <p className="text-sm text-slate-500 mt-1">
                            Check the latest status of your requests.
                        </p>
                    </div>

                    <button
                        onClick={() => navigate("/student/requests")}
                        className="text-blue-600 text-sm font-semibold hover:underline"
                    >
                        View All
                    </button>

                </div>

                {loading ? (
                    <p className="text-slate-500 text-sm">
                        Loading requests...
                    </p>
                ) : requests.length === 0 ? (
                    <p className="text-slate-500 text-sm bg-slate-50 p-4 rounded-xl">
                        You have not submitted any book requests yet.
                    </p>
                ) : (

                    <div className="overflow-x-auto">

                        <table className="w-full text-sm text-left">

                            <thead>
                                <tr className="border-b border-slate-200 text-slate-500">
                                    <th className="py-3 pr-4">Book Title</th>
                                    <th className="py-3 pr-4">Request Date</th>
                                    <th className="py-3">Status</th>
                                </tr>
                            </thead>

                            <tbody>

                                {requests.slice(0, 5).map((request) => (

                                    <tr
                                        key={request.request_id}
                                        className="border-b border-slate-100"
                                    >

                                        <td className="py-4 pr-4 font-medium text-slate-800">
                                            {request.title}
                                        </td>

                                        <td className="py-4 pr-4 text-slate-500">
                                            {request.request_date
                                                ? new Date(request.request_date).toLocaleDateString()
                                                : "—"}
                                        </td>

                                        <td className="py-4">

                                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                                request.status === "Approved"
                                                    ? "bg-emerald-100 text-emerald-700"
                                                    : request.status === "Rejected"
                                                    ? "bg-red-100 text-red-700"
                                                    : "bg-orange-100 text-orange-700"
                                            }`}>
                                                {request.status}
                                            </span>

                                        </td>

                                    </tr>

                                ))}

                            </tbody>

                        </table>

                    </div>

                )}

            </section>

        </div>
    );
}
