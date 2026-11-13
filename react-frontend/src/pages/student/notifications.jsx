
import { useEffect, useState } from "react";
import {
    Bell,
    RefreshCw,
    LoaderCircle,
    AlertTriangle,
    Clock,
    BookOpen,
    CalendarDays,
    CheckCircle
} from "lucide-react";

import studentApi from "../../services/studentApi";

export default function Notifications() {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const fetchNotifications = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await studentApi.get("/student/notifications");

            setNotifications(
                Array.isArray(response.data) ? response.data : []
            );
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Unable to load notifications."
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNotifications();
    }, []);

    const overdueCount = notifications.filter(
        (item) =>
            item.notification_type?.toLowerCase() === "overdue"
    ).length;

    const dueSoonCount = notifications.filter(
        (item) =>
            item.notification_type?.toLowerCase() !== "overdue"
    ).length;

    return (
        <div className="min-h-screen bg-slate-50 p-5 md:p-8">

            {/* HEADER */}
            <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                <div>
                    <p className="mb-2 text-sm font-medium text-blue-600">
                        Student Portal / Notifications
                    </p>

                    <h1 className="text-3xl font-bold text-slate-800">
                        Notifications
                    </h1>

                    <p className="mt-2 text-sm text-slate-500">
                        Stay updated about your borrowed books and due dates.
                    </p>
                </div>

                <button
                    onClick={fetchNotifications}
                    disabled={loading}
                    className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
                >
                    <RefreshCw
                        size={17}
                        className={loading ? "animate-spin" : ""}
                    />
                    Refresh
                </button>
            </div>

            {/* SUMMARY CARDS */}
            <div className="mb-8 grid grid-cols-1 gap-5 sm:grid-cols-3">

                <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-slate-500">
                                Total Notifications
                            </p>

                            <h2 className="mt-3 text-3xl font-bold text-slate-800">
                                {loading ? "—" : notifications.length}
                            </h2>
                        </div>

                        <Bell size={27} className="text-blue-600" />
                    </div>
                </div>

                <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-slate-500">
                                Overdue Books
                            </p>

                            <h2 className="mt-3 text-3xl font-bold text-red-600">
                                {loading ? "—" : overdueCount}
                            </h2>
                        </div>

                        <AlertTriangle size={27} className="text-red-500" />
                    </div>
                </div>

                <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-slate-500">
                                Due Soon
                            </p>

                            <h2 className="mt-3 text-3xl font-bold text-amber-600">
                                {loading ? "—" : dueSoonCount}
                            </h2>
                        </div>

                        <Clock size={27} className="text-amber-500" />
                    </div>
                </div>

            </div>

            {/* NOTIFICATION LIST */}
            <div className="rounded-2xl border border-slate-100 bg-white shadow-sm">

                <div className="border-b border-slate-100 px-6 py-5">
                    <h2 className="text-lg font-bold text-slate-800">
                        Recent Notifications
                    </h2>

                    <p className="mt-1 text-sm text-slate-500">
                        Updates related to your borrowing activity
                    </p>
                </div>

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20">
                        <LoaderCircle
                            size={35}
                            className="animate-spin text-blue-600"
                        />

                        <p className="mt-4 text-sm text-slate-500">
                            Loading notifications...
                        </p>
                    </div>
                ) : error ? (
                    <div className="p-10 text-center">
                        <p className="text-red-600">{error}</p>

                        <button
                            onClick={fetchNotifications}
                            className="mt-4 rounded-lg bg-blue-600 px-5 py-2 text-sm font-semibold text-white"
                        >
                            Try Again
                        </button>
                    </div>
                ) : notifications.length === 0 ? (
                    <div className="px-6 py-20 text-center">
                        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50">
                            <CheckCircle
                                size={32}
                                className="text-emerald-600"
                            />
                        </div>

                        <h3 className="mt-5 text-lg font-bold text-slate-800">
                            You're All Caught Up!
                        </h3>

                        <p className="mt-2 text-sm text-slate-500">
                            You don't have any current book notifications.
                        </p>
                    </div>
                ) : (
                    <div className="divide-y divide-slate-100">

                        {notifications.map((item, index) => {
                            const overdue =
                                item.notification_type?.toLowerCase() === "overdue";

                            return (
                                <div
                                    key={item.borrowing_id || index}
                                    className="flex flex-col gap-4 p-6 transition hover:bg-slate-50 sm:flex-row sm:items-center"
                                >
                                    <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${
                                        overdue
                                            ? "bg-red-50 text-red-600"
                                            : "bg-amber-50 text-amber-600"
                                    }`}>
                                        {overdue ? (
                                            <AlertTriangle size={23} />
                                        ) : (
                                            <Clock size={23} />
                                        )}
                                    </div>

                                    <div className="min-w-0 flex-1">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <h3 className="font-bold text-slate-800">
                                                {overdue
                                                    ? "Book Overdue"
                                                    : "Book Due Soon"}
                                            </h3>

                                            <span className={`rounded-full px-3 py-1 text-xs font-semibold ${
                                                overdue
                                                    ? "bg-red-50 text-red-700"
                                                    : "bg-amber-50 text-amber-700"
                                            }`}>
                                                {overdue ? "Overdue" : "Reminder"}
                                            </span>
                                        </div>

                                        <p className="mt-2 flex items-center gap-2 text-sm text-slate-600">
                                            <BookOpen size={16} />
                                            {item.title || "Book"}
                                        </p>

                                        <p className="mt-2 flex items-center gap-2 text-xs text-slate-500">
                                            <CalendarDays size={15} />
                                            Due Date: {
                                                item.due_date
                                                    ? new Date(item.due_date).toLocaleDateString()
                                                    : "—"
                                            }
                                        </p>
                                    </div>

                                    {overdue && (
                                        <p className="text-sm font-semibold text-red-600">
                                            {item.overdue_days} days overdue
                                        </p>
                                    )}
                                </div>
                            );
                        })}

                    </div>
                )}

            </div>
        </div>
    );
}
