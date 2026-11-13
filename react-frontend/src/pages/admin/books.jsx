
import { useEffect, useMemo, useState } from "react";
import {
  Search,
  RefreshCw,
  BookOpen,
  Plus,
  Pencil,
  Trash2,
  X
} from "lucide-react";
import api from "../../services/api";

const emptyForm = {
  title: "",
  author: "",
  isbn: "",
  category_id: "",
  total_quantity: ""
};

export default function Books() {
  const [books, setBooks] = useState([]);
  const [categories, setCategories] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const fetchBooks = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/books");

      setBooks(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      setError(
        err.response?.data?.message || "Unable to load books."
      );
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await api.get("/books/categories");
      setCategories(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      setError(
        err.response?.data?.message || "Unable to load categories."
      );
    }
  };

  useEffect(() => {
    fetchBooks();
    fetchCategories();
  }, []);

  const filteredBooks = useMemo(() => {
    return books.filter((book) => {
      const matchesSearch = [
        book.title,
        book.author,
        book.isbn,
        book.category_name
      ].some((value) =>
        String(value || "").toLowerCase().includes(search.toLowerCase())
      );

      const matchesCategory =
        !categoryFilter ||
        String(book.category_id) === String(categoryFilter);

      return matchesSearch && matchesCategory;
    });
  }, [books, search, categoryFilter]);

  const totalCopies = books.reduce(
    (sum, book) => sum + Number(book.total_quantity || 0),
    0
  );

  const availableCopies = books.reduce(
    (sum, book) => sum + Number(book.available_quantity || 0),
    0
  );

  const openAddModal = () => {
    setEditingId(null);
    setForm(emptyForm);
    setError("");
    setSuccess("");
    setShowModal(true);
  };

  const openEditModal = (book) => {
    setEditingId(book.book_id);

    setForm({
      title: book.title || "",
      author: book.author || "",
      isbn: book.isbn || "",
      category_id: String(book.category_id || ""),
      total_quantity: String(book.total_quantity ?? "")
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

    if (
      !form.title.trim() ||
      !form.author.trim() ||
      !form.isbn.trim() ||
      !form.category_id ||
      form.total_quantity === ""
    ) {
      setError("Please fill in all fields.");
      return;
    }

    const quantity = Number(form.total_quantity);

    if (!Number.isInteger(quantity) || quantity < 0) {
      setError("Total quantity must be a non-negative whole number.");
      return;
    }

    const payload = {
      title: form.title.trim(),
      author: form.author.trim(),
      isbn: form.isbn.trim(),
      category_id: Number(form.category_id),
      total_quantity: quantity
    };

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      if (editingId) {
        await api.put(`/books/${editingId}`, payload);
        setSuccess("Book updated successfully.");
      } else {
        await api.post("/books", payload);
        setSuccess("Book added successfully.");
      }

      setShowModal(false);
      setEditingId(null);
      setForm(emptyForm);

      await fetchBooks();
    } catch (err) {
      setError(
        err.response?.data?.message || "Unable to save book."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (book) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${book.title}"?`
    );

    if (!confirmed) return;

    try {
      setError("");
      setSuccess("");

      await api.delete(`/books/${book.book_id}`);

      setSuccess("Book deleted successfully.");
      await fetchBooks();
    } catch (err) {
      setError(
        err.response?.data?.message || "Unable to delete book."
      );
    }
  };

  return (
    <div className="p-8 space-y-6">

      {/* PAGE HEADER */}

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">
            Books Management
          </h1>

          <p className="text-slate-500 mt-2">
            Add, edit, delete and manage your library collection.
          </p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={fetchBooks}
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
            Add Book
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

      {/* STATISTICS */}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <BookOpen className="text-blue-600" size={25} />
          <p className="text-sm text-slate-500 mt-3">Total Book Titles</p>
          <h2 className="text-3xl font-bold text-slate-800">
            {books.length}
          </h2>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <BookOpen className="text-purple-600" size={25} />
          <p className="text-sm text-slate-500 mt-3">Total Copies</p>
          <h2 className="text-3xl font-bold text-slate-800">
            {totalCopies}
          </h2>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <BookOpen className="text-green-600" size={25} />
          <p className="text-sm text-slate-500 mt-3">Available Copies</p>
          <h2 className="text-3xl font-bold text-slate-800">
            {availableCopies}
          </h2>
        </div>

      </div>

      {/* BOOK TABLE */}

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">

        <div className="p-5 border-b border-slate-100 flex flex-col md:flex-row gap-3">

          <div className="relative flex-1">
            <Search
              className="absolute left-3 top-3 text-slate-400"
              size={19}
            />

            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search title, author, ISBN or category..."
              className="w-full border border-slate-200 rounded-xl pl-10 pr-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="border border-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Categories</option>

            {categories.map((category) => (
              <option
                key={category.category_id}
                value={category.category_id}
              >
                {category.category_name}
              </option>
            ))}
          </select>

        </div>

        {loading ? (
          <p className="p-8 text-center text-slate-500">
            Loading books...
          </p>
        ) : filteredBooks.length === 0 ? (
          <p className="p-8 text-center text-slate-500">
            No books found.
          </p>
        ) : (

          <div className="overflow-x-auto">

            <table className="w-full text-left">

              <thead className="bg-slate-50 text-slate-500 text-sm">
                <tr>
                  <th className="p-4">Book ID</th>
                  <th className="p-4">Title</th>
                  <th className="p-4">Author</th>
                  <th className="p-4">ISBN</th>
                  <th className="p-4">Category</th>
                  <th className="p-4">Total</th>
                  <th className="p-4">Available</th>
                  <th className="p-4">Actions</th>
                </tr>
              </thead>

              <tbody>
                {filteredBooks.map((book) => (
                  <tr
                    key={book.book_id}
                    className="border-t border-slate-100 hover:bg-slate-50"
                  >
                    <td className="p-4 text-slate-600">
                      {book.book_id}
                    </td>

                    <td className="p-4 font-semibold text-slate-800">
                      {book.title}
                    </td>

                    <td className="p-4 text-slate-600">
                      {book.author}
                    </td>

                    <td className="p-4 text-slate-600">
                      {book.isbn}
                    </td>

                    <td className="p-4 text-slate-600">
                      {book.category_name}
                    </td>

                    <td className="p-4">
                      {book.total_quantity}
                    </td>

                    <td className="p-4">
                      <span className="px-3 py-1 rounded-full bg-green-100 text-green-700 text-sm">
                        {book.available_quantity}
                      </span>
                    </td>

                    <td className="p-4">
                      <div className="flex gap-2">

                        <button
                          onClick={() => openEditModal(book)}
                          title="Edit Book"
                          className="p-2 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100"
                        >
                          <Pencil size={17} />
                        </button>

                        <button
                          onClick={() => handleDelete(book)}
                          title="Delete Book"
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
                  {editingId ? "Edit Book" : "Add New Book"}
                </h2>

                <p className="text-sm text-slate-500 mt-1">
                  Enter the book details below.
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

              <div>
                <label className="block text-sm font-medium mb-2">
                  Book Title
                </label>
                <input
                  name="title"
                  value={form.title}
                  onChange={handleChange}
                  required
                  className="w-full border border-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter book title"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Author
                </label>
                <input
                  name="author"
                  value={form.author}
                  onChange={handleChange}
                  required
                  className="w-full border border-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter author name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  ISBN
                </label>
                <input
                  name="isbn"
                  value={form.isbn}
                  onChange={handleChange}
                  required
                  className="w-full border border-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter ISBN"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Category
                </label>
                <select
                  name="category_id"
                  value={form.category_id}
                  onChange={handleChange}
                  required
                  className="w-full border border-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Category</option>

                  {categories.map((category) => (
                    <option
                      key={category.category_id}
                      value={category.category_id}
                    >
                      {category.category_name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Total Quantity
                </label>
                <input
                  type="number"
                  name="total_quantity"
                  value={form.total_quantity}
                  onChange={handleChange}
                  min="0"
                  step="1"
                  required
                  className="w-full border border-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter total copies"
                />
              </div>

              {error && (
                <p className="text-sm text-red-600">{error}</p>
              )}

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
                    ? "Update Book"
                    : "Add Book"}
                </button>

              </div>

            </form>

          </div>

        </div>
      )}

    </div>
  );
}
