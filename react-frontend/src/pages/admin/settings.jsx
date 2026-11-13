
import { useEffect, useState } from "react";
import {
  Settings as SettingsIcon,
  User,
  Bell,
  ShieldCheck,
  Save,
  Loader2
} from "lucide-react";

import api from "../../services/api";

export default function Settings() {
  const [profile, setProfile] = useState({
    admin_name: "",
    email: "",
  });

  const [notifications, setNotifications] = useState({
    overdue_notifications: true,
    request_notifications: true,
    return_notifications: true,
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
const [newPassword, setNewPassword] = useState("");
const [confirmPassword, setConfirmPassword] = useState("");
const [passwordLoading, setPasswordLoading] = useState(false);
const [passwordMessage, setPasswordMessage] = useState("");
const [passwordError, setPasswordError] = useState("");

const handlePasswordChange = async (e) => {
    e.preventDefault();

    setPasswordMessage("");
    setPasswordError("");

    if (newPassword.length < 8) {
        setPasswordError("New password must contain at least 8 characters.");
        return;
    }

    if (newPassword !== confirmPassword) {
        setPasswordError("New password and confirm password do not match.");
        return;
    }

    try {
        setPasswordLoading(true);

        const response = await api.put("/auth/change-password", {
            currentPassword,
            newPassword
        });

        setPasswordMessage(
            response.data.message || "Password changed successfully."
        );

        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");

    } catch (error) {
        setPasswordError(
            error.response?.data?.message || "Unable to change password."
        );
    } finally {
        setPasswordLoading(false);
    }
};

  // LOAD PROFILE AND SETTINGS
  useEffect(() => {
    const loadSettings = async () => {
      try {
        setLoading(true);
        setError("");

        const [profileResponse, settingsResponse] =
          await Promise.all([
            api.get("/auth/profile"),
            api.get("/auth/settings"),
          ]);

        const admin = profileResponse.data.admin;
        const settings = settingsResponse.data.settings;

        setProfile({
          admin_name: admin.admin_name || "",
          email: admin.email || "",
        });

        setNotifications({
          overdue_notifications:
            Boolean(Number(settings.overdue_notifications)),
          request_notifications:
            Boolean(Number(settings.request_notifications)),
          return_notifications:
            Boolean(Number(settings.return_notifications)),
        });

      } catch (err) {
        console.error("Settings loading error:", err);

        setError(
          err.response?.data?.message ||
          "Unable to load settings. Please check your connection."
        );

      } finally {
        setLoading(false);
      }
    };

    loadSettings();
  }, []);

  // PROFILE INPUT HANDLER
  const handleProfileChange = (e) => {
    setProfile({
      ...profile,
      [e.target.name]: e.target.value,
    });
  };

  // NOTIFICATION HANDLER
  const handleNotificationChange = (e) => {
    setNotifications({
      ...notifications,
      [e.target.name]: e.target.checked,
    });
  };

  // SAVE PROFILE AND NOTIFICATIONS
  const handleSave = async (e) => {
    e.preventDefault();

    try {
      setSaving(true);
      setMessage("");
      setError("");

      if (!profile.admin_name.trim() || !profile.email.trim()) {
        setError("Admin name and email are required.");
        return;
      }

      await Promise.all([
        api.put("/auth/profile", {
          admin_name: profile.admin_name.trim(),
          email: profile.email.trim(),
        }),

        api.put("/auth/settings", notifications),
      ]);

      sessionStorage.setItem(
        "adminName",
        profile.admin_name.trim()
      );

      setMessage("Settings saved successfully!");

    } catch (err) {
      console.error("Settings saving error:", err);

      setError(
        err.response?.data?.message ||
        "Unable to save settings. Please try again."
      );

    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[300px] items-center justify-center gap-3">
        <Loader2 className="animate-spin text-blue-600" />
        <span className="text-gray-500">
          Loading settings...
        </span>
      </div>
    );
  }

  return (
    <div className="space-y-6">

      {/* PAGE HEADER */}
      <div>
        <div className="flex items-center gap-3">
          <SettingsIcon size={28} className="text-blue-600" />

          <h1 className="text-2xl font-bold text-gray-800">
            Settings
          </h1>
        </div>

        <p className="mt-1 text-sm text-gray-500">
          Manage your administrator account and preferences.
        </p>
      </div>

      {/* SUCCESS MESSAGE */}
      {message && (
        <div className="rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-700">
          {message}
        </div>
      )}

      {/* ERROR MESSAGE */}
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">

        {/* PROFILE SETTINGS */}
        <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">

          <div className="mb-5 flex items-center gap-3">
            <User className="text-blue-600" />

            <div>
              <h2 className="font-semibold text-gray-800">
                Profile Settings
              </h2>

              <p className="text-sm text-gray-500">
                Administrator account information
              </p>
            </div>
          </div>

          <div className="grid gap-5 md:grid-cols-2">

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Admin Name
              </label>

              <input
                name="admin_name"
                value={profile.admin_name}
                onChange={handleProfileChange}
                required
                className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-500"
                placeholder="Enter admin name"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Email Address
              </label>

              <input
                type="email"
                name="email"
                value={profile.email}
                onChange={handleProfileChange}
                required
                className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-500"
                placeholder="Enter email address"
              />
            </div>

          </div>
        </section>

        {/* NOTIFICATION SETTINGS */}
        <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">

          <div className="mb-5 flex items-center gap-3">
            <Bell className="text-blue-600" />

            <div>
              <h2 className="font-semibold text-gray-800">
                Notifications
              </h2>

              <p className="text-sm text-gray-500">
                Choose which library notifications you want to enable.
              </p>
            </div>
          </div>

          <div className="space-y-5">

            {[
              [
                "overdue_notifications",
                "Overdue book notifications"
              ],
              [
                "request_notifications",
                "New book request notifications"
              ],
              [
                "return_notifications",
                "Book return request notifications"
              ],
            ].map(([key, label]) => (

              <label
                key={key}
                className="flex cursor-pointer items-center justify-between gap-4"
              >
                <span className="text-sm text-gray-700">
                  {label}
                </span>

                <input
                  type="checkbox"
                  name={key}
                  checked={notifications[key]}
                  onChange={handleNotificationChange}
                  className="h-5 w-5 accent-blue-600"
                />
              </label>

            ))}

          </div>
        </section>
      </form>

      {/* SECURITY SETTINGS */}
      <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">

        <div className="mb-5 flex items-center gap-3">
          <ShieldCheck className="text-blue-600" />

          <div>
            <h2 className="font-semibold text-gray-800">
              Security
            </h2>

            <p className="text-sm text-gray-500">
              Account security and password management.
            </p>
          </div>
        </div>

        <p className="mb-6 rounded-lg bg-blue-50 p-4 text-sm text-blue-700">
          Your admin account is protected using JWT authentication
          and password hashing.
        </p>

        {/* CHANGE PASSWORD */}
        <form onSubmit={handlePasswordChange} className="space-y-4">

          <h3 className="font-semibold text-gray-800">
            Change Password
          </h3>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Current Password
            </label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
              className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-500"
              placeholder="Enter current password"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              New Password
            </label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              minLength={8}
              className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-500"
              placeholder="Enter new password"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Confirm New Password
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              minLength={8}
              className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-500"
              placeholder="Confirm new password"
            />
          </div>

          {passwordError && (
            <p className="text-sm text-red-600">
              {passwordError}
            </p>
          )}

          {passwordMessage && (
            <p className="text-sm text-green-600">
              {passwordMessage}
            </p>
          )}

          <button
            type="submit"
            disabled={passwordLoading}
            className="rounded-lg bg-purple-600 px-6 py-3 font-medium text-white transition hover:bg-purple-700 disabled:opacity-60"
          >
            {passwordLoading ? "Updating..." : "Update Password"}
          </button>
        </form>
      </section>
    </div>
  );
}
