
import { useEffect, useState } from "react";
import {
    BookOpen,
    RefreshCw,
    CalendarDays,
    Clock,
    CheckCircle,
    RotateCcw,
    LoaderCircle
} from "lucide-react";

import studentApi from "../../services/studentapi";

export default function IssuedBooks() {
    const [books, setBooks] = useState([]);
    const [returnRequests, setReturnRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(null);
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");

    const fetchBooks = async () => {
        try {
            setLoading(true);
            setError("");

            const [issuedResponse, returnResponse] = await Promise.all([
                studentApi.get("/student/issued"),
                studentApi.get("/student/return-requests")
            ]);

            setBooks(Array.isArray(issuedResponse.data)
                ? issuedResponse.data
                : []);

            setReturnRequests(Array.isArray(returnResponse.data)
                ? returnResponse.data
                : []);
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Unable to load your issued books."
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBooks();
    }, []);

    const getReturnRequest = (borrowingId) =>
        returnRequests.find(
            (request) =>
                Number(request.borrowing_id) === Number(borrowingId)
        );

    const requestReturn = async (borrowingId) => {
        try {
            setSubmitting(borrowingId);
            setMessage("");
            setError("");

            const response = await studentApi.post("/student/returns", {
                borrowing_id: borrowingId
            });

            setMessage(response.data?.message || "Return request submitted successfully.");

            await fetchBooks();
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Unable to submit return request."
            );
        } finally {
            setSubmitting(null);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 p-5 md:p-8">

            <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                <div>
                    <p className="mb-2 text-sm font-medium text-blue-600">
                        Student Portal / My Issued Books
                    </p>

                    <h1 className="text-3xl font-bold text-slate-800">
                        My Issued Books
                    </h1>

                    <p className="mt-2 text-sm text-slate-500">
                        Track your borrowed books and request returns.
                    </p>
                </div>

                <button
                    onClick={fetchBooks}
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

            {message && (
                <div className="mb-5 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">
                    {message}
                </div>
            )}

            {error && (
                <div className="mb-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                    {error}
                </div>
            )}

            <div className="mb-6 rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
                <div className="flex items-center gap-4">
                    <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                        <BookOpen size={27} />
                    </div>

                    <div>
                        <p className="text-sm text-slate-500">
                            Currently Issued
                        </p>

                        <h2 className="text-3xl font-bold text-slate-800">
                            {loading ? "—" : books.length}
                        </h2>
                    </div>
                </div>
            </div>

            {loading ? (
                <div className="flex flex-col items-center justify-center rounded-2xl bg-white py-20">
                    <LoaderCircle size={35} className="animate-spin text-blue-600" />
                    <p className="mt-4 text-sm text-slate-500">
                        Loading issued books...
                    </p>
                </div>
            ) : books.length === 0 ? (
                <div className="rounded-2xl border border-slate-100 bg-white px-6 py-20 text-center shadow-sm">
                    <BookOpen size={40} className="mx-auto text-slate-300" />

                    <h3 className="mt-4 text-lg font-bold text-slate-800">
                        No Books Issued
                    </h3>

                    <p className="mt-2 text-sm text-slate-500">
                        You currently don't have any issued books.
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
                    {books.map((book) => {
                        const returnRequest = getReturnRequest(book.borrowing_id);
                        const returnPending =
                            returnRequest?.status?.toLowerCase() === "pending";

                        const overdue =
                            book.display_status?.toLowerCase() === "overdue" ||
                            Number(book.days_remaining) < 0;

                        return (
                            <div
                                key={book.borrowing_id}
                                className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm"
                            >
                                <div className="flex items-start gap-4">
                                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                                        <BookOpen size={27} />
                                    </div>

                                    <div className="min-w-0 flex-1">
                                        <h3 className="text-lg font-bold text-slate-800">
                                            {book.title}
                                        </h3>

                                        <p className="mt-1 text-sm text-slate-500">
                                            {book.author || "Unknown Author"}
                                        </p>
                                    </div>

                                    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${
                                        overdue
                                            ? "bg-red-50 text-red-700"
                                            : "bg-emerald-50 text-emerald-700"
                                    }`}>
                                        {overdue ? "Overdue" : "Issued"}
                                    </span>
                                </div>

                                <div className="mt-6 grid grid-cols-2 gap-4">
                                    <div className="rounded-xl bg-slate-50 p-4">
                                        <p className="flex items-center gap-2 text-xs text-slate-500">
                                            <CalendarDays size={15} />
                                            Issue Date
                                        </p>

                                        <p className="mt-2 text-sm font-semibold text-slate-800">
                                            {book.issue_date
                                                ? new Date(book.issue_date).toLocaleDateString()
                                                : "—"}
                                        </p>
                                    </div>

                                    <div className="rounded-xl bg-slate-50 p-4">
                                        <p className="flex items-center gap-2 text-xs text-slate-500">
                                            <Clock size={15} />
                                            Due Date
                                        </p>

                                        <p className="mt-2 text-sm font-semibold text-slate-800">
                                            {book.due_date
                                                ? new Date(book.due_date).toLocaleDateString()
                                                : "—"}
                                        </p>
                                    </div>
                                </div>

                                <div className="mt-5">
                                    {returnPending ? (
                                        <div className="flex items-center justify-center gap-2 rounded-xl bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-700">
                                            <Clock size={17} />
                                            Return Request Pending
                                        </div>
                                    ) : returnRequest?.status?.toLowerCase() === "approved" ? (
                                        <div className="flex items-center justify-center gap-2 rounded-xl bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">
                                            <CheckCircle size={17} />
                                            Return Request Approved
                                        </div>
                                    ) : (
                                        <button
                                            onClick={() => requestReturn(book.borrowing_id)}
                                            disabled={submitting === book.borrowing_id}
                                            className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:opacity-60"
                                        >
                                            {submitting === book.borrowing_id ? (
                                                <LoaderCircle size={17} className="animate-spin" />
                                            ) : (
                                                <RotateCcw size={17} />
                                            )}

                                            {submitting === book.borrowing_id
                                                ? "Submitting..."
                                                : "Request Return"}
                                        </button>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
