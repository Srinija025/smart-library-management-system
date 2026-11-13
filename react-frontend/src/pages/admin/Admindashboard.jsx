import { useEffect, useState } from "react";
import api from "../../services/api";
import {
  BookOpen,
  Users,
  BookCheck,
  Clock,
  AlertCircle
} from "lucide-react";

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
  Cell
} from "recharts";







const COLORS = [
  "#2563eb", // Blue
  "#8b5cf6", // Purple
  "#10b981", // Green
  "#f59e0b", // Orange
  "#ef4444", // Red
  "#06b6d4", // Cyan
  "#ec4899", // Pink
  "#84cc16", // Lime
  "#6366f1", // Indigo
  "#d946ef", // Magenta
  "#14b8a6", // Teal
  "#a16207"  // Brown
];
export default function AdminDashboard() {
    const [books, setBooks] = useState([]);
const [loading, setLoading] = useState(true);
const [error, setError] = useState("");

const [students, setStudents] = useState([]);
const [studentsLoading, setStudentsLoading] = useState(true);
const [studentsError, setStudentsError] = useState("");

const [borrowings, setBorrowings] = useState([]);
const [borrowingsLoading, setBorrowingsLoading] = useState(true);
const [borrowingsError, setBorrowingsError] = useState("");

const [requests, setRequests] = useState([]);
const [requestsLoading, setRequestsLoading] = useState(true);
const [requestsError, setRequestsError] = useState("");

useEffect(() => {
  const fetchBooks = async () => {
    try {
      const response = await api.get("/books");

      console.log("Books API Response:", response.data);

      const data = response.data;

      setBooks(
        Array.isArray(data)
          ? data
          : data.books || data.data || []
      );

    } catch (err) {
      console.error("Books API Error:", err);

      setError(
        err.response?.data?.message ||
        "Unable to load books"
      );

    } finally {
      setLoading(false);
    }
  };

  fetchBooks();
}, []);


  // STUDENTS API
  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const response = await api.get("/students");

        console.log("Students API Response:", response.data);

        const data = response.data;

        setStudents(
          Array.isArray(data)
            ? data
            : data.students || data.data || []
        );

      } catch (err) {
        console.error("Students API Error:", err);

        setStudentsError(
          err.response?.data?.message ||
          "Unable to load students"
        );

      } finally {
        setStudentsLoading(false);
      }
    };

    fetchStudents();
  }, []);


// BORROWINGS API
useEffect(() => {
  const fetchBorrowings = async () => {
    try {
      const response = await api.get("/borrowings");

      console.log("Borrowings API Response:", response.data);

      const data = response.data;

      setBorrowings(
        Array.isArray(data)
          ? data
          : data.borrowings || data.data || []
      );

    } catch (err) {
      console.error("Borrowings API Error:", err);

      setBorrowingsError(
        err.response?.data?.message ||
        "Unable to load borrowings"
      );

    } finally {
      setBorrowingsLoading(false);
    }
  };

  fetchBorrowings();
}, []);

// BOOK REQUESTS API
useEffect(() => {
  const fetchRequests = async () => {
    try {
      const response = await api.get("/borrowings/requests");

      console.log("Book Requests API Response:", response.data);

      setRequests(
        Array.isArray(response.data) ? response.data : []
      );

    } catch (err) {
      console.error("Book Requests API Error:", err);

      setRequestsError(
        err.response?.data?.message ||
        "Unable to load book requests"
      );

    } finally {
      setRequestsLoading(false);
    }
  };

  fetchRequests();
}, []);

// Calculate currently issued books
const issuedBooksCount = borrowings.filter(
  (borrowing) =>
    String(borrowing.status).toLowerCase() === "issued"
).length;


// Calculate overdue books
const today = new Date();
today.setHours(0, 0, 0, 0);

const overdueBooksCount = borrowings.filter((borrowing) => {
  const dueDate = new Date(borrowing.due_date);

  return (
    String(borrowing.status).toLowerCase() === "issued" &&
    !isNaN(dueDate.getTime()) &&
    dueDate < today
  );
}).length;

// Calculate monthly issued books
const monthlyData = Array.from({ length: 12 }, (_, index) => {
  const count = borrowings.filter((borrowing) => {
    if (!borrowing.issue_date) return false;

    const date = new Date(borrowing.issue_date);

    return (
      !isNaN(date.getTime()) &&
      date.getFullYear() === new Date().getFullYear() &&
      date.getMonth() === index
    );
  }).length;

  return {
    month: new Date(2000, index).toLocaleString("en-US", {
      month: "short"
    }),
    books: count
  };
});

// Calculate books by category
const categoryCounts = books.reduce((acc, book) => {
  const category = book.category_name || "Uncategorized";

  acc[category] = (acc[category] || 0) + 1;

  return acc;
}, {});

const categoryData = Object.entries(categoryCounts).map(
  ([name, value]) => ({
    name,
    value
  })
);

const pendingRequestsCount = requests.filter(
  (request) =>
    String(request.status).toLowerCase() === "pending"
).length;

const stats = [
  {
    title: "Total Books",
    value: loading ? "..." : error ? "—" : books.length.toLocaleString(),
    icon: BookOpen,
    color: "bg-blue-100 text-blue-600"
  },
  {
    title: "Total Students",
    value: studentsLoading
      ? "..."
      : studentsError
      ? "—"
      : students.length.toLocaleString(),
    icon: Users,
    color: "bg-purple-100 text-purple-600"
  },
  {
    title: "Books Issued",
    value: borrowingsLoading
      ? "..."
      : borrowingsError
      ? "—"
      : issuedBooksCount.toLocaleString(),
    icon: BookCheck,
    color: "bg-green-100 text-green-600"
  },
  {
  title: "Pending Requests",
  value: requestsLoading
    ? "..."
    : requestsError
    ? "—"
    : pendingRequestsCount.toLocaleString(),
  icon: Clock,
  color: "bg-orange-100 text-orange-600"
},
  {
    title: "Overdue Books",
    value: borrowingsLoading
      ? "..."
      : borrowingsError
      ? "—"
      : overdueBooksCount.toLocaleString(),
    icon: AlertCircle,
    color: "bg-red-100 text-red-600"
  }
];

  return (
    <div className="p-8 space-y-8">
        


     
<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
  <div>
    <h1 className="text-3xl font-bold tracking-tight text-slate-800">
      Dashboard Overview
    </h1>
    <p className="text-slate-500 mt-2">
      Welcome back! Here's what's happening in your library.
    </p>
  </div>

  <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-4 py-3 shadow-sm">
    <span className="w-2.5 h-2.5 rounded-full bg-green-500"></span>
    <span className="text-sm font-medium text-slate-600">
      System Online
    </span>
  </div>
</div>


      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-5">

        {stats.map((stat) => {
          const Icon = stat.icon;

          return (
            <div
              key={stat.title}
              className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
            >
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm text-slate-500">
                    {stat.title}
                  </p>
                  <h2 className="text-3xl font-bold text-slate-800 mt-3">
                    {stat.value}
                  </h2>
                </div>

                <div className={`p-4 rounded-xl ${stat.color}`}>
                  <Icon size={25} />
                </div>
              </div>
            </div>
          );
        })}

      </div>

      
<div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1.8fr)_minmax(320px,1fr)] gap-6 w-full">

  {/* Monthly Books Issued */}
  <div className="min-w-0 bg-white p-6 rounded-2xl shadow-sm border border-slate-200">

    <div className="flex justify-between items-center mb-6">
      <div>
        <h3 className="text-lg font-bold text-slate-800">
          Monthly Books Issued
        </h3>
        <p className="text-sm text-slate-500 mt-1">
          Monthly borrowing activity
        </p>
      </div>
      <div className="bg-blue-50 text-blue-600 px-3 py-1 rounded-lg text-sm font-medium">
        This Year
      </div>
    </div>

    <div className="h-80 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={monthlyData}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
          <XAxis
            dataKey="month"
            axisLine={false}
            tickLine={false}
            tick={{ fill: "#64748b", fontSize: 12 }}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            allowDecimals={false}
            tick={{ fill: "#64748b", fontSize: 12 }}
          />
          <Tooltip />
          <Bar
            dataKey="books"
            name="Books Issued"
            fill="#2563eb"
            radius={[8, 8, 0, 0]}
            barSize={28}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  </div>

  {/* Book Categories */}
  <div className="min-w-0 bg-white p-6 rounded-2xl shadow-sm border border-slate-200">

    <h3 className="text-lg font-bold text-slate-800">
      Book Categories
    </h3>
    <p className="text-sm text-slate-500 mt-1">
      Distribution of books by category
    </p>

    <div className="h-64 w-full mt-4">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={categoryData}
            dataKey="value"
            nameKey="name"
            innerRadius={65}
            outerRadius={100}
            paddingAngle={4}
          >
            {categoryData.map((entry, index) => (
              <Cell
                key={entry.name}
                fill={COLORS[index % COLORS.length]}
              />
            ))}
          </Pie>
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>
    </div>

    <div className="space-y-3 mt-4">
      {categoryData.map((item, index) => (
        <div
          key={item.name}
          className="flex items-center justify-between gap-3 text-sm"
        >
          <div className="flex items-center gap-2 min-w-0">
            <span
              className="w-3 h-3 rounded-full shrink-0"
              style={{
                backgroundColor: COLORS[index % COLORS.length]
              }}
            />
            <span className="text-slate-600 truncate">
              {item.name}
            </span>
          </div>

          <span className="font-semibold text-slate-800 whitespace-nowrap">
            {item.value} {item.value === 1 ? "book" : "books"}
          </span>
        </div>
      ))}
    </div>

  </div>
</div>
</div>
  );
}

