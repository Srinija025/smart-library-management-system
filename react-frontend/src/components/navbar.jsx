
import { useEffect, useState } from "react";
import { Bell, UserCircle, BookOpen, RotateCcw } from "lucide-react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

export default function Navbar() {
  const navigate = useNavigate();

  const [isOpen, setIsOpen] = useState(false);
  const [bookRequests, setBookRequests] = useState([]);
  const [returnRequests, setReturnRequests] = useState([]);
  const [overdueNotifications, setOverdueNotifications] = useState([]);

  const fetchNotifications = async () => {
    try {
      const [bookResponse, returnResponse, overdueResponse] =
    await Promise.all([
        api.get("/borrowings/requests"),
        api.get("/borrowings/return-requests"),
        api.get("/borrowings/overdue-notifications")
    ]);
      setBookRequests(
        Array.isArray(bookResponse.data) ? bookResponse.data : []
      );

      setReturnRequests(
        Array.isArray(returnResponse.data) ? returnResponse.data : []
      );

      setOverdueNotifications(
    overdueResponse.data.notifications || []
);
    } catch (error) {
      console.error("Notification loading error:", error);
    }
  };

  useEffect(() => {
    fetchNotifications();

    const interval = setInterval(fetchNotifications, 30000);

    return () => clearInterval(interval);
  }, []);

  const pendingBooks = bookRequests.filter(
    (request) =>
      String(request.status).toLowerCase() === "pending"
  ).length;

  const pendingReturns = returnRequests.filter(
    (request) =>
      String(request.status).toLowerCase() === "pending"
  ).length;

  const overdueCount = overdueNotifications.length;

const totalNotifications =
    pendingBooks + pendingReturns + overdueCount;

  return (
    <header className="h-20 bg-white border-b border-slate-200 px-8 flex items-center justify-between">

      <div>
        <h2 className="text-xl font-bold text-slate-800">
          Admin Dashboard
        </h2>

        <p className="text-sm text-slate-500">
          Welcome back, Administrator
        </p>
      </div>

      <div className="flex items-center gap-5">

        {/* NOTIFICATION BELL */}
        <div className="relative">

          <button
            onClick={() => setIsOpen(!isOpen)}
            className="relative text-slate-600 hover:text-blue-600 transition"
            aria-label="Notifications"
          >
            <Bell size={23} />

            {totalNotifications > 0 && (
              <span className="absolute -top-2 -right-2 min-w-5 h-5 px-1 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                {totalNotifications > 99 ? "99+" : totalNotifications}
              </span>
            )}
          </button>

          {/* NOTIFICATION DROPDOWN */}
          {isOpen && (
            <div className="absolute right-0 top-12 w-80 bg-white rounded-xl shadow-xl border border-slate-200 z-50 overflow-hidden">

              <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                <h3 className="font-semibold text-slate-800">
                  Notifications
                </h3>

                <span className="text-xs text-slate-500">
                  {totalNotifications} pending
                </span>
              </div>

              <div className="p-3 space-y-2">

                <button
                  onClick={() => {
                    setIsOpen(false);
                    navigate("/admin/requests");
                  }}
                  className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-blue-50 text-left transition"
                >
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <BookOpen size={19} className="text-blue-600" />
                  </div>

                  <div className="flex-1">
                    <p className="text-sm font-medium text-slate-800">
                      Book Requests
                    </p>

                    <p className="text-xs text-slate-500">
                      Awaiting approval
                    </p>
                  </div>

                  <span className="text-sm font-bold text-blue-600">
                    {pendingBooks}
                  </span>
                </button>

                <button
                  onClick={() => {
                    setIsOpen(false);
                    navigate("/admin/returns");
                  }}
                  className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-purple-50 text-left transition"
                >
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <RotateCcw size={19} className="text-purple-600" />
                  </div>

                  <div className="flex-1">
                    <p className="text-sm font-medium text-slate-800">
                      Return Requests
                    </p>

                    <p className="text-xs text-slate-500">
                      Awaiting confirmation
                    </p>
                  </div>

                  <span className="text-sm font-bold text-purple-600">
                    {pendingReturns}
                  </span>
                </button>

                {totalNotifications === 0 && (
                  <p className="text-center text-sm text-slate-500 py-4">
                    No pending requests.
                  </p>
                )}

                
<button
    onClick={() => {
        setIsOpen(false);
        navigate("/admin/borrowings");
    }}
    className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-red-50 text-left transition"
>
    <div className="p-2 bg-red-100 rounded-lg">
        <BookOpen size={19} className="text-red-600" />
    </div>

    <div className="flex-1">
        <p className="text-sm font-medium text-slate-800">
            Overdue Books
        </p>

        <p className="text-xs text-slate-500">
            Books past their due date
        </p>
    </div>

    <span className="text-sm font-bold text-red-600">
        {overdueCount}
    </span>
</button>


              </div>

            </div>
          )}

        </div>

        {/* ADMIN PROFILE */}
        <div className="flex items-center gap-2">
          <UserCircle size={35} className="text-blue-600" />

          <div>
            <p className="text-sm font-semibold text-slate-800">
              {sessionStorage.getItem("adminName") || "Admin"}
            </p>

            <p className="text-xs text-slate-500">
              Administrator
            </p>
          </div>
        </div>

      </div>
    </header>
  );
}
