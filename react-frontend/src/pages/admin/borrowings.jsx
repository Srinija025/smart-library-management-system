
import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeftRight,
  Search,
  RefreshCw,
  RotateCcw,
  Plus,
  X,
  AlertCircle,
  BookOpen,
  CheckCircle,
  Clock
} from "lucide-react";
import api from "../../services/api";

export default function Borrowings() {
  const [borrowings, setBorrowings] = useState([]);
  const [students, setStudents] = useState([]);
  const [books, setBooks] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");

  const getToday = () => {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  };

  const getDefaultDueDate = () => {
    const date = new Date();
    date.setDate(date.getDate() + 14);

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  };

  const [form, setForm] = useState({
    student_id: "",
    book_id: "",
    issue_date: getToday(),
    due_date: getDefaultDueDate()
  });

  const loadBorrowings = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/borrowings");
      setBorrowings(
        Array.isArray(response.data) ? response.data : []
      );
    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Unable to load borrowing records."
      );
    } finally {
      setLoading(false);
    }
  };

  const loadFormOptions = async () => {
    try {
      const [studentResponse, bookResponse] = await Promise.all([
        api.get("/students"),
        api.get("/books")
      ]);

      setStudents(
        Array.isArray(studentResponse.data)
          ? studentResponse.data
          : []
      );

      setBooks(
        Array.isArray(bookResponse.data)
          ? bookResponse.data
          : []
      );
    } catch (err) {
      setFormError(
        err.response?.data?.message ||
        "Unable to load students or books."
      );
    }
  };

  useEffect(() => {
    loadBorrowings();
  }, []);

  const today = getToday();

  const isOverdue = (record) =>
    record.status === "Issued" &&
    String(record.due_date).slice(0, 10) < today;

  const issuedCount = borrowings.filter(
    (record) => record.status === "Issued"
  ).length;

  const returnedCount = borrowings.filter(
    (record) => record.status === "Returned"
  ).length;

  const overdueCount = borrowings.filter(isOverdue).length;

  const filteredBorrowings = useMemo(() => {
    const term = search.toLowerCase().trim();

    return borrowings.filter((record) => {
      const matchesSearch = [
        record.student_name,
        record.roll_number,
        record.title,
        record.author
      ]
        .filter(Boolean)
        .some((value) =>
          String(value).toLowerCase().includes(term)
        );

      let matchesStatus = true;

      if (statusFilter === "Overdue") {
        matchesStatus = isOverdue(record);
      } else if (statusFilter !== "All") {
        matchesStatus = record.status === statusFilter;
      }

      return matchesSearch && matchesStatus;
    });
  }, [borrowings, search, statusFilter]);

  const openIssueModal = async () => {
    setFormError("");
    setForm({
      student_id: "",
      book_id: "",
      issue_date: getToday(),
      due_date: getDefaultDueDate()
    });

    setShowModal(true);
    await loadFormOptions();
  };

  const closeModal = () => {
    if (saving) return;
    setShowModal(false);
    setFormError("");
  };

  const handleChange = (event) => {
    setForm({
      ...form,
      [event.target.name]: event.target.value
    });
  };

  const handleIssueBook = async (event) => {
    event.preventDefault();
    setFormError("");

    if (
      !form.student_id ||
      !form.book_id ||
      !form.issue_date ||
      !form.due_date
    ) {
      setFormError("Please complete all required fields.");
      return;
    }

    if (form.due_date < form.issue_date) {
      setFormError("Due date cannot be before issue date.");
      return;
    }

    const payload = {
      student_id: Number(form.student_id),
      book_id: Number(form.book_id),
      issue_date: form.issue_date,
      due_date: form.due_date
    };

    try {
      setSaving(true);

      const response = await api.post(
        "/borrowings/issue",
        payload
      );

      setShowModal(false);
      await loadBorrowings();

      alert(
        response.data.message ||
        "Book issued successfully."
      );
    } catch (err) {
      setFormError(
        err.response?.data?.message ||
        "Unable to issue book."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleReturnBook = async (record) => {
    const confirmed = window.confirm(
      `Confirm that you have physically received "${record.title}" from ${record.student_name}?`
    );

    if (!confirmed) return;

    try {
      setError("");

      const response = await api.put(
        `/borrowings/${record.borrowing_id}/return`
      );

      await loadBorrowings();

      alert(
        response.data.message ||
        "Book returned successfully."
      );
    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Unable to return this book."
      );
    }
  };

  const stats = [
    {
      title: "Total Transactions",
      value: borrowings.length,
      icon: ArrowLeftRight,
      color: "bg-blue-100 text-blue-600"
    },
    {
      title: "Currently Issued",
      value: issuedCount,
      icon: BookOpen,
      color: "bg-green-100 text-green-600"
    },
    {
      title: "Returned Books",
      value: returnedCount,
      icon: CheckCircle,
      color: "bg-purple-100 text-purple-600"
    },
    {
      title: "Overdue Books",
      value: overdueCount,
      icon: Clock,
      color: "bg-red-100 text-red-600"
    }
  ];

  return (
    <div className="min-h-screen p-5 md:p-8">
      {/* Page Header */}
      <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">
            Borrowings Management
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Manage issued books, returns and overdue transactions.
          </p>
        </div>

        <button
          onClick={openIssueModal}
          className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm hover:bg-blue-700"
        >
          <Plus size={18} />
          Issue Book
        </button>
      </div>

      {/* Statistics */}
      <div className="mb-7 grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;

          return (
            <div
              key={stat.title}
              className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500">
                    {stat.title}
                  </p>
                  <h2 className="mt-2 text-3xl font-bold text-slate-800">
                    {loading ? "..." : stat.value}
                  </h2>
                </div>

                <div className={`rounded-xl p-3 ${stat.color}`}>
                  <Icon size={24} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Search and Filter */}
      <div className="mb-5 flex flex-col gap-3 lg:flex-row">
        <div className="relative flex-1">
          <Search
            size={19}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
          />

          <input
            type="text"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search student, roll number or book..."
            className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-11 pr-4 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(event) => setStatusFilter(event.target.value)}
          className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500"
        >
          <option value="All">All Status</option>
          <option value="Issued">Issued</option>
          <option value="Returned">Returned</option>
          <option value="Overdue">Overdue</option>
        </select>

        <button
          onClick={loadBorrowings}
          className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-medium text-slate-600 hover:bg-slate-50"
        >
          <RefreshCw size={17} />
          Refresh
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-5 flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <AlertCircle size={18} />
          {error}
        </div>
      )}

      {/* Borrowings Table */}
      <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[950px] text-left">
            <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500">
              <tr>
                <th className="px-5 py-4">ID</th>
                <th className="px-5 py-4">Student</th>
                <th className="px-5 py-4">Book</th>
                <th className="px-5 py-4">Issue Date</th>
                <th className="px-5 py-4">Due Date</th>
                <th className="px-5 py-4">Return Date</th>
                <th className="px-5 py-4">Status</th>
                <th className="px-5 py-4 text-center">Action</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan="8" className="px-6 py-12 text-center text-slate-500">
                    Loading borrowing records...
                  </td>
                </tr>
              ) : filteredBorrowings.length === 0 ? (
                <tr>
                  <td colSpan="8" className="px-6 py-12 text-center text-slate-500">
                    No borrowing records found.
                  </td>
                </tr>
              ) : (
                filteredBorrowings.map((record) => {
                  const overdue = isOverdue(record);
                  const displayStatus = overdue
                    ? "Overdue"
                    : record.status;

                  return (
                    <tr
                      key={record.borrowing_id}
                      className="transition hover:bg-slate-50"
                    >
                      <td className="px-5 py-4 text-sm text-slate-500">
                        #{record.borrowing_id}
                      </td>

                      <td className="px-5 py-4">
                        <p className="text-sm font-semibold text-slate-800">
                          {record.student_name}
                        </p>
                        <p className="text-xs text-slate-500">
                          {record.roll_number}
                        </p>
                      </td>

                      <td className="px-5 py-4">
                        <p className="text-sm font-medium text-slate-800">
                          {record.title}
                        </p>
                        <p className="text-xs text-slate-500">
                          {record.author || "—"}
                        </p>
                      </td>

                      <td className="px-5 py-4 text-sm text-slate-600">
                        {String(record.issue_date || "—").slice(0, 10)}
                      </td>

                      <td className="px-5 py-4 text-sm text-slate-600">
                        {String(record.due_date || "—").slice(0, 10)}
                      </td>

                      <td className="px-5 py-4 text-sm text-slate-600">
                        {record.return_date
                          ? String(record.return_date).slice(0, 10)
                          : "Not returned"}
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold ${
                            displayStatus === "Returned"
                              ? "bg-purple-100 text-purple-700"
                              : displayStatus === "Overdue"
                              ? "bg-red-100 text-red-700"
                              : "bg-green-100 text-green-700"
                          }`}
                        >
                          {displayStatus}
                        </span>
                      </td>

                      <td className="px-5 py-4 text-center">
                        {record.status === "Issued" ? (
                          <button
                            onClick={() => handleReturnBook(record)}
                            className="inline-flex items-center gap-2 rounded-lg bg-green-50 px-3 py-2 text-xs font-semibold text-green-700 hover:bg-green-100"
                          >
                            <RotateCcw size={15} />
                            Return
                          </button>
                        ) : (
                          <span className="text-xs text-slate-400">
                            Completed
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <div className="border-t border-slate-100 px-6 py-4 text-sm text-slate-500">
          Showing {filteredBorrowings.length} of {borrowings.length} transactions
        </div>
      </div>

      {/* Issue Book Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-slate-800">
                  Issue a Book
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Select a student, book and borrowing dates.
                </p>
              </div>

              <button
                onClick={closeModal}
                className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleIssueBook} className="space-y-5">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Select Student *
                </label>

                <select
                  name="student_id"
                  value={form.student_id}
                  onChange={handleChange}
                  required
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500"
                >
                  <option value="">Choose a student</option>

                  {students.map((student) => (
                    <option
                      key={student.student_id}
                      value={student.student_id}
                    >
                      {student.student_name} - {student.roll_number}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Select Book *
                </label>

                <select
                  name="book_id"
                  value={form.book_id}
                  onChange={handleChange}
                  required
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500"
                >
                  <option value="">Choose an available book</option>

                  {books
                    .filter(
                      (book) => Number(book.available_quantity) > 0
                    )
                    .map((book) => (
                      <option
                        key={book.book_id}
                        value={book.book_id}
                      >
                        {book.title} (Available: {book.available_quantity})
                      </option>
                    ))}
                </select>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Issue Date *
                  </label>

                  <input
                    type="date"
                    name="issue_date"
                    value={form.issue_date}
                    onChange={handleChange}
                    required
                    className="w-full rounded-xl border border-slate-200 px-3 py-3 text-sm outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Due Date *
                  </label>

                  <input
                    type="date"
                    name="due_date"
                    value={form.due_date}
                    min={form.issue_date}
                    onChange={handleChange}
                    required
                    className="w-full rounded-xl border border-slate-200 px-3 py-3 text-sm outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              {formError && (
                <p className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
                  {formError}
                </p>
              )}

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={saving}
                  className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
                >
                  {saving ? "Issuing..." : "Issue Book"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
