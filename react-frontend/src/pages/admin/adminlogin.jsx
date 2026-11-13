
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { LibraryBig, Mail, Lock, Eye, EyeOff } from "lucide-react";

export default function AdminLogin() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState("");

  
const handleSubmit = async (e) => {
  e.preventDefault();

  setMessage("");

  try {
    const response = await fetch(
      "http://localhost:5000/api/auth/login",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          email,
          password
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Login failed");
    }

    // Store admin authentication details
    sessionStorage.setItem("adminToken", data.token);

    sessionStorage.setItem(
      "adminName",
      data.admin.admin_name
    );

    // Redirect to React admin dashboard
    navigate("/admin/dashboard");

  } catch (error) {
    setMessage(error.message);
  }
};

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-blue-950 to-blue-800 p-5">

      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-8">

        <div className="text-center mb-8">

          <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <LibraryBig size={34} />
          </div>

          <h1 className="text-2xl font-bold text-slate-800">
            Smart Library
          </h1>

          <p className="text-slate-500 mt-2">
            Administrator Portal
          </p>

        </div>

        <h2 className="text-xl font-bold text-slate-800">
          Welcome Back!
        </h2>

        <p className="text-sm text-slate-500 mt-1 mb-6">
          Sign in to manage your library.
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Email Address
            </label>

            <div className="relative">
              <Mail className="absolute left-3 top-3 text-slate-400" size={19} />

              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@example.com"
                className="w-full border border-slate-200 rounded-xl py-3 pl-11 pr-4 outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Password
            </label>

            <div className="relative">
              <Lock className="absolute left-3 top-3 text-slate-400" size={19} />

              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="w-full border border-slate-200 rounded-xl py-3 pl-11 pr-12 outline-none focus:ring-2 focus:ring-blue-500"
                required
              />

              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-slate-400"
              >
                {showPassword ? <EyeOff size={19} /> : <Eye size={19} />}
              </button>
            </div>
          </div>

          {message && (
            <p className="text-sm text-blue-600">{message}</p>
          )}

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl transition"
          >
            Sign In
          </button>

        </form>

        <p className="text-center text-xs text-slate-400 mt-8">
          Smart Library Management System
        </p>

      </div>
    </div>
  );
}
