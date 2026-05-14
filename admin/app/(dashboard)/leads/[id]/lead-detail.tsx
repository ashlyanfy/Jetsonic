"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, ExternalLink, Mail, Phone, MessageCircle } from "lucide-react";
import { api } from "@/lib/api";
import { useLang } from "@/lib/i18n";
import { formatDate } from "@/lib/utils";
import type { Lead } from "@/lib/types";
import { StatusBadge, UrgencyBadge } from "@/components/status-badge";
import { StatusSelect } from "@/components/status-select";
import { AssigneeSelect } from "@/components/assignee-select";
import { NotesPanel } from "@/components/notes-panel";

export function LeadDetail({ id }: { id: string }) {
  const { t, lang } = useLang();
  const query = useQuery({
    queryKey: ["lead", id],
    queryFn: () => api<Lead>(`/leads/${id}`),
  });

  useEffect(() => {
    if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
  }, [id]);

  if (query.isLoading)
    return <div className="mx-auto max-w-[1100px] p-8 text-brand-700/60">{t("loading")}</div>;
  if (query.isError || !query.data)
    return <div className="mx-auto max-w-[1100px] p-8 text-red-600">{t("loadError")}</div>;

  const lead = query.data;
  const waPhone = lead.phone ? lead.phone.replace(/[^\d]/g, "") : "";

  const sectionLabels =
    lang === "ru"
      ? { contact: "Контакт", request: "Запрос", message: "Сообщение клиента", changeStatus: "Статус" }
      : { contact: "Contact", request: "Request", message: "Customer message", changeStatus: "Status" };

  return (
    <div className="mx-auto w-full max-w-[1100px] space-y-7 p-4 sm:p-6 lg:p-8">
      <Link
        href="/leads"
        className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-[0.14em] text-brand-700/60 transition hover:text-brand-700"
      >
        <ArrowLeft size={14} />
        {t("leads")}
      </Link>

      <header className="overflow-hidden rounded-[28px] border border-[rgba(6,44,73,0.08)] bg-white/90 p-7 shadow-[0_28px_70px_rgba(6,44,73,0.10)]">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-accent-600">
              {lead.requestType ?? "Request"} · #{lead.id}
            </p>
            <h1 className="mt-2 text-3xl font-black tracking-tight text-brand-700">{lead.name}</h1>
            <p className="mt-1 text-sm text-brand-700/70">
              {lead.company ?? "—"} · {formatDate(lead.createdAt)}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <UrgencyBadge urgency={lead.urgency} />
            <StatusBadge status={lead.status} />
          </div>
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-brand-700/60">
              {sectionLabels.changeStatus}
            </span>
            <StatusSelect leadId={lead.id} current={lead.status} />
          </div>

          <AssigneeSelect leadId={lead.id} current={lead.assigneeId} />

          <span className="mx-2 h-7 w-px bg-[rgba(6,44,73,0.10)]" aria-hidden="true" />

          {lead.phone && (
            <a
              href={`tel:${lead.phone}`}
              className="inline-flex h-10 items-center gap-2 rounded-full border border-[rgba(6,44,73,0.12)] bg-white px-4 text-sm font-bold text-brand-700 transition hover:border-brand-700/30 hover:bg-brand-50"
            >
              <Phone size={14} /> {lead.phone}
            </a>
          )}
          {lead.email && (
            <a
              href={`mailto:${lead.email}`}
              className="inline-flex h-10 items-center gap-2 rounded-full border border-[rgba(6,44,73,0.12)] bg-white px-4 text-sm font-bold text-brand-700 transition hover:border-brand-700/30 hover:bg-brand-50"
            >
              <Mail size={14} /> {lead.email}
            </a>
          )}
          {waPhone && (
            <a
              href={`https://wa.me/${waPhone}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-10 items-center gap-2 rounded-full bg-emerald-500 px-4 text-sm font-bold text-white shadow-[0_12px_26px_rgba(16,185,129,0.30)] transition hover:bg-emerald-600"
            >
              <MessageCircle size={14} />
              WhatsApp
              <ExternalLink size={12} />
            </a>
          )}
        </div>
      </header>

      <section className="grid gap-6 lg:grid-cols-2">
        <Card title={sectionLabels.contact}>
          <Field label={t("email")} value={lead.email} />
          <Field label={t("colPhone")} value={lead.phone} />
          <Field label={t("colCompany")} value={lead.company} />
          <Field label={lang === "ru" ? "Должность" : "Role"} value={lead.role} />
        </Card>

        <Card title={sectionLabels.request}>
          <Field label={t("colType")} value={lead.requestType} />
          <Field label="Part number" value={lead.partNumber} />
          <Field label="Alt part number" value={lead.altPartNumber} />
          <Field label="Aircraft type" value={lead.aircraftType} />
          <Field label="Tail number" value={lead.tailNumber} />
          <Field label="ATA chapter" value={lead.ataChapter} />
          <Field label={lang === "ru" ? "Количество" : "Quantity"} value={lead.quantity} />
          <Field label={lang === "ru" ? "Состояние" : "Condition"} value={lead.condition} />
          <Field label={lang === "ru" ? "Сертификат" : "Certificate"} value={lead.certificate} />
          <Field
            label={lang === "ru" ? "Желаемая дата" : "Target date"}
            value={lead.targetDate ? formatDate(lead.targetDate) : null}
          />
          <Field label={lang === "ru" ? "Доставка" : "Delivery"} value={lead.deliveryLocation} />
        </Card>

        {lead.message && (
          <Card title={sectionLabels.message} className="lg:col-span-2">
            <p className="whitespace-pre-wrap text-sm leading-relaxed text-brand-900/90">{lead.message}</p>
          </Card>
        )}

        <div className="lg:col-span-2">
          <NotesPanel leadId={lead.id} notes={lead.notes ?? []} />
        </div>
      </section>
    </div>
  );
}

function Card({ title, children, className }: { title: string; children: React.ReactNode; className?: string }) {
  return (
    <div
      className={
        "rounded-3xl border border-[rgba(6,44,73,0.08)] bg-white/85 p-6 shadow-[0_18px_45px_rgba(6,44,73,0.06)] backdrop-blur-sm " +
        (className ?? "")
      }
    >
      <h2 className="mb-4 text-[11px] font-bold uppercase tracking-[0.16em] text-brand-700/60">{title}</h2>
      <dl className="space-y-3.5">{children}</dl>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string | null }) {
  return (
    <div className="flex flex-col gap-0.5">
      <dt className="text-[11px] font-bold uppercase tracking-wide text-brand-700/50">{label}</dt>
      <dd className="text-sm font-medium text-brand-900">{value ?? <span className="text-slate-400">—</span>}</dd>
    </div>
  );
}
