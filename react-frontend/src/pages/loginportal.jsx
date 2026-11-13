
import { Link } from "react-router-dom";
import { BookOpen, ShieldCheck, GraduationCap, ArrowRight } from "lucide-react";

export default function LoginPortal() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 flex items-center justify-center p-6">

            <div className="w-full max-w-4xl">

                <div className="text-center mb-12">
                    <div className="inline-flex items-center justify-center bg-blue-500/20 p-4 rounded-2xl mb-5">
                        <BookOpen size={45} className="text-blue-300" />
                    </div>

                    <h1 className="text-4xl md:text-5xl font-bold text-white">
                        Smart Library
                    </h1>

                    <p className="text-slate-300 mt-4 text-lg">
                        Library Management System
                    </p>

                    <p className="text-slate-400 mt-2">
                        Select your portal to continue
                    </p>
                </div>

                <div className="grid md:grid-cols-2 gap-7">

                    <Link
                        to="/admin/login"
                        className="group bg-white rounded-3xl p-9 shadow-xl hover:-translate-y-2 transition duration-300"
                    >
                        <div className="bg-blue-100 w-16 h-16 rounded-2xl flex items-center justify-center mb-6">
                            <ShieldCheck size={34} className="text-blue-600" />
                        </div>

                        <h2 className="text-2xl font-bold text-slate-800">
                            Admin Portal
                        </h2>

                        <p className="text-slate-500 mt-3 leading-relaxed">
                            Manage books, students, borrowing requests,
                            returns and library reports.
                        </p>

                        <div className="flex items-center gap-2 text-blue-600 font-semibold mt-8">
                            Admin Login
                            <ArrowRight size={19} className="group-hover:translate-x-2 transition" />
                        </div>
                    </Link>

                    <Link
                        to="/student/login"
                        className="group bg-white rounded-3xl p-9 shadow-xl hover:-translate-y-2 transition duration-300"
                    >
                        <div className="bg-emerald-100 w-16 h-16 rounded-2xl flex items-center justify-center mb-6">
                            <GraduationCap size={34} className="text-emerald-600" />
                        </div>

                        <h2 className="text-2xl font-bold text-slate-800">
                            Student Portal
                        </h2>

                        <p className="text-slate-500 mt-3 leading-relaxed">
                            Browse books, request books, view issued books
                            and check your borrowing history.
                        </p>

                        <div className="flex items-center gap-2 text-emerald-600 font-semibold mt-8">
                            Student Login
                            <ArrowRight size={19} className="group-hover:translate-x-2 transition" />
                        </div>
                    </Link>

                </div>

                <p className="text-center text-slate-400 text-sm mt-10">
                    © 2026 Smart Library Management System
                </p>

            </div>
        </div>
    );
}
