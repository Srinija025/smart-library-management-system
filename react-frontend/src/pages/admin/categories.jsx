
import { useEffect, useMemo, useState } from "react";
import {
  Plus,
  Search,
  Tags,
  Pencil,
  Trash2,
  X,
  RefreshCw,
  AlertCircle
} from "lucide-react";
import api from "../../services/api";

export default function Categories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");

  const [form, setForm] = useState({
    category_name: "",
    description: "",
    status: "Active"
  });

  const loadCategories = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/categories");
      setCategories(
        Array.isArray(response.data)
          ? response.data
          : response.data.categories || []
      );
    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Unable to load categories. Please check your backend."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const filteredCategories = useMemo(() => {
    const term = search.toLowerCase().trim();

    return categories.filter((category) =>
      [
        category.category_name,
        category.description,
        category.status
      ]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(term))
    );
  }, [categories, search]);

  const openAddModal = () => {
    setEditingCategory(null);
    setForm({
      category_name: "",
      description: "",
      status: "Active"
    });
    setFormError("");
    setShowModal(true);
  };

  const openEditModal = (category) => {
    setEditingCategory(category);
    setForm({
      category_name: category.category_name || "",
      description: category.description || "",
      status: category.status || "Active"
    });
    setFormError("");
    setShowModal(true);
  };

  const closeModal = () => {
    if (saving) return;
    setShowModal(false);
    setEditingCategory(null);
    setFormError("");
  };

  const handleChange = (event) => {
    setForm({
      ...form,
      [event.target.name]: event.target.value
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setFormError("");

    const categoryName = form.category_name.trim();

    if (!categoryName) {
      setFormError("Please enter a category name.");
      return;
    }

    const payload = {
      category_name: categoryName,
      description: form.description.trim(),
      status: form.status
    };

    try {
      setSaving(true);

      if (editingCategory) {
        await api.put(
          `/categories/${editingCategory.category_id}`,
          payload
        );
      } else {
        await api.post("/categories", payload);
      }

      setShowModal(false);
      setEditingCategory(null);
      await loadCategories();
    } catch (err) {
      setFormError(
        err.response?.data?.message ||
        "Unable to save category. Please try again."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (category) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${category.category_name}"?`
    );

    if (!confirmed) return;

    try {
      setError("");
      await api.delete(`/categories/${category.category_id}`);
      await loadCategories();
    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Unable to delete category. It may be assigned to existing books."
      );
    }
  };

  return (
    <div className="min-h-screen p-5 md:p-8">
      {/* Header */}
      <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">
            Categories Management
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Organize and manage your library book categories.
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
        >
          <Plus size={18} />
          Add Category
        </button>
      </div>

      {/* Statistics */}
      <div className="mb-6 rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="rounded-xl bg-purple-100 p-3 text-purple-600">
            <Tags size={25} />
          </div>
          <div>
            <p className="text-sm text-slate-500">Total Categories</p>
            <h2 className="text-2xl font-bold text-slate-800">
              {loading ? "..." : categories.length}
            </h2>
          </div>
        </div>
      </div>

      {/* Search and Refresh */}
      <div className="mb-5 flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search
            size={19}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            type="text"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by category name, description or status..."
            className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-11 pr-4 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />
        </div>

        <button
          onClick={loadCategories}
          className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-medium text-slate-600 hover:bg-slate-50"
        >
          <RefreshCw size={17} />
          Refresh
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-5 flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <AlertCircle size={18} />
          {error}
        </div>
      )}

      {/* Categories Table */}
      <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[650px] text-left">
            <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500">
              <tr>
                <th className="px-6 py-4">Category ID</th>
                <th className="px-6 py-4">Category Name</th>
                <th className="px-6 py-4">Description</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-center">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-slate-500">
                    Loading categories...
                  </td>
                </tr>
              ) : filteredCategories.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-slate-500">
                    No categories found.
                  </td>
                </tr>
              ) : (
                filteredCategories.map((category) => (
                  <tr
                    key={category.category_id}
                    className="transition hover:bg-slate-50"
                  >
                    <td className="px-6 py-4 text-sm text-slate-500">
                      #{category.category_id}
                    </td>

                    <td className="px-6 py-4 text-sm font-semibold text-slate-800">
                      {category.category_name}
                    </td>

                    <td className="max-w-xs px-6 py-4 text-sm text-slate-500">
                      {category.description || "—"}
                    </td>

                    <td className="px-6 py-4">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${
                          category.status === "Active"
                            ? "bg-green-100 text-green-700"
                            : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {category.status || "Active"}
                      </span>
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex justify-center gap-2">
                        <button
                          onClick={() => openEditModal(category)}
                          title="Edit category"
                          className="rounded-lg bg-blue-50 p-2 text-blue-600 transition hover:bg-blue-100"
                        >
                          <Pencil size={17} />
                        </button>

                        <button
                          onClick={() => handleDelete(category)}
                          title="Delete category"
                          className="rounded-lg bg-red-50 p-2 text-red-600 transition hover:bg-red-100"
                        >
                          <Trash2 size={17} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="border-t border-slate-100 px-6 py-4 text-sm text-slate-500">
          Showing {filteredCategories.length} of {categories.length} categories
        </div>
      </div>

      {/* Add / Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-slate-800">
                  {editingCategory ? "Edit Category" : "Add New Category"}
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Enter the category details below.
                </p>
              </div>

              <button
                onClick={closeModal}
                className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Category Name *
                </label>
                <input
                  type="text"
                  name="category_name"
                  value={form.category_name}
                  onChange={handleChange}
                  placeholder="Example: Programming"
                  required
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Description
                </label>
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  rows="3"
                  placeholder="Enter category description..."
                  className="w-full resize-none rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              {editingCategory && (
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Status
                  </label>
                  <select
                    name="status"
                    value={form.status}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              )}

              {formError && (
                <p className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
                  {formError}
                </p>
              )}

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={saving}
                  className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
                >
                  {saving
                    ? "Saving..."
                    : editingCategory
                    ? "Update Category"
                    : "Add Category"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
