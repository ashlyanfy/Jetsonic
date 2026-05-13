"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Download, RefreshCw, Search, ChevronRight } from "lucide-react";
import { api, downloadFile } from "@/lib/api";
import { useLang } from "@/lib/i18n";
import { formatDate } from "@/lib/utils";
import type { LeadListResponse, LeadStatus } from "@/lib/types";
import { Button } from "@/components/button";
import { Input } from "@/components/input";
import { Select } from "@/components/select";
import { StatusBadge, UrgencyBadge } from "@/components/status-badge";
import { StatsBar } from "@/components/stats-bar";

const PAGE_SIZE = 20;

const STATUSES: LeadStatus[] = ["NEW", "IN_PROGRESS", "PLANNED", "REJECTED", "CONVERTED"];
const URGENCIES = ["AOG", "Priority", "Routine"];

export function LeadsView() {
  const { t, lang } = useLang();
  const searchParams = useSearchParams();
  const [q, setQ] = useState(searchParams.get("q") ?? "");
  const [status, setStatus] = useState<LeadStatus | "">("");
  const [urgency, setUrgency] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [page, setPage] = useState(1);

  useEffect(() => {
    const fromUrl = searchParams.get("q");
    if (fromUrl !== null && fromUrl !== q) {
      setQ(fromUrl);
      setPage(1);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const query = useQuery({
    queryKey: ["leads", { q, status, urgency, from, to, page }],
    queryFn: () =>
      api<LeadListResponse>("/leads", {
        query: { q, status, urgency, from, to, page, pageSize: PAGE_SIZE },
      }),
  });

  function resetFilters() {
    setQ("");
    setStatus("");
    setUrgency("");
    setFrom("");
    setTo("");
    setPage(1);
  }

  async function handleExport() {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (status) params.set("status", status);
    if (urgency) params.set("urgency", urgency);
    if (from) params.set("from", from);
    if (to) params.set("to", to);
    const suffix = params.toString() ? `?${params.toString()}` : "";
    await downloadFile(`/leads/export${suffix}`, `leads-${new Date().toISOString().slice(0, 10)}.xlsx`);
  }

  const totalPages = query.data ? Math.max(1, query.data.pages || Math.ceil(query.data.total / PAGE_SIZE)) : 1;

  return (
    <div className="mx-auto w-full max-w-[1280px] space-y-7 p-4 sm:p-6 lg:p-8">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-accent-600">
            {lang === "ru" ? "Кабинет менеджера" : "Manager workspace"}
          </p>
          <h1 className="mt-2 text-4xl font-black tracking-tight text-brand-700">{t("leads")}</h1>
          <p className="mt-2 max-w-xl text-sm text-slate-600">{t("leadsSubtitle")}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => query.refetch()}>
            <RefreshCw size={16} />
            {t("refresh")}
          </Button>
          <Button onClick={handleExport}>
            <Download size={16} />
            {t("exportExcel")}
          </Button>
        </div>
      </header>

      <StatsBar />

      <section className="rounded-3xl border border-[rgba(6,44,73,0.08)] bg-white/85 p-5 shadow-[0_18px_45px_rgba(6,44,73,0.06)] backdrop-blur-sm">
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-6">
          <div className="lg:col-span-2">
            <div className="relative">
              <Search size={16} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-brand-700/40" />
              <Input
                placeholder={t("search")}
                value={q}
                onChange={(e) => {
                  setQ(e.target.value);
                  setPage(1);
                }}
                className="pl-10"
              />
            </div>
          </div>

          <Select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value as LeadStatus | "");
              setPage(1);
            }}
          >
            <option value="">
              {t("filterStatus")}: {t("filterAll")}
            </option>
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {t(`status_${s}` as const)}
              </option>
            ))}
          </Select>

          <Select
            value={urgency}
            onChange={(e) => {
              setUrgency(e.target.value);
              setPage(1);
            }}
          >
            <option value="">
              {t("filterUrgency")}: {t("filterAll")}
            </option>
            {URGENCIES.map((u) => (
              <option key={u} value={u}>
                {u}
              </option>
            ))}
          </Select>

          <Input
            type="date"
            value={from}
            onChange={(e) => {
              setFrom(e.target.value);
              setPage(1);
            }}
          />

          <Input
            type="date"
            value={to}
            onChange={(e) => {
              setTo(e.target.value);
              setPage(1);
            }}
          />
        </div>

        <div className="mt-3 flex items-center justify-end">
          <Button variant="ghost" size="sm" onClick={resetFilters}>
            {t("resetFilters")}
          </Button>
        </div>
      </section>

      <section className="overflow-hidden rounded-3xl border border-[rgba(6,44,73,0.08)] bg-white/85 shadow-[0_18px_45px_rgba(6,44,73,0.06)] backdrop-blur-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-[rgba(6,44,73,0.08)] bg-brand-50/60 text-left text-[11px] uppercase tracking-[0.14em] text-brand-700/70">
              <tr>
                <th className="px-5 py-3.5 font-bold">{t("colDate")}</th>
                <th className="px-5 py-3.5 font-bold">{t("colName")}</th>
                <th className="px-5 py-3.5 font-bold">{t("colCompany")}</th>
                <th className="px-5 py-3.5 font-bold">{t("colPhone")}</th>
                <th className="px-5 py-3.5 font-bold">{t("colType")}</th>
                <th className="px-5 py-3.5 font-bold">{t("colUrgency")}</th>
                <th className="px-5 py-3.5 font-bold">{t("colStatus")}</th>
                <th className="px-5 py-3.5 text-right font-bold">{t("colActions")}</th>
              </tr>
            </thead>
            <tbody>
              {query.isLoading && (
                <tr>
                  <td colSpan={8} className="px-5 py-10 text-center text-slate-500">
                    {t("loading")}
                  </td>
                </tr>
              )}

              {query.isError && (
                <tr>
                  <td colSpan={8} className="px-5 py-10 text-center text-red-600">
                    {t("loadError")}
                  </td>
                </tr>
              )}

              {query.data?.items.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-5 py-12 text-center">
                    <p className="text-sm font-semibold text-brand-700">{t("noLeads")}</p>
                    <p className="mt-1 text-xs text-slate-500">
                      {lang === "ru"
                        ? "Когда клиент отправит форму на сайте — заявка появится здесь."
                        : "When a client submits the website form, it will appear here."}
                    </p>
                  </td>
                </tr>
              )}

              {query.data?.items.map((lead) => (
                <tr
                  key={lead.id}
                  className="border-b border-[rgba(6,44,73,0.05)] last:border-0 transition hover:bg-brand-50/40"
                >
                  <td className="px-5 py-4 text-brand-700/70">{formatDate(lead.createdAt)}</td>
                  <td className="px-5 py-4 font-bold text-brand-700">{lead.name}</td>
                  <td className="px-5 py-4 text-brand-900/80">{lead.company ?? "—"}</td>
                  <td className="px-5 py-4 text-brand-900/80">{lead.phone ?? "—"}</td>
                  <td className="px-5 py-4 text-brand-900/80">{lead.requestType ?? "—"}</td>
                  <td className="px-5 py-4">
                    <UrgencyBadge urgency={lead.urgency} />
                  </td>
                  <td className="px-5 py-4">
                    <StatusBadge status={lead.status} />
                  </td>
                  <td className="px-5 py-4 text-right">
                    <Link
                      href={`/leads/${lead.id}`}
                      className="inline-flex h-9 items-center gap-1 rounded-full border border-[rgba(6,44,73,0.12)] bg-white px-4 text-xs font-bold text-brand-700 transition hover:border-brand-700/30 hover:bg-brand-50"
                    >
                      {t("open")}
                      <ChevronRight size={14} />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {query.data && query.data.total > 0 && (
          <div className="flex items-center justify-between border-t border-[rgba(6,44,73,0.06)] px-5 py-4 text-sm">
            <span className="text-brand-700/70">
              {t("total")}: <span className="font-bold text-brand-700">{query.data.total}</span> · {t("page")} {page} /{" "}
              {totalPages}
            </span>
            <div className="flex gap-2">
              <Button variant="secondary" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
                {t("prev")}
              </Button>
              <Button
                variant="secondary"
                size="sm"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                {t("next")}
              </Button>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
