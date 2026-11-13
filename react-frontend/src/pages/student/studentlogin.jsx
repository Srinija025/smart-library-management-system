
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { BookOpen, Mail, Lock, Eye, EyeOff } from "lucide-react";
import studentApi from "../../services/studentapi";

export default function StudentLogin() {

    const navigate = useNavigate();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleLogin = async (e) => {

        e.preventDefault();
        setError("");

        try {

            setLoading(true);

            const response = await studentApi.post(
    "/student-auth/login",
                {
                    email,
                    password
                }
            );

            const token =
                response.data.token ||
                response.data.studentToken;

            if (!token) {
                throw new Error("Student token was not returned by the server.");
            }

            sessionStorage.setItem("studentToken", token);

            const student =
                response.data.student ||
                response.data.user ||
                {};

            sessionStorage.setItem(
                "studentName",
                student.student_name || student.name || "Student"
            );

            navigate("/student/dashboard");

        } catch (err) {

            setError(
                err.response?.data?.message ||
                err.message ||
                "Login failed. Please check your credentials."
            );

        } finally {

            setLoading(false);

        }
    };

    return (

        <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">

            <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8">

                <div className="text-center mb-8">

                    <div className="inline-flex items-center justify-center bg-blue-100 p-4 rounded-2xl mb-4">
                        <BookOpen size={35} className="text-blue-600" />
                    </div>

                    <h1 className="text-3xl font-bold text-slate-800">
                        Student Login
                    </h1>

                    <p className="text-slate-500 mt-2">
                        Welcome back to Smart Library
                    </p>

                </div>

                <form onSubmit={handleLogin} className="space-y-5">

                    <div>

                        <label className="block text-sm font-medium text-slate-700 mb-2">
                            Email Address
                        </label>

                        <div className="relative">

                            <Mail
                                size={19}
                                className="absolute left-3 top-3.5 text-slate-400"
                            />

                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="Enter your email"
                                required
                                className="w-full border border-slate-300 rounded-xl pl-10 pr-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
                            />

                        </div>

                    </div>

                    <div>

                        <label className="block text-sm font-medium text-slate-700 mb-2">
                            Password
                        </label>

                        <div className="relative">

                            <Lock
                                size={19}
                                className="absolute left-3 top-3.5 text-slate-400"
                            />

                            <input
                                type={showPassword ? "text" : "password"}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Enter your password"
                                required
                                className="w-full border border-slate-300 rounded-xl pl-10 pr-12 py-3 outline-none focus:ring-2 focus:ring-blue-500"
                            />

                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-3.5 text-slate-400"
                            >
                                {showPassword ? <EyeOff size={19} /> : <Eye size={19} />}
                            </button>

                        </div>

                    </div>

                    {error && (
                        <p className="text-sm text-red-600 bg-red-50 p-3 rounded-lg">
                            {error}
                        </p>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl transition disabled:opacity-60"
                    >
                        {loading ? "Logging in..." : "Login"}
                    </button>

                </form>

                <p className="text-center text-sm text-slate-500 mt-6">
                    Don't have an account?{" "}
                    <button
    type="button"
    onClick={() => navigate("/student/register")}
    className="text-blue-600 font-semibold hover:underline"
>
    Register
</button>
                </p>

            </div>

        </div>

    );
}
