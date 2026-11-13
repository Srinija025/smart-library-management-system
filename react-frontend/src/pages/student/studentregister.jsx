
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { BookOpen, Mail, Lock, Hash } from "lucide-react";
import studentApi from "../../services/studentApi";

export default function StudentRegister() {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        email: "",
        roll_number: "",
        password: "",
        confirmPassword: ""
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        setError("");
        setSuccess("");

        if (formData.password.length < 8) {
            setError("Password must contain at least 8 characters.");
            return;
        }

        if (formData.password !== formData.confirmPassword) {
            setError("Passwords do not match.");
            return;
        }

        try {
            setLoading(true);

            await studentApi.post("/student-auth/register", {
                email: formData.email,
                roll_number: formData.roll_number,
                password: formData.password
            });

            setSuccess("Registration successful! Redirecting to login...");

            setTimeout(() => {
                navigate("/student/login");
            }, 1500);

        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Registration failed. Please check your details."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
            <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl">

                <div className="mb-8 text-center">
                    <div className="mb-4 inline-flex rounded-2xl bg-blue-100 p-4">
                        <BookOpen size={35} className="text-blue-600" />
                    </div>

                    <h1 className="text-3xl font-bold text-slate-800">
                        Student Registration
                    </h1>

                    <p className="mt-2 text-slate-500">
                        Create your Smart Library account
                    </p>
                </div>

                <form onSubmit={handleRegister} className="space-y-5">

                    <div>
                        <label className="mb-2 block text-sm font-medium text-slate-700">
                            Email Address
                        </label>

                        <div className="relative">
                            <Mail size={19} className="absolute left-3 top-3.5 text-slate-400" />

                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                placeholder="Enter your registered email"
                                required
                                className="w-full rounded-xl border border-slate-300 py-3 pl-10 pr-4 outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="mb-2 block text-sm font-medium text-slate-700">
                            Roll Number
                        </label>

                        <div className="relative">
                            <Hash size={19} className="absolute left-3 top-3.5 text-slate-400" />

                            <input
                                type="text"
                                name="roll_number"
                                value={formData.roll_number}
                                onChange={handleChange}
                                placeholder="Enter your roll number"
                                required
                                className="w-full rounded-xl border border-slate-300 py-3 pl-10 pr-4 outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="mb-2 block text-sm font-medium text-slate-700">
                            Password
                        </label>

                        <div className="relative">
                            <Lock size={19} className="absolute left-3 top-3.5 text-slate-400" />

                            <input
                                type="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                placeholder="Create a password"
                                minLength={8}
                                required
                                className="w-full rounded-xl border border-slate-300 py-3 pl-10 pr-4 outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="mb-2 block text-sm font-medium text-slate-700">
                            Confirm Password
                        </label>

                        <div className="relative">
                            <Lock size={19} className="absolute left-3 top-3.5 text-slate-400" />

                            <input
                                type="password"
                                name="confirmPassword"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                placeholder="Confirm your password"
                                required
                                className="w-full rounded-xl border border-slate-300 py-3 pl-10 pr-4 outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                    </div>

                    {error && (
                        <p className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
                            {error}
                        </p>
                    )}

                    {success && (
                        <p className="rounded-lg bg-green-50 p-3 text-sm text-green-700">
                            {success}
                        </p>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full rounded-xl bg-blue-600 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:opacity-60"
                    >
                        {loading ? "Registering..." : "Create Account"}
                    </button>
                </form>

                <p className="mt-6 text-center text-sm text-slate-500">
                    Already have an account?{" "}
                    <Link
                        to="/student/login"
                        className="font-semibold text-blue-600 hover:underline"
                    >
                        Login
                    </Link>
                </p>

            </div>
        </div>
    );
}
