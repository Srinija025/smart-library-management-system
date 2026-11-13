
import { useEffect, useState } from "react";
import {
    Search,
    BookOpen,
    LoaderCircle,
    Send,
    CheckCircle,
    RefreshCw
} from "lucide-react";
import studentApi from "../../services/studentApi";

export default function BrowseBooks() {
    const [books, setBooks] = useState([]);
    const [categories, setCategories] = useState([]);
    const [requests, setRequests] = useState([]);

    const [search, setSearch] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("");

    const [loading, setLoading] = useState(true);
    const [requestsLoading, setRequestsLoading] = useState(true);
    const [requestingBook, setRequestingBook] = useState(null);

    const [error, setError] = useState("");
    const [message, setMessage] = useState("");
    const [messageType, setMessageType] = useState("success");

    useEffect(() => {
        fetchBooks();
        fetchCategories();
        fetchRequests();
    }, []);

    const fetchBooks = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await studentApi.get("/books");

            setBooks(
                Array.isArray(response.data)
                    ? response.data
                    : response.data.books || response.data.data || []
            );
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Unable to load books. Please check the backend."
            );
        } finally {
            setLoading(false);
        }
    };

    const fetchCategories = async () => {
        try {
            const response = await studentApi.get("/books/categories");
            setCategories(Array.isArray(response.data) ? response.data : []);
        } catch (err) {
            console.error("Unable to load categories:", err);
        }
    };

    const fetchRequests = async () => {
        try {
            const response = await studentApi.get("/student/requests");

            setRequests(
                Array.isArray(response.data)
                    ? response.data
                    : response.data.requests || []
            );
        } catch (err) {
            console.error("Unable to load student requests:", err);
        } finally {
            setRequestsLoading(false);
        }
    };

    const handleRequestBook = async (book) => {
        try {
            setRequestingBook(book.book_id);
            setMessage("");

            const response = await studentApi.post("/student/requests", {
                book_id: book.book_id
            });

            setRequests((previous) => [
                {
                    request_id: response.data.request_id,
                    book_id: book.book_id,
                    title: book.title,
                    status: response.data.status || "Pending"
                },
                ...previous
            ]);

            setMessage(
                response.data.message || "Book request submitted successfully."
            );
            setMessageType("success");
        } catch (err) {
            setMessage(
                err.response?.data?.message ||
                "Unable to submit your book request."
            );
            setMessageType("error");
        } finally {
            setRequestingBook(null);
        }
    };

    const getBookRequest = (bookId) => {
        return requests.find(
            (request) =>
                Number(request.book_id) === Number(bookId) &&
                ["pending", "approved"].includes(
                    String(request.status).toLowerCase()
                )
        );
    };

    const filteredBooks = books.filter((book) => {
        const searchText = `
            ${book.title || ""}
            ${book.author || ""}
            ${book.category_name || ""}
            ${book.isbn || ""}
        `.toLowerCase();

        const matchesSearch = searchText.includes(search.toLowerCase());

        const matchesCategory =
            selectedCategory === "" ||
            String(book.category_id) === selectedCategory;

        return matchesSearch && matchesCategory;
    });

    return (
        <div className="min-h-screen bg-slate-50 p-6 md:p-8">

            {/* PAGE HEADER */}
            <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800">
                        Browse Books
                    </h1>
                    <p className="mt-2 text-slate-500">
                        Discover books and send borrowing requests to your librarian.
                    </p>
                </div>

                <button
                    onClick={() => {
                        fetchBooks();
                        fetchRequests();
                    }}
                    className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-100"
                >
                    <RefreshCw size={17} />
                    Refresh
                </button>
            </div>

            {/* SEARCH AND FILTER */}
            <div className="mb-7 grid gap-4 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm md:grid-cols-3">

                <div className="relative md:col-span-2">
                    <Search
                        className="absolute left-4 top-3.5 text-slate-400"
                        size={20}
                    />

                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search by title, author, ISBN or category..."
                        className="w-full rounded-xl border border-slate-200 py-3 pl-12 pr-4 outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
                >
                    <option value="">All Categories</option>

                    {categories.map((category) => (
                        <option
                            key={category.category_id}
                            value={category.category_id}
                        >
                            {category.category_name}
                        </option>
                    ))}
                </select>
            </div>

            {/* SUCCESS / ERROR MESSAGE */}
            {message && (
                <div
                    className={`mb-6 rounded-xl p-4 ${
                        messageType === "success"
                            ? "bg-green-50 text-green-700"
                            : "bg-red-50 text-red-700"
                    }`}
                >
                    {message}
                </div>
            )}

            {/* BOOK COUNT */}
            {!loading && !error && (
                <p className="mb-5 text-sm text-slate-500">
                    Showing {filteredBooks.length} of {books.length} books
                </p>
            )}

            {/* LOADING */}
            {loading ? (
                <div className="flex justify-center py-16">
                    <LoaderCircle
                        className="animate-spin text-blue-600"
                        size={38}
                    />
                </div>
            ) : error ? (
                <div className="rounded-xl bg-red-50 p-5 text-red-600">
                    {error}
                    <button
                        onClick={fetchBooks}
                        className="ml-3 font-semibold underline"
                    >
                        Retry
                    </button>
                </div>
            ) : filteredBooks.length === 0 ? (
                <div className="rounded-2xl bg-white p-12 text-center shadow-sm">
                    <BookOpen
                        className="mx-auto mb-4 text-slate-300"
                        size={45}
                    />

                    <h2 className="text-xl font-semibold text-slate-700">
                        No books found
                    </h2>

                    <p className="mt-2 text-slate-500">
                        Try changing your search or category filter.
                    </p>
                </div>
            ) : (
                /* BOOK CARDS */
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">

                    {filteredBooks.map((book) => {
                        const available =
                            Number(book.available_quantity) > 0;

                        const existingRequest =
                            getBookRequest(book.book_id);

                        return (
                            <div
                                key={book.book_id}
                                className="flex flex-col rounded-2xl border border-slate-100 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
                            >
                                <div className="mb-4 flex items-center justify-between">
                                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50">
                                        <BookOpen
                                            className="text-blue-600"
                                            size={25}
                                        />
                                    </div>

                                    <span
                                        className={`rounded-full px-3 py-1 text-xs font-semibold ${
                                            available
                                                ? "bg-green-50 text-green-700"
                                                : "bg-red-50 text-red-600"
                                        }`}
                                    >
                                        {available ? "Available" : "Unavailable"}
                                    </span>
                                </div>

                                <h2 className="text-lg font-bold text-slate-800">
                                    {book.title}
                                </h2>

                                <p className="mt-2 text-sm text-slate-500">
                                    Author: {book.author || "Unknown"}
                                </p>

                                <p className="mt-1 text-sm text-slate-500">
                                    Category: {book.category_name || "General"}
                                </p>

                                <p className="mt-1 text-sm text-slate-500">
                                    ISBN: {book.isbn || "Not specified"}
                                </p>

                                <div className="mt-4 rounded-xl bg-slate-50 p-3">
                                    <p className="text-sm text-slate-600">
                                        Available copies:{" "}
                                        <strong className="text-slate-800">
                                            {book.available_quantity}
                                        </strong>
                                    </p>

                                    <p className="mt-1 text-sm text-slate-600">
                                        Total copies:{" "}
                                        <strong className="text-slate-800">
                                            {book.total_quantity}
                                        </strong>
                                    </p>
                                </div>

                                <div className="mt-auto pt-5">
                                    {existingRequest ? (
                                        <button
                                            disabled
                                            className="flex w-full cursor-not-allowed items-center justify-center gap-2 rounded-xl bg-amber-50 px-4 py-3 font-semibold text-amber-700"
                                        >
                                            <CheckCircle size={18} />
                                            {existingRequest.status}
                                        </button>
                                    ) : (
                                        <button
                                            onClick={() => handleRequestBook(book)}
                                            disabled={
                                                !available ||
                                                requestingBook === book.book_id ||
                                                requestsLoading
                                            }
                                            className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-300"
                                        >
                                            {requestingBook === book.book_id ? (
                                                <>
                                                    <LoaderCircle
                                                        className="animate-spin"
                                                        size={18}
                                                    />
                                                    Sending...
                                                </>
                                            ) : requestsLoading ? (
                                                "Checking requests..."
                                            ) : (
                                                <>
                                                    <Send size={17} />
                                                    Request Book
                                                </>
                                            )}
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
