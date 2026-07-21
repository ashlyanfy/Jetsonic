"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { Button } from "@/components/button";
import { Input } from "@/components/input";

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await api("/auth/forgot-password", {
        method: "POST",
        body: JSON.stringify({ email }),
      });
      setSent(true);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "";
      if (msg.toLowerCase().includes("no account") || msg.toLowerCase().includes("exist")) {
        setError(`No account with the email "${email}" exists.`);
      } else {
        setError("Something went wrong. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-md">
      <div className="mb-6 flex justify-center">
        <img
          src="/assets/jetsonic_trade_logo.png"
          alt="Jetsonic Trading FZCO"
          className="h-16 w-auto object-contain"
        />
      </div>

      <div className="rounded-[28px] border border-[rgba(6,44,73,0.08)] bg-white/90 p-8 shadow-[0_28px_80px_rgba(6,44,73,0.14)] backdrop-blur-xl">
        {sent ? (
          <div className="text-center space-y-4">
            <div className="flex h-14 w-14 mx-auto items-center justify-center rounded-full bg-emerald-100 text-emerald-700 text-2xl">
              ✓
            </div>
            <h1 className="text-2xl font-black tracking-tight text-brand-700">
              Check your email
            </h1>
            <p className="text-sm text-slate-600">
              If <span className="font-semibold">{email}</span> is registered,
              you will receive a password reset link shortly.
              The link is valid for <strong>15 minutes</strong>.
            </p>
            <Link
              href="/login"
              className="block text-sm font-bold text-accent-600 hover:underline mt-4"
            >
              ← Back to sign in
            </Link>
          </div>
        ) : (
          <>
            <div className="text-center mb-7">
              <h1 className="text-3xl font-black tracking-tight text-brand-700">
                Forgot password?
              </h1>
              <p className="mt-2 text-sm text-slate-600">
                Enter your email address and we will send you a reset link.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label
                  htmlFor="email"
                  className="text-xs font-bold uppercase tracking-wide text-brand-700"
                >
                  Email
                </label>
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              {error && (
                <p
                  className="rounded-xl bg-red-50 px-3.5 py-2.5 text-sm font-medium text-red-700 ring-1 ring-red-200"
                  role="alert"
                >
                  {error}
                </p>
              )}

              <Button type="submit" disabled={loading} size="lg" className="w-full">
                {loading ? "Sending…" : "Send reset link"}
              </Button>
            </form>

            <div className="mt-5 text-center">
              <Link
                href="/login"
                className="text-sm font-bold text-accent-600 hover:underline"
              >
                ← Back to sign in
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
