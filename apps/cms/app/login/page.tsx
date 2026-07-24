"use client";

import { useState, FormEvent } from "react";
import Link from "next/link";
import Image from "next/image";
import { Eye, EyeOff, ArrowLeft } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

export default function DashboardLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Please enter your email and password.");
      return;
    }

    setSubmitting(true);

    try {
      await login(email, password);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Invalid email or password.";
      setError(message);
      setSubmitting(false);
    }
  };

  const inputClass =
    "w-full rounded-sm border border-dnews-border bg-white px-3 py-2.5 pr-10 text-sm text-dnews-dark placeholder-dnews-muted outline-none transition-colors focus:border-dnews-accent disabled:opacity-50 dark:bg-dnews-dark-gray dark:text-white";

  return (
    <div className="flex min-h-screen">
      <div className="flex w-full flex-col justify-center px-6 py-12 lg:w-1/2 lg:px-12">
        <div className="mx-auto w-full max-w-sm">
          <div className="mb-8 flex justify-center">
            <Link
              href="/"
              className="dark:bg-black dark:px-3 dark:py-1 dark:rounded-sm inline-block"
            >
              <Image
                src="/images/logo0.png"
                alt="Dnews Africa"
                width={320}
                height={80}
                priority
                className="h-auto w-[280px] object-contain sm:w-[320px]"
              />
            </Link>
          </div>

          {error && (
            <div className="mt-6 rounded-sm border border-dnews-red/30 bg-dnews-red/5 px-4 py-3">
              <p className="text-xs font-medium text-dnews-red">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-6 space-y-5">
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
                disabled={submitting}
                autoComplete="email"
                className={inputClass}
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-dnews-gray"
              >
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                  disabled={submitting}
                  autoComplete="current-password"
                  className={inputClass}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((p) => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-dnews-muted transition-colors hover:text-dnews-gray"
                  tabIndex={-1}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-end">
              <span className="text-xs text-dnews-muted">
                Forgot password?{" "}
                <button
                  type="button"
                  className="font-medium text-dnews-accent transition-colors hover:text-dnews-accent-light"
                >
                  Reset it
                </button>
              </span>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="flex w-full items-center justify-center gap-2 rounded-sm bg-dnews-accent px-4 py-2.5 text-sm font-semibold uppercase tracking-wider text-white transition-colors hover:bg-dnews-accent/80 disabled:opacity-60"
            >
              {submitting && (
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              )}
              {submitting ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <p className="mt-8 text-center text-xs text-dnews-muted">
            <Link
              href="/"
              className="inline-flex items-center gap-1 text-dnews-accent transition-colors hover:text-dnews-accent-light"
            >
              <ArrowLeft size={12} />
              Back to website
            </Link>
          </p>
        </div>
      </div>

      <div className="relative hidden lg:flex lg:w-1/2 bg-gradient-to-br from-dnews-accent to-dnews-accent/80">
        <div className="relative z-10 flex min-h-full w-full flex-col justify-center px-16">
          <div className="mx-auto max-w-md">
            <div className="rounded-sm border border-white/20 bg-white/10 p-8 backdrop-blur-sm">
              <h2 className="font-heading text-3xl font-bold leading-tight text-white">
                Your hub for African news management
              </h2>
              <p className="mt-4 text-base leading-relaxed text-white/80">
                Publish, moderate, and analyze news content across Africa. From
                breaking stories to in-depth features, manage every aspect of your
                editorial workflow in one place.
              </p>

                <div className="mt-8 grid grid-cols-2 gap-4">
                  <div className="rounded-sm border border-white/20 p-4">
                    <p className="text-2xl font-bold text-white">Publish</p>
                    <p className="mt-1 text-xs text-white/70">
                      Create and schedule articles
                    </p>
                  </div>
                  <div className="rounded-sm border border-white/20 p-4">
                    <p className="text-2xl font-bold text-white">Manage</p>
                    <p className="mt-1 text-xs text-white/70">
                      Organize categories and media
                    </p>
                  </div>
                  <div className="rounded-sm border border-white/20 p-4">
                    <p className="text-2xl font-bold text-white">Track</p>
                    <p className="mt-1 text-xs text-white/70">
                      Monitor performance and reach
                    </p>
                  </div>
                </div>
            </div>

            <div className="mt-8 border-t border-white/20 pt-6">
              <p className="text-xs text-white/60">
                &copy; {new Date().getFullYear()} Dnews Africa. All rights
                reserved.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
