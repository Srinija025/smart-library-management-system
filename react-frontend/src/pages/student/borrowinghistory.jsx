
import { useEffect, useState } from "react";
import {
    History,
    BookOpen,
    CalendarDays,
    RefreshCw,
    LoaderCircle,
    CheckCircle,
    Clock,
    AlertCircle
} from "lucide-react";

import studentApi from "../../services/studentapi";

export default function BorrowingHistory() {
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [search, setSearch] = useState("");

    const fetchHistory = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await studentApi.get("/student/history");

            setHistory(
                Array.isArray(response.data) ? response.data : []
            );
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Unable to load borrowing history."
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchHistory();
    }, []);

    const getStatus = (status) => {
        const value = status?.toLowerCase();

        if (value === "returned") {
            return {
                label: "Returned",
                style: "bg-emerald-50 text-emerald-700",
                icon: CheckCircle
            };
        }

        if (value === "overdue") {
            return {
                label: "Overdue",
                style: "bg-red-50 text-red-700",
                icon: AlertCircle
            };
        }

        return {
            label: status || "Issued",
            style: "bg-blue-50 text-blue-700",
            icon: Clock
        };
    };

    const filteredHistory = history.filter((book) =>
        `${book.title || ""} ${book.author || ""}`
            .toLowerCase()
            .includes(search.toLowerCase())
    );

    const returnedCount = history.filter(
        (book) => book.status?.toLowerCase() === "returned"
    ).length;

    const issuedCount = history.filter(
        (book) => book.status?.toLowerCase() === "issued"
    ).length;

    const formatDate = (date) =>
        date ? new Date(date).toLocaleDateString() : "—";

    return (
        <div className="min-h-screen bg-slate-50 p-5 md:p-8">

            {/* HEADER */}
            <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                <div>
                    <p className="mb-2 text-sm font-medium text-blue-600">
                        Student Portal / Borrowing History
                    </p>

                    <h1 className="text-3xl font-bold text-slate-800">
                        Borrowing History
                    </h1>

                    <p className="mt-2 text-sm text-slate-500">
                        View your complete book borrowing records.
                    </p>
                </div>

                <button
                    onClick={fetchHistory}
                    disabled={loading}
                    className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
                >
                    <RefreshCw
                        size={17}
                        className={loading ? "animate-spin" : ""}
                    />
                    Refresh History
                </button>
            </div>

            {/* SUMMARY */}
            <div className="mb-8 grid grid-cols-1 gap-5 sm:grid-cols-3">

                <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-slate-500">
                                Total Records
                            </p>

                            <h2 className="mt-3 text-3xl font-bold text-slate-800">
                                {loading ? "—" : history.length}
                            </h2>
                        </div>

                        <History size={27} className="text-blue-600" />
                    </div>
                </div>

                <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-slate-500">
                                Currently Issued
                            </p>

                            <h2 className="mt-3 text-3xl font-bold text-slate-800">
                                {loading ? "—" : issuedCount}
                            </h2>
                        </div>

                        <BookOpen size={27} className="text-blue-600" />
                    </div>
                </div>

                <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-slate-500">
                                Returned Books
                            </p>

                            <h2 className="mt-3 text-3xl font-bold text-slate-800">
                                {loading ? "—" : returnedCount}
                            </h2>
                        </div>

                        <CheckCircle size={27} className="text-emerald-600" />
                    </div>
                </div>

            </div>

            {/* HISTORY TABLE */}
            <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">

                <div className="flex flex-col justify-between gap-4 border-b border-slate-100 px-6 py-5 sm:flex-row sm:items-center">
                    <div>
                        <h2 className="text-lg font-bold text-slate-800">
                            All Borrowing Records
                        </h2>

                        <p className="mt-1 text-sm text-slate-500">
                            Your complete borrowing activity
                        </p>
                    </div>

                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search book or author..."
                        className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500 sm:w-72"
                    />
                </div>

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20">
                        <LoaderCircle
                            size={35}
                            className="animate-spin text-blue-600"
                        />

                        <p className="mt-4 text-sm text-slate-500">
                            Loading borrowing history...
                        </p>
                    </div>
                ) : error ? (
                    <div className="p-10 text-center">
                        <p className="text-red-600">{error}</p>

                        <button
                            onClick={fetchHistory}
                            className="mt-4 rounded-lg bg-blue-600 px-5 py-2 text-sm text-white"
                        >
                            Try Again
                        </button>
                    </div>
                ) : filteredHistory.length === 0 ? (
                    <div className="px-6 py-20 text-center">
                        <History
                            size={40}
                            className="mx-auto text-slate-300"
                        />

                        <h3 className="mt-4 text-lg font-bold text-slate-800">
                            No Records Found
                        </h3>

                        <p className="mt-2 text-sm text-slate-500">
                            {history.length === 0
                                ? "You don't have any borrowing records yet."
                                : "Try searching with a different book title or author."}
                        </p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[900px] text-left">

                            <thead>
                                <tr className="bg-slate-50 text-xs font-semibold uppercase tracking-wider text-slate-500">
                                    <th className="px-6 py-4">Book</th>
                                    <th className="px-6 py-4">Issue Date</th>
                                    <th className="px-6 py-4">Due Date</th>
                                    <th className="px-6 py-4">Return Date</th>
                                    <th className="px-6 py-4">Status</th>
                                </tr>
                            </thead>

                            <tbody className="divide-y divide-slate-100">
                                {filteredHistory.map((book) => {
                                    const status = getStatus(
                                        book.display_status || book.status
                                    );

                                    const StatusIcon = status.icon;

                                    return (
                                        <tr
                                            key={book.borrowing_id}
                                            className="hover:bg-slate-50"
                                        >
                                            <td className="px-6 py-5">
                                                <div className="flex items-center gap-3">
                                                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50">
                                                        <BookOpen
                                                            size={20}
                                                            className="text-blue-600"
                                                        />
                                                    </div>

                                                    <div>
                                                        <p className="font-semibold text-slate-800">
                                                            {book.title}
                                                        </p>

                                                        <p className="mt-1 text-xs text-slate-500">
                                                            {book.author || "Unknown Author"}
                                                        </p>
                                                    </div>
                                                </div>
                                            </td>

                                            <td className="px-6 py-5 text-sm text-slate-600">
                                                <CalendarDays
                                                    size={15}
                                                    className="mr-2 inline"
                                                />
                                                {formatDate(book.issue_date)}
                                            </td>

                                            <td className="px-6 py-5 text-sm text-slate-600">
                                                {formatDate(book.due_date)}
                                            </td>

                                            <td className="px-6 py-5 text-sm text-slate-600">
                                                {formatDate(book.return_date)}
                                            </td>

                                            <td className="px-6 py-5">
                                                <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold ${status.style}`}>
                                                    <StatusIcon size={14} />
                                                    {status.label}
                                                </span>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>

                        </table>
                    </div>
                )}

            </div>
        </div>
    );
}
