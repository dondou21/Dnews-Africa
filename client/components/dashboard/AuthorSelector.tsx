"use client";

import { useEffect, useState, useCallback } from "react";
import { User, Search, Check, ChevronDown } from "lucide-react";
import { get } from "@/lib/api-client";

interface AuthorUser {
  id: string;
  firstName: string;
  lastName: string;
  avatarUrl: string | null;
  email: string;
  role: { id: number; name: string };
}

interface AuthorSelectorValue {
  type: "user" | "manual";
  userId?: string;
  authorName?: string;
  authorPosition?: string;
  authorOrganization?: string;
}

interface AuthorSelectorProps {
  value: AuthorSelectorValue;
  onChange: (value: AuthorSelectorValue) => void;
}

export default function AuthorSelector({ value, onChange }: AuthorSelectorProps) {
  const [users, setUsers] = useState<AuthorUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [mode, setMode] = useState<"user" | "manual">(value.type);

  useEffect(() => {
    get<AuthorUser[]>("/users/authors")
      .then(setUsers)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filteredUsers = users.filter((u) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      u.firstName.toLowerCase().includes(q) ||
      u.lastName.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q)
    );
  });

  const selectedUser = value.userId ? users.find((u) => u.id === value.userId) : null;

  const handleModeChange = useCallback((newMode: "user" | "manual") => {
    setMode(newMode);
    if (newMode === "user") {
      onChange({ type: "user", userId: value.userId || users[0]?.id || "" });
    } else {
      onChange({ type: "manual", authorName: "", authorPosition: "", authorOrganization: "" });
    }
  }, [onChange, value.userId, users]);

  return (
    <div className="space-y-3">
      <label className="text-xs font-semibold uppercase tracking-wider text-dnews-gray">
        Author <span className="text-dnews-red">*</span>
      </label>

      <div className="flex gap-1 rounded-sm border border-dnews-border bg-dnews-bg p-0.5">
        <button
          type="button"
          onClick={() => handleModeChange("user")}
          className={`flex-1 rounded-sm px-3 py-1.5 text-xs font-medium transition-colors ${
            mode === "user"
              ? "bg-dnews-accent text-white"
              : "text-dnews-gray hover:text-dnews-dark"
          }`}
        >
          Select User
        </button>
        <button
          type="button"
          onClick={() => handleModeChange("manual")}
          className={`flex-1 rounded-sm px-3 py-1.5 text-xs font-medium transition-colors ${
            mode === "manual"
              ? "bg-dnews-accent text-white"
              : "text-dnews-gray hover:text-dnews-dark"
          }`}
        >
          Manual Entry
        </button>
      </div>

      {mode === "user" && (
        <div className="relative">
          <button
            type="button"
            onClick={() => setUserDropdownOpen(!userDropdownOpen)}
            className="flex w-full items-center gap-2 rounded-sm border border-dnews-border bg-dnews-bg px-3 py-2 text-left text-sm text-dnews-dark transition-colors hover:border-dnews-accent"
          >
            {selectedUser ? (
              <>
                {selectedUser.avatarUrl ? (
                  <img src={selectedUser.avatarUrl} alt="" className="h-6 w-6 rounded-full object-cover" />
                ) : (
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-dnews-accent text-[10px] font-bold text-white">
                    {selectedUser.firstName.charAt(0)}{selectedUser.lastName.charAt(0)}
                  </span>
                )}
                <div className="flex-1 min-w-0">
                  <span className="block truncate text-xs font-medium">
                    {selectedUser.firstName} {selectedUser.lastName}
                  </span>
                  <span className="block text-[10px] text-dnews-muted">{selectedUser.role.name}</span>
                </div>
                <ChevronDown size={14} className="shrink-0 text-dnews-muted" />
              </>
            ) : (
              <span className="text-dnews-muted">Select an author...</span>
            )}
          </button>

          {userDropdownOpen && (
            <div className="absolute left-0 right-0 top-full z-20 mt-1 rounded-sm border border-dnews-border bg-dnews-card shadow-lg">
              <div className="border-b border-dnews-border p-2">
                <div className="flex items-center gap-1.5 rounded-sm border border-dnews-border bg-dnews-bg px-2 py-1">
                  <Search size={12} className="text-dnews-muted" />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search users..."
                    className="flex-1 bg-transparent text-xs text-dnews-dark outline-none placeholder:text-dnews-muted"
                    autoFocus
                  />
                </div>
              </div>
              <div className="max-h-48 overflow-y-auto">
                {loading ? (
                  <p className="px-3 py-4 text-center text-xs text-dnews-muted">Loading...</p>
                ) : filteredUsers.length === 0 ? (
                  <p className="px-3 py-4 text-center text-xs text-dnews-muted">No users found</p>
                ) : (
                  filteredUsers.map((u) => (
                    <button
                      key={u.id}
                      type="button"
                      onClick={() => {
                        onChange({ type: "user", userId: u.id });
                        setUserDropdownOpen(false);
                        setSearch("");
                      }}
                      className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs transition-colors hover:bg-dnews-light-gray"
                    >
                      {u.avatarUrl ? (
                        <img src={u.avatarUrl} alt="" className="h-7 w-7 rounded-full object-cover" />
                      ) : (
                        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-dnews-accent/10 text-[10px] font-bold text-dnews-accent">
                          {u.firstName.charAt(0)}{u.lastName.charAt(0)}
                        </span>
                      )}
                      <div className="flex-1 min-w-0">
                        <span className="block truncate font-medium text-dnews-dark">
                          {u.firstName} {u.lastName}
                        </span>
                        <span className="block truncate text-dnews-muted">{u.role.name}</span>
                      </div>
                      {value.userId === u.id && (
                        <Check size={14} className="shrink-0 text-dnews-accent" />
                      )}
                    </button>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {mode === "manual" && (
        <div className="space-y-2 rounded-sm border border-dnews-border bg-dnews-bg p-3">
          <div>
            <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wider text-dnews-gray">
              Author Name <span className="text-dnews-red">*</span>
            </label>
            <input
              type="text"
              value={value.authorName ?? ""}
              onChange={(e) => onChange({ ...value, authorName: e.target.value })}
              placeholder="e.g. John Doe"
              className="w-full rounded-sm border border-dnews-border bg-dnews-card px-2.5 py-1.5 text-xs text-dnews-dark placeholder-dnews-muted outline-none focus:border-dnews-accent"
            />
          </div>
          <div>
            <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wider text-dnews-gray">
              Position / Title
            </label>
            <input
              type="text"
              value={value.authorPosition ?? ""}
              onChange={(e) => onChange({ ...value, authorPosition: e.target.value })}
              placeholder="e.g. Freelance Journalist"
              className="w-full rounded-sm border border-dnews-border bg-dnews-card px-2.5 py-1.5 text-xs text-dnews-dark placeholder-dnews-muted outline-none focus:border-dnews-accent"
            />
          </div>
          <div>
            <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wider text-dnews-gray">
              Organization
            </label>
            <input
              type="text"
              value={value.authorOrganization ?? ""}
              onChange={(e) => onChange({ ...value, authorOrganization: e.target.value })}
              placeholder="e.g. Reuters"
              className="w-full rounded-sm border border-dnews-border bg-dnews-card px-2.5 py-1.5 text-xs text-dnews-dark placeholder-dnews-muted outline-none focus:border-dnews-accent"
            />
          </div>
        </div>
      )}
    </div>
  );
}
