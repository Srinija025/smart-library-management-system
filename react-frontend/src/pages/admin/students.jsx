
import { useEffect, useMemo, useState } from "react";
import {
  Users,
  Search,
  RefreshCw,
  Plus,
  Pencil,
  Trash2,
  X
} from "lucide-react";
import api from "../../services/api";

const emptyForm = {
  student_name: "",
  roll_number: "",
  email: "",
  phone: "",
  department: "",
  academic_year: ""
};

export default function Students() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/students");

      setStudents(
        Array.isArray(response.data)
          ? response.data
          : response.data.students || response.data.data || []
      );
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load students.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const filteredStudents = useMemo(() => {
    return students.filter((student) =>
      [
        student.student_name,
        student.roll_number,
        student.email,
        student.department
      ].some((value) =>
        String(value || "").toLowerCase().includes(search.toLowerCase())
      )
    );
  }, [students, search]);

  const openAddModal = () => {
    setEditingId(null);
    setForm(emptyForm);
    setError("");
    setSuccess("");
    setShowModal(true);
  };

  const openEditModal = (student) => {
    setEditingId(student.student_id);

    setForm({
      student_name: student.student_name || "",
      roll_number: student.roll_number || "",
      email: student.email || "",
      phone: student.phone || "",
      department: student.department || "",
      academic_year: student.academic_year || ""
    });

    setError("");
    setSuccess("");
    setShowModal(true);
  };

  const closeModal = () => {
    if (saving) return;
    setShowModal(false);
    setEditingId(null);
    setForm(emptyForm);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((previous) => ({
      ...previous,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      student_name: form.student_name.trim(),
      roll_number: form.roll_number.trim(),
      email: form.email.trim(),
      phone: form.phone.trim(),
      department: form.department.trim(),
      academic_year: form.academic_year.trim()
    };

    if (
      !payload.student_name ||
      !payload.roll_number ||
      !payload.email ||
      !payload.department ||
      !payload.academic_year
    ) {
      setError("Please fill in all required fields.");
      return;
    }

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      if (editingId) {
        await api.put(`/students/${editingId}`, payload);
        setSuccess("Student updated successfully.");
      } else {
        await api.post("/students", payload);
        setSuccess("Student added successfully.");
      }

      setShowModal(false);
      setEditingId(null);
      setForm(emptyForm);

      await fetchStudents();
    } catch (err) {
      setError(
        err.response?.data?.message || "Unable to save student."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (student) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete ${student.student_name}?`
    );

    if (!confirmed) return;

    try {
      setError("");
      setSuccess("");

      await api.delete(`/students/${student.student_id}`);

      setSuccess("Student deleted successfully.");
      await fetchStudents();
    } catch (err) {
      setError(
        err.response?.data?.message || "Unable to delete student."
      );
    }
  };

  return (
    <div className="p-8 space-y-6">

      {/* HEADER */}

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">
            Students Management
          </h1>
          <p className="text-slate-500 mt-2">
            Add, edit, delete and manage registered students.
          </p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={fetchStudents}
            className="flex items-center gap-2 px-4 py-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-50"
          >
            <RefreshCw size={18} />
            Refresh
          </button>

          <button
            onClick={openAddModal}
            className="flex items-center gap-2 px-4 py-3 rounded-xl bg-blue-600 text-white hover:bg-blue-700"
          >
            <Plus size={19} />
            Add Student
          </button>
        </div>
      </div>

      {/* MESSAGES */}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 p-4 rounded-xl">
          {success}
        </div>
      )}

      {/* TOTAL STUDENTS */}

      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <Users className="text-blue-600" size={26} />
        <p className="text-sm text-slate-500 mt-3">Total Students</p>
        <h2 className="text-3xl font-bold text-slate-800">
          {students.length}
        </h2>
      </div>

      {/* STUDENT TABLE */}

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">

        <div className="p-5 border-b border-slate-100">
          <div className="relative max-w-md">
            <Search
              className="absolute left-3 top-3 text-slate-400"
              size={19}
            />

            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search name, roll number, email or department..."
              className="w-full border border-slate-200 rounded-xl pl-10 pr-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {loading ? (
          <p className="p-8 text-center text-slate-500">
            Loading students...
          </p>
        ) : filteredStudents.length === 0 ? (
          <p className="p-8 text-center text-slate-500">
            No students found.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 text-slate-500 text-sm">
                <tr>
                  <th className="p-4">Student ID</th>
                  <th className="p-4">Name</th>
                  <th className="p-4">Roll Number</th>
                  <th className="p-4">Email</th>
                  <th className="p-4">Phone</th>
                  <th className="p-4">Department</th>
                  <th className="p-4">Academic Year</th>
                  <th className="p-4">Actions</th>
                </tr>
              </thead>

              <tbody>
                {filteredStudents.map((student) => (
                  <tr
                    key={student.student_id}
                    className="border-t border-slate-100 hover:bg-slate-50"
                  >
                    <td className="p-4">{student.student_id}</td>

                    <td className="p-4 font-semibold text-slate-800">
                      {student.student_name}
                    </td>

                    <td className="p-4">{student.roll_number}</td>
                    <td className="p-4">{student.email}</td>
                    <td className="p-4">{student.phone || "—"}</td>
                    <td className="p-4">{student.department}</td>
                    <td className="p-4">{student.academic_year}</td>

                    <td className="p-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => openEditModal(student)}
                          title="Edit Student"
                          className="p-2 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100"
                        >
                          <Pencil size={17} />
                        </button>

                        <button
                          onClick={() => handleDelete(student)}
                          title="Delete Student"
                          className="p-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100"
                        >
                          <Trash2 size={17} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ADD / EDIT MODAL */}

      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-xl rounded-2xl shadow-xl overflow-hidden">

            <div className="flex justify-between items-center p-6 border-b border-slate-100">
              <div>
                <h2 className="text-xl font-bold text-slate-800">
                  {editingId ? "Edit Student" : "Add New Student"}
                </h2>
                <p className="text-sm text-slate-500 mt-1">
                  Enter student details below.
                </p>
              </div>

              <button
                onClick={closeModal}
                className="p-2 rounded-lg hover:bg-slate-100"
              >
                <X size={21} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">

              {[
                ["student_name", "Student Name", "Enter student name"],
                ["roll_number", "Roll Number", "Enter roll number"],
                ["email", "Email", "Enter email address"],
                ["phone", "Phone", "Enter phone number"],
                ["department", "Department", "Enter department"],
                ["academic_year", "Academic Year", "e.g. 2026"]
              ].map(([name, label, placeholder]) => (
                <div key={name}>
                  <label className="block text-sm font-medium mb-2">
                    {label}
                    {name !== "phone" && (
                      <span className="text-red-500"> *</span>
                    )}
                  </label>

                  <input
                    type={name === "email" ? "email" : "text"}
                    name={name}
                    value={form[name]}
                    onChange={handleChange}
                    required={name !== "phone"}
                    placeholder={placeholder}
                    className="w-full border border-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              ))}

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={saving}
                  className="px-5 py-3 rounded-xl border border-slate-200 hover:bg-slate-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-3 rounded-xl bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-60"
                >
                  {saving
                    ? "Saving..."
                    : editingId
                    ? "Update Student"
                    : "Add Student"}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
