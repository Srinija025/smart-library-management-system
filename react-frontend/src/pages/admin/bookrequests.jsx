
import { useEffect, useState } from "react";
import {
  ClipboardList,
  Search,
  RefreshCw,
  CheckCircle,
  XCircle,
  BookOpen,
  AlertCircle
} from "lucide-react";
import api from "../../services/api";

export default function BookRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [processingId, setProcessingId] = useState(null);

  const loadRequests = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/borrowings/requests");

      setRequests(
        Array.isArray(response.data) ? response.data : []
      );
    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Unable to load book requests."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRequests();
  }, []);

  const filteredRequests = requests.filter((request) => {
    const term = search.toLowerCase().trim();

    const matchesSearch = [
      request.student_name,
      request.roll_number,
      request.title,
      request.status
    ]
      .filter(Boolean)
      .some((value) =>
        String(value).toLowerCase().includes(term)
      );

    const matchesStatus =
      statusFilter === "All" ||
      request.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const pendingCount = requests.filter(
    (request) => request.status === "Pending"
  ).length;

  const approvedCount = requests.filter(
    (request) => request.status === "Approved"
  ).length;

  const rejectedCount = requests.filter(
    (request) => request.status === "Rejected"
  ).length;

  const getToday = () => {
    const date = new Date();

    return [
      date.getFullYear(),
      String(date.getMonth() + 1).padStart(2, "0"),
      String(date.getDate()).padStart(2, "0")
    ].join("-");
  };

  const getDueDate = () => {
    const date = new Date();
    date.setDate(date.getDate() + 14);

    return [
      date.getFullYear(),
      String(date.getMonth() + 1).padStart(2, "0"),
      String(date.getDate()).padStart(2, "0")
    ].join("-");
  };

  const handleAction = async (request, action) => {
    const id = request.request_id;

    if (action === "approve") {
      if (!window.confirm("Approve this student's book request?")) {
        return;
      }
    }

    if (action === "reject") {
      if (!window.confirm("Reject this student's book request?")) {
        return;
      }
    }

    if (action === "issue") {
      if (!window.confirm("Issue this approved book to the student?")) {
        return;
      }
    }

    let remarks = "";

    if (action === "reject") {
      remarks = window.prompt("Enter rejection remarks:") || "";
    }

    try {
      setProcessingId(id);
      setError("");

      let response;

      if (action === "approve") {
        response = await api.patch(
          `/borrowings/requests/${id}/approve`
        );
      }

      if (action === "reject") {
        response = await api.patch(
          `/borrowings/requests/${id}/reject`,
          { admin_remarks: remarks }
        );
      }

      if (action === "issue") {
        response = await api.post(
          `/borrowings/requests/${id}/issue`,
          {
            issue_date: getToday(),
            due_date: getDueDate()
          }
        );
      }

      alert(
        response.data.message ||
        "Request updated successfully."
      );

      await loadRequests();
    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Unable to process this request."
      );
    } finally {
      setProcessingId(null);
    }
  };

  const stats = [
    {
      title: "Total Requests",
      value: requests.length,
      icon: ClipboardList,
      color: "bg-blue-100 text-blue-600"
    },
    {
      title: "Pending Requests",
      value: pendingCount,
      icon: AlertCircle,
      color: "bg-orange-100 text-orange-600"
    },
    {
      title: "Approved Requests",
      value: approvedCount,
      icon: CheckCircle,
      color: "bg-green-100 text-green-600"
    },
    {
      title: "Rejected Requests",
      value: rejectedCount,
      icon: XCircle,
      color: "bg-red-100 text-red-600"
    }
  ];

  const getStatusStyle = (status) => {
    switch (status) {
      case "Approved":
        return "bg-green-100 text-green-700";
      case "Rejected":
        return "bg-red-100 text-red-700";
      case "Issued":
        return "bg-blue-100 text-blue-700";
      default:
        return "bg-orange-100 text-orange-700";
    }
  };

  return (
    <div className="min-h-screen p-5 md:p-8">
      {/* Header */}
      <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">
            Book Requests
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Review and process student book borrowing requests.
          </p>
        </div>

        <button
          onClick={loadRequests}
          className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-medium text-slate-600 hover:bg-slate-50"
        >
          <RefreshCw size={17} />
          Refresh
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
      <div className="mb-5 flex flex-col gap-3 sm:flex-row">
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
          <option value="Pending">Pending</option>
          <option value="Approved">Approved</option>
          <option value="Rejected">Rejected</option>
          <option value="Issued">Issued</option>
        </select>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-5 flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <AlertCircle size={18} />
          {error}
        </div>
      )}

      {/* Requests Table */}
      <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-left">
            <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500">
              <tr>
                <th className="px-5 py-4">Request ID</th>
                <th className="px-5 py-4">Student</th>
                <th className="px-5 py-4">Book</th>
                <th className="px-5 py-4">Request Date</th>
                <th className="px-5 py-4">Status</th>
                <th className="px-5 py-4 text-center">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-slate-500">
                    Loading book requests...
                  </td>
                </tr>
              ) : filteredRequests.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-slate-500">
                    No book requests found.
                  </td>
                </tr>
              ) : (
                filteredRequests.map((request) => (
                  <tr
                    key={request.request_id}
                    className="transition hover:bg-slate-50"
                  >
                    <td className="px-5 py-4 text-sm text-slate-500">
                      #{request.request_id}
                    </td>

                    <td className="px-5 py-4">
                      <p className="text-sm font-semibold text-slate-800">
                        {request.student_name}
                      </p>
                      <p className="text-xs text-slate-500">
                        {request.roll_number}
                      </p>
                    </td>

                    <td className="px-5 py-4 text-sm font-medium text-slate-800">
                      {request.title}
                    </td>

                    <td className="px-5 py-4 text-sm text-slate-600">
                      {request.request_date
                        ? String(request.request_date).slice(0, 10)
                        : "—"}
                    </td>

                    <td className="px-5 py-4">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${getStatusStyle(request.status)}`}
                      >
                        {request.status}
                      </span>
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex justify-center gap-2">
                        {request.status === "Pending" && (
                          <>
                            <button
                              disabled={processingId === request.request_id}
                              onClick={() => handleAction(request, "approve")}
                              className="rounded-lg bg-green-50 px-3 py-2 text-xs font-semibold text-green-700 hover:bg-green-100 disabled:opacity-50"
                            >
                              Approve
                            </button>

                            <button
                              disabled={processingId === request.request_id}
                              onClick={() => handleAction(request, "reject")}
                              className="rounded-lg bg-red-50 px-3 py-2 text-xs font-semibold text-red-700 hover:bg-red-100 disabled:opacity-50"
                            >
                              Reject
                            </button>
                          </>
                        )}

                        {request.status === "Approved" && (
                          <button
                            disabled={processingId === request.request_id}
                            onClick={() => handleAction(request, "issue")}
                            className="flex items-center gap-1 rounded-lg bg-blue-50 px-3 py-2 text-xs font-semibold text-blue-700 hover:bg-blue-100 disabled:opacity-50"
                          >
                            <BookOpen size={14} />
                            Issue Book
                          </button>
                        )}

                        {request.status === "Issued" && (
                          <span className="text-xs text-slate-400">
                            Book issued
                          </span>
                        )}

                        {request.status === "Rejected" && (
                          <span className="text-xs text-slate-400">
                            Request rejected
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="border-t border-slate-100 px-6 py-4 text-sm text-slate-500">
          Showing {filteredRequests.length} of {requests.length} requests
        </div>
      </div>
    </div>
  );
}
