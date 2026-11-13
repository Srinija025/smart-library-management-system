
import { useEffect, useMemo, useState } from "react";
import {
  RotateCcw,
  Search,
  RefreshCw,
  CheckCircle,
  Clock,
  BookOpen,
  User,
  CalendarDays
} from "lucide-react";
import api from "../../services/api";

export default function ReturnRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [confirmingId, setConfirmingId] = useState(null);

  const loadRequests = async () => {
    try {
      setError("");
      setLoading(true);

      const response = await api.get("/borrowings/return-requests");
      setRequests(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Unable to load return requests."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRequests();
  }, []);

  const filteredRequests = useMemo(() => {
    return requests.filter((request) => {
      const text = search.toLowerCase();

      const matchesSearch = [
        request.student_name,
        request.roll_number,
        request.title,
        request.author,
        String(request.return_request_id)
      ].some((value) =>
        String(value || "").toLowerCase().includes(text)
      );

      const matchesFilter =
        filter === "All" || request.status === filter;

      return matchesSearch && matchesFilter;
    });
  }, [requests, search, filter]);

  const pendingCount = requests.filter(
    (r) => r.status === "Pending"
  ).length;

  const confirmedCount = requests.filter(
    (r) => r.status === "Confirmed"
  ).length;

  const confirmReturn = async (request) => {
    const accepted = window.confirm(
      `Confirm that you have received "${request.title}" from ${request.student_name}?`
    );

    if (!accepted) return;

    try {
      setConfirmingId(request.return_request_id);

      const response = await api.patch(
        `/borrowings/return-requests/${request.return_request_id}/confirm`
      );

      alert(
        response.data.message || "Book return confirmed successfully."
      );

      await loadRequests();
    } catch (err) {
      alert(
        err.response?.data?.message ||
        "Unable to confirm this return."
      );
    } finally {
      setConfirmingId(null);
    }
  };

  const stats = [
    {
      title: "Total Requests",
      value: requests.length,
      icon: RotateCcw,
      color: "bg-blue-100 text-blue-600"
    },
    {
      title: "Pending Requests",
      value: pendingCount,
      icon: Clock,
      color: "bg-amber-100 text-amber-600"
    },
    {
      title: "Confirmed Returns",
      value: confirmedCount,
      icon: CheckCircle,
      color: "bg-emerald-100 text-emerald-600"
    }
  ];

  const statusStyle = (status) => {
    if (status === "Confirmed") {
      return "bg-emerald-100 text-emerald-700";
    }

    return "bg-amber-100 text-amber-700";
  };

  return (
    <div className="p-5 md:p-8 space-y-7">

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-800">
            Return Requests
          </h1>
          <p className="text-slate-500 mt-1">
            Review and confirm books returned by students.
          </p>
        </div>

        <button
          onClick={loadRequests}
          disabled={loading}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-60"
        >
          <RefreshCw size={17} />
          Refresh
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
        {stats.map((stat) => {
          const Icon = stat.icon;

          return (
            <div
              key={stat.title}
              className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 flex items-center gap-4"
            >
              <div className={`p-3 rounded-xl ${stat.color}`}>
                <Icon size={25} />
              </div>

              <div>
                <p className="text-sm text-slate-500">
                  {stat.title}
                </p>
                <h2 className="text-2xl font-bold text-slate-800">
                  {stat.value}
                </h2>
              </div>
            </div>
          );
        })}
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">

        <div className="flex flex-col lg:flex-row gap-4 justify-between mb-5">

          <div className="relative w-full lg:max-w-sm">
            <Search
              size={18}
              className="absolute left-3 top-3 text-slate-400"
            />

            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search student, roll number or book..."
              className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-200"
            />
          </div>

          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-4 py-2.5 border border-slate-200 rounded-xl outline-none"
          >
            <option value="All">All Requests</option>
            <option value="Pending">Pending</option>
            <option value="Confirmed">Confirmed</option>
          </select>

        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-50 text-red-600 text-sm">
            {error}
          </div>
        )}

        <div className="overflow-x-auto">

          <table className="w-full min-w-[850px] text-left">

            <thead>
              <tr className="border-b border-slate-200 text-slate-500 text-sm">
                <th className="p-4">Request ID</th>
                <th className="p-4">Student</th>
                <th className="p-4">Book</th>
                <th className="p-4">Issue Date</th>
                <th className="p-4">Due Date</th>
                <th className="p-4">Request Date</th>
                <th className="p-4">Status</th>
                <th className="p-4">Action</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="8" className="p-8 text-center text-slate-500">
                    Loading return requests...
                  </td>
                </tr>
              ) : filteredRequests.length === 0 ? (
                <tr>
                  <td colSpan="8" className="p-8 text-center text-slate-500">
                    No return requests found.
                  </td>
                </tr>
              ) : (
                filteredRequests.map((request) => (
                  <tr
                    key={request.return_request_id}
                    className="border-b border-slate-100 hover:bg-slate-50"
                  >
                    <td className="p-4 font-semibold text-slate-700">
                      #{request.return_request_id}
                    </td>

                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <User size={17} className="text-slate-400" />
                        <div>
                          <p className="font-medium text-slate-800">
                            {request.student_name}
                          </p>
                          <p className="text-xs text-slate-500">
                            {request.roll_number}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <BookOpen size={17} className="text-indigo-500" />
                        <div>
                          <p className="font-medium text-slate-800">
                            {request.title}
                          </p>
                          <p className="text-xs text-slate-500">
                            {request.author}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="p-4 text-sm text-slate-600">
                      {request.issue_date || "—"}
                    </td>

                    <td className="p-4 text-sm text-slate-600">
                      {request.due_date || "—"}
                    </td>

                    <td className="p-4 text-sm text-slate-600">
                      <span className="inline-flex items-center gap-1">
                        <CalendarDays size={14} />
                        {request.request_date
                          ? String(request.request_date).slice(0, 10)
                          : "—"}
                      </span>
                    </td>

                    <td className="p-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusStyle(request.status)}`}>
                        {request.status}
                      </span>
                    </td>

                    <td className="p-4">
                      {request.status === "Pending" ? (
                        <button
                          onClick={() => confirmReturn(request)}
                          disabled={confirmingId === request.return_request_id}
                          className="px-3 py-2 rounded-lg bg-emerald-600 text-white text-sm hover:bg-emerald-700 disabled:opacity-60"
                        >
                          {confirmingId === request.return_request_id
                            ? "Confirming..."
                            : "Confirm Return"}
                        </button>
                      ) : (
                        <span className="text-sm text-emerald-600 font-medium">
                          Completed
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>

          </table>
        </div>
      </div>
    </div>
  );
}
