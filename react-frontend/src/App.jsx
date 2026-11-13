
import { BrowserRouter, Routes, Route, Navigate, Outlet } from "react-router-dom";

import AdminLogin from "./pages/admin/adminlogin";
import AdminDashboard from "./pages/admin/Admindashboard";
import Books from "./pages/admin/books";

import Sidebar from "./components/sidebar";
import Navbar from "./components/navbar";

import Students from "./pages/admin/students";

import Categories from "./pages/admin/categories";

import Borrowings from "./pages/admin/borrowings";

import BookRequests from "./pages/admin/bookrequests";
import ReturnRequests from "./pages/admin/returnrequests";
import Reports from "./pages/admin/reports";
import Settings from "./pages/admin/settings";


import StudentLogin from "./pages/student/studentlogin";
import StudentLayout from "./layouts/studentlayout";
import StudentDashboard from "./pages/student/studentdashboard";
import BrowseBooks from "./pages/student/browsebooks";
import MyRequests from "./pages/student/myrequests";
import IssuedBooks from "./pages/student/issuedbooks";
import BorrowingHistory from "./pages/student/borrowinghistory";
import Notifications from "./pages/student/notifications";
import Profile from "./pages/student/profile";
import StudentRegister from "./pages/student/studentregister";

import LoginPortal from "./pages/loginportal";

function AdminLayout() {
  const token = sessionStorage.getItem("adminToken");

  if (!token) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />

      <div className="flex-1 min-w-0">
        <Navbar />

        <main>
          <Outlet />
        </main>
      </div>
    </div>
  );
}

function ProtectedStudentLayout() {
    const token = sessionStorage.getItem("studentToken");

    if (!token) {
        return <Navigate to="/student/login" replace />;
    }

    return <StudentLayout />;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LoginPortal />} />

<Route path="/admin/login" element={<AdminLogin />} />
        {/* STUDENT LOGIN */}
<Route
    path="/student/login"
    element={<StudentLogin />}
/>
<Route
    path="/student/register"
    element={<StudentRegister />}
/>


{/* STUDENT DASHBOARD */}
<Route path="/student" element={<ProtectedStudentLayout />}>
    <Route
        path="dashboard"
        element={<StudentDashboard />}
    />

    <Route
        path="browse"
        element={<BrowseBooks />}
    />

    <Route
        path="requests"
        element={<MyRequests />}
    />

    <Route
        path="issued"
        element={<IssuedBooks />}
    />
    <Route
    path="history"
    element={<BorrowingHistory />}
/>
    <Route
    path="notifications"
    element={<Notifications />}
/>
    <Route path="profile" element={<Profile />} />
    

</Route>

        <Route path="/admin" element={<AdminLayout />}>
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="books" element={<Books />} />
          <Route path="students" element={<Students />} />
          <Route path="categories" element={<Categories />} />
          <Route path="borrowings" element={<Borrowings />} />
          <Route path="requests" element={<BookRequests />} />
          <Route path="returns" element={<ReturnRequests />} />
          <Route path="reports" element={<Reports />} />
          <Route path="settings" element={<Settings />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
