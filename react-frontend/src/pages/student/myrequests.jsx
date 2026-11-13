
import { useEffect, useState } from "react";
import {
    ClipboardList,
    RefreshCw,
    LoaderCircle,
    Clock,
    CheckCircle,
    XCircle,
    BookOpen,
    CalendarDays,
    MessageSquareText
} from "lucide-react";

import studentApi from "../../services/studentApi";

export default function MyRequests() {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        fetchRequests();
    }, []);

    const fetchRequests = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await studentApi.get("/student/requests");

            setRequests(
                Array.isArray(response.data) ? response.data : []
            );
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Unable to load your book requests."
            );
        } finally {
            setLoading(false);
        }
    };

    const pending = requests.filter(
        (r) => r.status?.toLowerCase() === "pending"
    ).length;

    const approved = requests.filter(
        (r) => r.status?.toLowerCase() === "approved"
    ).length;

    const rejected = requests.filter(
        (r) => r.status?.toLowerCase() === "rejected"
    ).length;

    const getStatus = (status) => {
        switch (status?.toLowerCase()) {
            case "approved":
                return {
                    style: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200",
                    icon: CheckCircle
                };
            case "rejected":
                return {
                    style: "bg-red-50 text-red-700 ring-1 ring-red-200",
                    icon: XCircle
                };
            default:
                return {
                    style: "bg-amber-50 text-amber-700 ring-1 ring-amber-200",
                    icon: Clock
                };
        }
    };

    const summaryCards = [
        {
            title: "Total Requests",
            value: requests.length,
            icon: ClipboardList,
            color: "bg-blue-50 text-blue-600"
        },
        {
            title: "Pending Requests",
            value: pending,
            icon: Clock,
            color: "bg-amber-50 text-amber-600"
        },
        {
            title: "Approved Requests",
            value: approved,
            icon: CheckCircle,
            color: "bg-emerald-50 text-emerald-600"
        },
        {
            title: "Rejected Requests",
            value: rejected,
            icon: XCircle,
            color: "bg-red-50 text-red-600"
        }
    ];

    return (
        <div className="min-h-screen bg-slate-50 p-5 md:p-8">

            {/* PAGE HEADER */}
            <div className="mb-8 flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
                <div>
                    <div className="mb-2 flex items-center gap-2 text-sm font-medium text-blue-600">
                        <BookOpen size={17} />
                        Student Portal
                        <span className="text-slate-400">/</span>
                        My Requests
                    </div>

                    <h1 className="text-3xl font-bold tracking-tight text-slate-800">
                        My Book Requests
                    </h1>

                    <p className="mt-2 text-sm text-slate-500">
                        View and track all your book borrowing requests.
                    </p>
                </div>

                <button
                    onClick={fetchRequests}
                    disabled={loading}
                    className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-200 transition hover:bg-blue-700 disabled:opacity-60"
                >
                    <RefreshCw
                        size={17}
                        className={loading ? "animate-spin" : ""}
                    />
                    Refresh Requests
                </button>
            </div>

            {/* SUMMARY CARDS */}
            <div className="mb-8 grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">

                {summaryCards.map((card) => {
                    const Icon = card.icon;

                    return (
                        <div
                            key={card.title}
                            className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
                        >
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-slate-500">
                                        {card.title}
                                    </p>

                                    <h2 className="mt-3 text-3xl font-bold text-slate-800">
                                        {loading ? "—" : card.value}
                                    </h2>
                                </div>

                                <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${card.color}`}>
                                    <Icon size={23} />
                                </div>
                            </div>
                        </div>
                    );
                })}

            </div>

            {/* REQUEST TABLE SECTION */}
            <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">

                <div className="flex flex-col justify-between gap-3 border-b border-slate-100 px-6 py-5 sm:flex-row sm:items-center">
                    <div>
                        <h2 className="text-lg font-bold text-slate-800">
                            Request History
                        </h2>

                        <p className="mt-1 text-sm text-slate-500">
                            All your submitted book requests
                        </p>
                    </div>

                    <span className="w-fit rounded-lg bg-blue-50 px-3 py-2 text-sm font-semibold text-blue-700">
                        {requests.length} Requests
                    </span>
                </div>

                {loading ? (

                    <div className="flex flex-col items-center justify-center py-20">
                        <LoaderCircle
                            className="animate-spin text-blue-600"
                            size={36}
                        />
                        <p className="mt-4 text-sm text-slate-500">
                            Loading your requests...
                        </p>
                    </div>

                ) : error ? (

                    <div className="p-8 text-center">
                        <p className="text-red-600">{error}</p>

                        <button
                            onClick={fetchRequests}
                            className="mt-4 rounded-lg bg-blue-600 px-5 py-2 text-sm font-semibold text-white hover:bg-blue-700"
                        >
                            Try Again
                        </button>
                    </div>

                ) : requests.length === 0 ? (

                    <div className="flex flex-col items-center justify-center px-6 py-20 text-center">
                        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50">
                            <ClipboardList
                                size={30}
                                className="text-blue-500"
                            />
                        </div>

                        <h3 className="mt-5 text-lg font-bold text-slate-800">
                            No Requests Yet
                        </h3>

                        <p className="mt-2 max-w-sm text-sm text-slate-500">
                            You haven't submitted any book requests.
                            Visit Browse Books to request a book.
                        </p>
                    </div>

                ) : (

                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[850px] text-left">

                            <thead>
                                <tr className="bg-slate-50 text-xs font-semibold uppercase tracking-wider text-slate-500">
                                    <th className="px-6 py-4">Book Details</th>
                                    <th className="px-6 py-4">Author</th>
                                    <th className="px-6 py-4">Request Date</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4">Admin Remarks</th>
                                </tr>
                            </thead>

                            <tbody className="divide-y divide-slate-100">

                                {requests.map((request) => {
                                    const status = getStatus(request.status);
                                    const StatusIcon = status.icon;

                                    return (
                                        <tr
                                            key={request.request_id}
                                            className="transition hover:bg-slate-50"
                                        >
                                            <td className="px-6 py-5">
                                                <div className="flex items-center gap-3">
                                                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50">
                                                        <BookOpen
                                                            size={21}
                                                            className="text-blue-600"
                                                        />
                                                    </div>

                                                    <div>
                                                        <p className="font-semibold text-slate-800">
                                                            {request.title}
                                                        </p>

                                                        <p className="mt-1 text-xs text-slate-400">
                                                            Request #{request.request_id}
                                                        </p>
                                                    </div>
                                                </div>
                                            </td>

                                            <td className="px-6 py-5 text-sm text-slate-600">
                                                {request.author || "Unknown"}
                                            </td>

                                            <td className="px-6 py-5">
                                                <div className="flex items-center gap-2 text-sm text-slate-600">
                                                    <CalendarDays
                                                        size={16}
                                                        className="text-slate-400"
                                                    />

                                                    {request.request_date
                                                        ? new Date(request.request_date).toLocaleDateString()
                                                        : "—"}
                                                </div>
                                            </td>

                                            <td className="px-6 py-5">
                                                <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold ${status.style}`}>
                                                    <StatusIcon size={15} />
                                                    {request.status}
                                                </span>
                                            </td>

                                            <td className="px-6 py-5">
                                                <div className="flex items-center gap-2 text-sm text-slate-500">
                                                    <MessageSquareText
                                                        size={16}
                                                        className="shrink-0 text-slate-400"
                                                    />
                                                    {request.admin_remarks || "No remarks"}
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}

                            </tbody>
                        </table>
                    </div>

                )}

            </div>

            <p className="mt-5 text-center text-xs text-slate-400">
                Your request status updates when the library administrator reviews your request.
            </p>

        </div>
    );
}
