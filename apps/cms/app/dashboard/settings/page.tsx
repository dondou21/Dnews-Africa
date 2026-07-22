"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import RoleGuard from "@/components/dashboard/RoleGuard";
import { patch } from "@dnews/api-client";
import { saveUser } from "@dnews/api-client";
import { User, Shield, Calendar, Key, Palette, Monitor } from "lucide-react";

export default function SettingsPage() {
  return (
    <RoleGuard roles={["Admin", "Editor", "Journalist", "Moderator"]}>
      <SettingsPageContent />
    </RoleGuard>
  );
}

function SettingsPageContent() {
  const { user } = useAuth();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileError, setProfileError] = useState("");
  const [profileSuccess, setProfileSuccess] = useState("");

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");

  useEffect(() => {
    if (user) {
      setFirstName(user.firstName);
      setLastName(user.lastName);
    }
  }, [user]);

  useEffect(() => {
    if (profileSuccess) {
      const t = setTimeout(() => setProfileSuccess(""), 3000);
      return () => clearTimeout(t);
    }
  }, [profileSuccess]);

  useEffect(() => {
    if (passwordSuccess) {
      const t = setTimeout(() => setPasswordSuccess(""), 3000);
      return () => clearTimeout(t);
    }
  }, [passwordSuccess]);

  if (!user) return null;

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileError("");
    setProfileSuccess("");
    if (!firstName.trim() || !lastName.trim()) {
      setProfileError("All fields are required.");
      return;
    }
    setProfileSaving(true);
    try {
      const updated = await patch<typeof user>(`/users/${user.id}`, { firstName, lastName });
      saveUser(updated);
      setProfileSuccess("Profile updated successfully.");
    } catch (err: any) {
      setProfileError(err.message || "Failed to update profile.");
    } finally {
      setProfileSaving(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError("");
    setPasswordSuccess("");

    if (!currentPassword || !newPassword || !confirmNewPassword) {
      setPasswordError("All password fields are required.");
      return;
    }
    if (newPassword.length < 6) {
      setPasswordError("New password must be at least 6 characters.");
      return;
    }
    if (newPassword !== confirmNewPassword) {
      setPasswordError("Passwords do not match.");
      return;
    }

    setPasswordSaving(true);
    try {
      await patch("/cms/auth/password", { currentPassword, newPassword, confirmNewPassword });
      setPasswordSuccess("Password changed successfully.");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmNewPassword("");
    } catch (err: any) {
      setPasswordError(err.message || "Failed to change password.");
    } finally {
      setPasswordSaving(false);
    }
  };

  const profileInitials = `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase();

  const inputClass =
    "w-full rounded-sm border border-dnews-border bg-white px-3 py-2 text-sm text-dnews-dark placeholder-dnews-muted outline-none transition-colors focus:border-dnews-accent dark:bg-dnews-dark-gray dark:text-white";

  const labelClass = "block text-xs font-medium uppercase tracking-wider text-dnews-muted mb-1";

  return (
    <div className="space-y-8">
      <div>
        <h2 className="font-heading text-xl font-bold text-dnews-dark">
          Settings
        </h2>
        <p className="mt-1 text-sm text-dnews-muted">
          Manage your profile and preferences.
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-1">
          <div className="rounded-sm border border-dnews-border bg-white p-6 text-center dark:bg-dnews-dark-gray">
            <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-dnews-accent text-2xl font-bold text-white">
              {profileInitials}
            </div>
            <h3 className="text-lg font-semibold text-dnews-dark">
              {user.firstName} {user.lastName}
            </h3>
            <p className="mt-0.5 text-sm text-dnews-muted">{user.email}</p>
            <div className="mt-4 space-y-2 text-left text-sm">
              <div className="flex items-center gap-2 text-dnews-gray">
                <Shield size={14} />
                <span className="font-medium">{user.role.name}</span>
              </div>
              <div className="flex items-center gap-2 text-dnews-gray">
                <Calendar size={14} />
                <span>Joined {new Date(user.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-8 lg:col-span-2">
          <section className="rounded-sm border border-dnews-border bg-white p-6 dark:bg-dnews-dark-gray">
            <div className="mb-5 flex items-center gap-2">
              <User size={16} className="text-dnews-accent" />
              <h3 className="text-base font-semibold text-dnews-dark">
                Edit Profile
              </h3>
            </div>

            {profileError && (
              <div className="mb-4 rounded-sm border border-dnews-red/30 bg-dnews-red/5 px-4 py-3">
                <p className="text-xs font-medium text-dnews-red">{profileError}</p>
              </div>
            )}
            {profileSuccess && (
              <div className="mb-4 rounded-sm border border-green-500/30 bg-green-50 px-4 py-3 dark:bg-green-900/20">
                <p className="text-xs font-medium text-green-700 dark:text-green-400">
                  {profileSuccess}
                </p>
              </div>
            )}

            <form onSubmit={handleProfileUpdate} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className={labelClass}>First Name</label>
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className={inputClass}
                    required
                  />
                </div>
                <div>
                  <label className={labelClass}>Last Name</label>
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className={inputClass}
                    required
                  />
                </div>
              </div>
              <div>
                <label className={labelClass}>Email</label>
                <input
                  type="email"
                  value={user.email}
                  className={`${inputClass} cursor-not-allowed bg-dnews-light-gray text-dnews-muted`}
                  disabled
                />
                <p className="mt-1 text-xs text-dnews-muted">
                  Email cannot be changed.
                </p>
              </div>
              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={profileSaving}
                  className="rounded-sm bg-dnews-accent px-5 py-2 text-xs font-semibold uppercase tracking-wider text-white transition-colors hover:bg-dnews-accent/80 disabled:opacity-60"
                >
                  {profileSaving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </section>

          <section className="rounded-sm border border-dnews-border bg-white p-6 dark:bg-dnews-dark-gray">
            <div className="mb-5 flex items-center gap-2">
              <Key size={16} className="text-dnews-accent" />
              <h3 className="text-base font-semibold text-dnews-dark">
                Change Password
              </h3>
            </div>

            {passwordError && (
              <div className="mb-4 rounded-sm border border-dnews-red/30 bg-dnews-red/5 px-4 py-3">
                <p className="text-xs font-medium text-dnews-red">{passwordError}</p>
              </div>
            )}
            {passwordSuccess && (
              <div className="mb-4 rounded-sm border border-green-500/30 bg-green-50 px-4 py-3 dark:bg-green-900/20">
                <p className="text-xs font-medium text-green-700 dark:text-green-400">
                  {passwordSuccess}
                </p>
              </div>
            )}

            <form onSubmit={handlePasswordChange} className="space-y-4">
              <div>
                <label className={labelClass}>Current Password</label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className={inputClass}
                  required
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className={labelClass}>New Password</label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className={inputClass}
                    minLength={6}
                    required
                  />
                </div>
                <div>
                  <label className={labelClass}>Confirm New Password</label>
                  <input
                    type="password"
                    value={confirmNewPassword}
                    onChange={(e) => setConfirmNewPassword(e.target.value)}
                    className={inputClass}
                    required
                  />
                </div>
              </div>
              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={passwordSaving}
                  className="rounded-sm bg-dnews-accent px-5 py-2 text-xs font-semibold uppercase tracking-wider text-white transition-colors hover:bg-dnews-accent/80 disabled:opacity-60"
                >
                  {passwordSaving ? "Updating..." : "Update Password"}
                </button>
              </div>
            </form>
          </section>

          <section className="rounded-sm border border-dnews-border bg-white p-6 dark:bg-dnews-dark-gray">
            <div className="mb-5 flex items-center gap-2">
              <Palette size={16} className="text-dnews-accent" />
              <h3 className="text-base font-semibold text-dnews-dark">
                Dashboard Preferences
              </h3>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between rounded-sm bg-dnews-light-gray px-4 py-3 dark:bg-gray-800">
                <div className="flex items-center gap-3">
                  <Monitor size={16} className="text-dnews-muted" />
                  <div>
                    <p className="text-sm font-medium text-dnews-dark">
                      Theme
                    </p>
                    <p className="text-xs text-dnews-muted">
                      Toggle between light and dark mode
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-dnews-muted">
                    Use the toggle in the top bar
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between rounded-sm bg-dnews-light-gray px-4 py-3 dark:bg-gray-800">
                <div className="flex items-center gap-3">
                  <Monitor size={16} className="text-dnews-muted" />
                  <div>
                    <p className="text-sm font-medium text-dnews-dark">
                      Compact Mode
                    </p>
                    <p className="text-xs text-dnews-muted">
                      Reduce spacing for a denser view
                    </p>
                  </div>
                </div>
                <p className="text-xs italic text-dnews-muted">
                  Coming soon
                </p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
