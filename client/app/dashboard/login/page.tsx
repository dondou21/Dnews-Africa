"use client";

import { useState } from "react";
import Link from "next/link";

export default function DashboardLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement login logic
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-dnews-bg px-4">
      <div className="w-full max-w-sm">
        <div className="rounded-sm border border-dnews-border bg-dnews-card p-8">
          <div className="mb-8 text-center">
            <Link href="/" className="inline-block">
              <span className="font-heading text-2xl font-bold text-dnews-accent">
                Dnews
              </span>
              <span className="font-heading text-2xl font-bold text-dnews-red">
                Africa
              </span>
            </Link>
            <p className="mt-2 text-sm text-dnews-muted">
              Sign in to your dashboard
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label
                htmlFor="email"
                className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-dnews-gray"
              >
                Email address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="w-full rounded-sm border border-dnews-border bg-dnews-bg px-3 py-2.5 text-sm text-dnews-dark placeholder-dnews-muted outline-none transition-colors focus:border-dnews-accent"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-dnews-gray"
              >
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
                className="w-full rounded-sm border border-dnews-border bg-dnews-bg px-3 py-2.5 text-sm text-dnews-dark placeholder-dnews-muted outline-none transition-colors focus:border-dnews-accent"
              />
            </div>

            <button
              type="submit"
              className="w-full rounded-sm bg-dnews-accent px-4 py-2.5 text-sm font-semibold uppercase tracking-wider text-white transition-colors hover:bg-dnews-accent-light"
            >
              Sign In
            </button>
          </form>

          <p className="mt-6 text-center text-xs text-dnews-muted">
            <Link
              href="/"
              className="text-dnews-accent transition-colors hover:text-dnews-accent-light"
            >
              &larr; Back to website
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
