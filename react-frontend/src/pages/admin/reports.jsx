
import { useEffect, useState } from "react";
import api from "../../services/api";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  LineChart,
  Line
} from "recharts";

import {
  BookOpen,
  Users,
  BookCheck,
  RotateCcw,
  AlertTriangle,
  Download,
  RefreshCw,
  ChartColumn
} from "lucide-react";

const COLORS = [
  "#3B82F6",
  "#8B5CF6",
  "#10B981",
  "#F59E0B",
  "#EF4444",
  "#06B6D4"
];

function StatCard({ title, value, icon: Icon, color }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-slate-500">{title}</p>
          <h2 className="text-3xl font-bold text-slate-800 mt-2">
            {Number(value || 0).toLocaleString()}
          </h2>
        </div>

        <div className={`p-3 rounded-xl ${color}`}>
          <Icon size={24} />
        </div>
      </div>
    </div>
  );
}

function ChartCard({ title, children }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
      <h3 className="font-semibold text-slate-800 mb-5">{title}</h3>
      {children}
    </div>
  );
}

export default function Reports() {
  const [summary, setSummary] = useState(null);
  const [monthly, setMonthly] = useState([]);
  const [popularBooks, setPopularBooks] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [activities, setActivities] = useState([]);
  const [categories, setCategories] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadReports = async () => {
    setLoading(true);
    setError("");

    try {
      const [
        summaryRes,
        monthlyRes,
        popularRes,
        departmentRes,
        activityRes,
        categoryRes
      ] = await Promise.all([
        api.get("/analytics/summary"),
        api.get("/analytics/monthly"),
        api.get("/analytics/popular-books"),
        api.get("/analytics/departments"),
        api.get("/analytics/recent-activities"),
        api.get("/analytics/books-by-category")
      ]);

      setSummary(summaryRes.data);
      setMonthly(Array.isArray(monthlyRes.data) ? monthlyRes.data : []);
      setPopularBooks(Array.isArray(popularRes.data) ? popularRes.data : []);
      setDepartments(Array.isArray(departmentRes.data) ? departmentRes.data : []);
      setActivities(Array.isArray(activityRes.data) ? activityRes.data : []);
      setCategories(Array.isArray(categoryRes.data) ? categoryRes.data : []);

    } catch (err) {
      console.error("Reports API Error:", err);

      setError(
        err.response?.data?.message ||
        "Unable to load reports. Please check your backend connection."
      );

    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReports();
  }, []);

  const downloadCSV = () => {
    const headers = [
      "Borrowing ID",
      "Student Name",
      "Roll Number",
      "Book Title",
      "Issue Date",
      "Due Date",
      "Status"
    ];

    const rows = activities.map((item) => [
      item.borrowing_id,
      item.student_name,
      item.roll_number,
      item.title,
      item.issue_date,
      item.due_date,
      item.status
    ]);

    const csv = [
      headers,
      ...rows
    ].map(row =>
      row.map(value =>
        `"${String(value ?? "").replace(/"/g, '""')}"`
      ).join(",")
    ).join("\n");

    const blob = new Blob(
      ["\uFEFF" + csv],
      { type: "text/csv;charset=utf-8;" }
    );

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "smart-library-report.csv";
    link.click();

    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <RefreshCw className="animate-spin mx-auto text-blue-600" size={32} />
          <p className="text-slate-500 mt-3">Loading reports...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="bg-red-50 border border-red-200 rounded-xl p-6">
          <p className="text-red-600 font-medium">{error}</p>

          <button
            onClick={loadReports}
            className="mt-4 bg-blue-600 text-white px-5 py-2 rounded-lg"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const books = summary?.books || {};
  const students = summary?.students || {};
  const borrowings = summary?.borrowings || {};

  const monthlyChartData = monthly.map(item => ({
    month: item.month,
    borrowings: Number(item.total_borrowings || 0)
  }));

  const popularChartData = popularBooks.map(item => ({
    title: item.title,
    count: Number(item.borrow_count || 0)
  }));

  const departmentChartData = departments.map(item => ({
    department: item.department || "Other",
    students: Number(item.total_students || 0)
  }));

  const categoryChartData = categories.map(item => ({
    name: item.category_name,
    value: Number(item.total_books || 0)
  }));

  return (
    <div className="p-6 md:p-8 space-y-7">

      {/* HEADER */}

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">

        <div>
          <div className="flex items-center gap-2">
            <ChartColumn className="text-blue-600" size={27} />
            <h1 className="text-2xl md:text-3xl font-bold text-slate-800">
              Library Reports
            </h1>
          </div>

          <p className="text-slate-500 mt-2">
            Analyze library performance and borrowing activities.
          </p>
        </div>

        <div className="flex gap-3 flex-wrap">

          <button
            onClick={loadReports}
            className="flex items-center gap-2 border border-slate-200 bg-white px-4 py-2.5 rounded-xl hover:bg-slate-50"
          >
            <RefreshCw size={17} />
            Refresh
          </button>

          <button
            onClick={downloadCSV}
            disabled={activities.length === 0}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-xl hover:bg-blue-700 disabled:opacity-50"
          >
            <Download size={17} />
            Export CSV
          </button>

        </div>
      </div>

      {/* STATISTICS */}

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-5">

        <StatCard
          title="Total Books"
          value={books.total_books}
          icon={BookOpen}
          color="bg-blue-100 text-blue-600"
        />

        <StatCard
          title="Total Students"
          value={students.total_students}
          icon={Users}
          color="bg-purple-100 text-purple-600"
        />

        <StatCard
          title="Books Issued"
          value={borrowings.issued_books}
          icon={BookCheck}
          color="bg-green-100 text-green-600"
        />

        <StatCard
          title="Books Returned"
          value={borrowings.returned_books}
          icon={RotateCcw}
          color="bg-cyan-100 text-cyan-600"
        />

        <StatCard
          title="Overdue Books"
          value={borrowings.overdue_books}
          icon={AlertTriangle}
          color="bg-red-100 text-red-600"
        />

      </div>

      {/* MONTHLY BORROWINGS */}

      <ChartCard title="Monthly Borrowing Trends">

        {monthlyChartData.length === 0 ? (
          <p className="text-center text-slate-400 py-16">
            No monthly borrowing data available.
          </p>
        ) : (
          <ResponsiveContainer width="100%" height={320}>
            <LineChart data={monthlyChartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
              <XAxis dataKey="month" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="borrowings"
                stroke="#2563EB"
                strokeWidth={3}
                dot={{ r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}

      </ChartCard>

      {/* CHART GRID */}

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">

        <ChartCard title="Most Borrowed Books">

          {popularChartData.length === 0 ? (
            <p className="text-center text-slate-400 py-16">
              No borrowing data available.
            </p>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={popularChartData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" allowDecimals={false} />
                <YAxis
                  type="category"
                  dataKey="title"
                  width={110}
                  tick={{ fontSize: 11 }}
                />
                <Tooltip />
                <Bar
                  dataKey="count"
                  fill="#6366F1"
                  radius={[0, 6, 6, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          )}

        </ChartCard>

        <ChartCard title="Books by Category">

          {categoryChartData.length === 0 ? (
            <p className="text-center text-slate-400 py-16">
              No category data available.
            </p>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={categoryChartData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={95}
                  label
                >
                  {categoryChartData.map((item, index) => (
                    <Cell
                      key={item.name}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          )}

        </ChartCard>

        <ChartCard title="Students by Department">

          {departmentChartData.length === 0 ? (
            <p className="text-center text-slate-400 py-16">
              No department data available.
            </p>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={departmentChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="department" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar
                  dataKey="students"
                  fill="#10B981"
                  radius={[6, 6, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          )}

        </ChartCard>

        <ChartCard title="Library Inventory">

          <div className="space-y-7 py-5">

            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm text-slate-600">
                  Available Books
                </span>
                <span className="font-semibold text-slate-800">
                  {Number(books.available_books || 0).toLocaleString()}
                </span>
              </div>

              <div className="w-full bg-slate-100 rounded-full h-3">
                <div
                  className="bg-blue-500 h-3 rounded-full"
                  style={{
                    width: `${
                      Number(books.total_books) > 0
                        ? Math.min(
                            100,
                            Number(books.available_books) /
                            Number(books.total_books) * 100
                          )
                        : 0
                    }%`
                  }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm text-slate-600">
                  Issued Books
                </span>
                <span className="font-semibold text-slate-800">
                  {Number(borrowings.issued_books || 0).toLocaleString()}
                </span>
              </div>

              <div className="w-full bg-slate-100 rounded-full h-3">
                <div
                  className="bg-green-500 h-3 rounded-full"
                  style={{
                    width: `${
                      Number(books.total_books) > 0
                        ? Math.min(
                            100,
                            Number(borrowings.issued_books) /
                            Number(books.total_books) * 100
                          )
                        : 0
                    }%`
                  }}
                />
              </div>
            </div>

            <div className="border-t border-slate-100 pt-5">
              <p className="text-sm text-slate-500">
                Total Borrowing Transactions
              </p>
              <h2 className="text-3xl font-bold text-slate-800 mt-2">
                {Number(borrowings.total_transactions || 0).toLocaleString()}
              </h2>
            </div>

          </div>

        </ChartCard>

      </div>

      {/* RECENT ACTIVITIES */}

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">

        <div className="p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h3 className="font-semibold text-slate-800">
              Recent Borrowing Activities
            </h3>
            <p className="text-sm text-slate-500 mt-1">
              Latest 10 library transactions
            </p>
          </div>

          <button
            onClick={downloadCSV}
            disabled={activities.length === 0}
            className="text-blue-600 text-sm font-medium hover:underline disabled:opacity-50"
          >
            Download report
          </button>
        </div>

        <div className="overflow-x-auto">

          <table className="w-full text-sm text-left">

            <thead className="bg-slate-50 text-slate-500">
              <tr>
                <th className="px-5 py-4">ID</th>
                <th className="px-5 py-4">Student</th>
                <th className="px-5 py-4">Book</th>
                <th className="px-5 py-4">Issue Date</th>
                <th className="px-5 py-4">Due Date</th>
                <th className="px-5 py-4">Status</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">

              {activities.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-10 text-slate-400">
                    No recent activities found.
                  </td>
                </tr>
              ) : (
                activities.map(item => (
                  <tr key={item.borrowing_id} className="hover:bg-slate-50">

                    <td className="px-5 py-4 font-medium">
                      #{item.borrowing_id}
                    </td>

                    <td className="px-5 py-4">
                      <p className="font-medium text-slate-800">
                        {item.student_name}
                      </p>
                      <p className="text-xs text-slate-400">
                        {item.roll_number}
                      </p>
                    </td>

                    <td className="px-5 py-4">
                      {item.title}
                    </td>

                    <td className="px-5 py-4 whitespace-nowrap">
                      {item.issue_date
                        ? String(item.issue_date).slice(0, 10)
                        : "—"}
                    </td>

                    <td className="px-5 py-4 whitespace-nowrap">
                      {item.due_date
                        ? String(item.due_date).slice(0, 10)
                        : "—"}
                    </td>

                    <td className="px-5 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        item.status === "Issued"
                          ? "bg-blue-100 text-blue-700"
                          : "bg-green-100 text-green-700"
                      }`}>
                        {item.status}
                      </span>
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
