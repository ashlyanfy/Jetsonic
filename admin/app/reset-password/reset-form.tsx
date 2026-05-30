"use client";

import { useState, useEffect, type FormEvent } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { api } from "@/lib/api";
import { Button } from "@/components/button";
import { Input } from "@/components/input";

export function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) setError("Reset link is missing or invalid. Please request a new one.");
  }, [token]);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    setLoading(true);
    try {
      await api("/auth/reset-password", {
        method: "POST",
        body: JSON.stringify({ token, newPassword }),
      });
      setDone(true);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "";
      if (msg.toLowerCase().includes("expired") || msg.toLowerCase().includes("invalid")) {
        setError("This reset link has expired or already been used. Please request a new one.");
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
        {done ? (
          <div className="text-center space-y-4">
            <div className="flex h-14 w-14 mx-auto items-center justify-center rounded-full bg-emerald-100 text-emerald-700 text-2xl">
              ✓
            </div>
            <h1 className="text-2xl font-black tracking-tight text-brand-700">
              Password updated
            </h1>
            <p className="text-sm text-slate-600">
              Your password has been changed successfully.
            </p>
            <Link
              href="/login"
              className="block mt-4"
            >
              <Button size="lg" className="w-full">Sign in →</Button>
            </Link>
          </div>
        ) : (
          <>
            <div className="text-center mb-7">
              <h1 className="text-3xl font-black tracking-tight text-brand-700">
                Set new password
              </h1>
              <p className="mt-2 text-sm text-slate-600">
                Choose a new password for your account.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wide text-brand-700">
                  New password
                </label>
                <Input
                  type="password"
                  autoComplete="new-password"
                  required
                  minLength={8}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  disabled={!token}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wide text-brand-700">
                  Confirm new password
                </label>
                <Input
                  type="password"
                  autoComplete="new-password"
                  required
                  minLength={8}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={!token}
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

              <Button
                type="submit"
                disabled={loading || !token}
                size="lg"
                className="w-full"
              >
                {loading ? "Saving…" : "Set new password"}
              </Button>
            </form>

            <div className="mt-5 text-center">
              <Link
                href="/forgot-password"
                className="text-sm font-bold text-accent-600 hover:underline"
              >
                Request a new reset link
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
