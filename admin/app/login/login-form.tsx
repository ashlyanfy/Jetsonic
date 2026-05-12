"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { api, ApiError, setToken } from "@/lib/api";
import { useLang } from "@/lib/i18n";
import { LangToggle } from "@/components/lang-toggle";
import { Button } from "@/components/button";
import { Input } from "@/components/input";

interface LoginResponse {
  accessToken: string;
}

export function LoginForm() {
  const { t, lang } = useLang();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await api<LoginResponse>("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });
      setToken(res.accessToken);
      router.push("/leads");
      router.refresh();
    } catch (err) {
      if (err instanceof ApiError) setError(t("loginError"));
      else setError(t("loadError"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-md">
      <div className="mb-8 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl brand-gradient text-xl font-black text-white shadow-[0_14px_28px_rgba(5,54,92,0.25)]">
            J
          </div>
          <div className="flex flex-col leading-tight">
            <span className="text-base font-black tracking-tight text-brand-700">Jetsonic</span>
            <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-accent-600">
              {lang === "ru" ? "Админ" : "Admin"}
            </span>
          </div>
        </div>
        <LangToggle />
      </div>

      <div className="rounded-[28px] border border-[rgba(6,44,73,0.08)] bg-white/90 p-8 shadow-[0_28px_80px_rgba(6,44,73,0.14)] backdrop-blur-xl">
        <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-brand-600">
          {lang === "ru" ? "Кабинет менеджера" : "Manager workspace"}
        </p>
        <h1 className="mt-2 text-3xl font-black tracking-tight text-brand-700">{t("login")}</h1>
        <p className="mt-2 text-sm text-slate-600">
          {lang === "ru"
            ? "Войдите для работы с заявками и контентом сайта."
            : "Sign in to manage leads and site content."}
        </p>

        <form onSubmit={handleSubmit} className="mt-7 space-y-4">
          <div className="space-y-1.5">
            <label htmlFor="email" className="text-xs font-bold uppercase tracking-wide text-brand-700">
              {t("email")}
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

          <div className="space-y-1.5">
            <label htmlFor="password" className="text-xs font-bold uppercase tracking-wide text-brand-700">
              {t("password")}
            </label>
            <Input
              id="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
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
            {loading ? t("signingIn") : t("signIn")}
          </Button>
        </form>
      </div>
    </div>
  );
}
