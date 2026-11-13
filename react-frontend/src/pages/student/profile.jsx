
import { useEffect, useState } from "react";
import studentApi from "../../services/studentapi";

function Profile() {
    const [student, setStudent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await studentApi.get("/student/me");
            setStudent(response.data);
        } catch (err) {
            console.error("Profile loading error:", err);
            setError(
                err.response?.data?.message ||
                "Unable to load student profile."
            );
        } finally {
            setLoading(false);
        }
    };

    const profileFields = [
        { label: "Student ID", value: student?.student_id },
        { label: "Student Name", value: student?.student_name },
        { label: "Roll Number", value: student?.roll_number },
        { label: "Email Address", value: student?.email },
        { label: "Department", value: student?.department },
        { label: "Academic Year", value: student?.academic_year }
    ];

    if (loading) {
        return (
            <div className="p-8 text-center text-gray-500">
                Loading profile...
            </div>
        );
    }

    if (error) {
        return (
            <div className="m-6 rounded-xl bg-red-50 p-5 text-red-600">
                {error}
                <button
                    onClick={fetchProfile}
                    className="ml-3 font-semibold underline"
                >
                    Retry
                </button>
            </div>
        );
    }

    return (
        <div className="p-6 md:p-8">
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-gray-800">
                    My Profile
                </h1>
                <p className="mt-1 text-gray-500">
                    View your student account information.
                </p>
            </div>

            <div className="max-w-3xl rounded-2xl border border-gray-200 bg-white p-6 shadow-sm md:p-8">
                <div className="mb-8 flex items-center gap-4 border-b border-gray-100 pb-6">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-indigo-100 text-2xl font-bold text-indigo-700">
                        {student?.student_name?.charAt(0)?.toUpperCase() || "S"}
                    </div>

                    <div>
                        <h2 className="text-xl font-bold text-gray-800">
                            {student?.student_name || "Student"}
                        </h2>
                        <p className="text-sm text-gray-500">
                            Student Account
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    {profileFields.map((field) => (
                        <div key={field.label}>
                            <p className="mb-2 text-sm font-medium text-gray-500">
                                {field.label}
                            </p>
                            <p className="rounded-lg bg-gray-50 px-4 py-3 font-semibold text-gray-800">
                                {field.value || "Not available"}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default Profile;
