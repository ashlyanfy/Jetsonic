"use client";

import { useState, type FormEvent } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Save, X } from "lucide-react";
import { api, ApiError } from "@/lib/api";
import { useLang } from "@/lib/i18n";
import type { Lead } from "@/lib/types";
import { Button } from "./button";
import { Input } from "./input";
import { Select } from "./select";

type EditableKey =
  | "name"
  | "email"
  | "phone"
  | "company"
  | "role"
  | "requestType"
  | "urgency"
  | "partNumber"
  | "altPartNumber"
  | "aircraftType"
  | "tailNumber"
  | "ataChapter"
  | "quantity"
  | "condition"
  | "certificate"
  | "deliveryLocation"
  | "targetDate"
  | "message";

type Draft = Partial<Record<EditableKey, string>>;

const URGENCIES = ["AOG", "Priority", "Routine"];
const REQUEST_TYPES = ["RFQ", "AOG", "Repair", "Docs"];

function toDraft(lead: Lead): Draft {
  return {
    name: lead.name ?? "",
    email: lead.email ?? "",
    phone: lead.phone ?? "",
    company: lead.company ?? "",
    role: lead.role ?? "",
    requestType: lead.requestType ?? "",
    urgency: lead.urgency ?? "",
    partNumber: lead.partNumber ?? "",
    altPartNumber: lead.altPartNumber ?? "",
    aircraftType: lead.aircraftType ?? "",
    tailNumber: lead.tailNumber ?? "",
    ataChapter: lead.ataChapter ?? "",
    quantity: lead.quantity ?? "",
    condition: lead.condition ?? "",
    certificate: lead.certificate ?? "",
    deliveryLocation: lead.deliveryLocation ?? "",
    targetDate: lead.targetDate ? lead.targetDate.slice(0, 10) : "",
    message: lead.message ?? "",
  };
}

export function LeadEditForm({ lead, onClose }: { lead: Lead; onClose: () => void }) {
  const { lang } = useLang();
  const qc = useQueryClient();
  const [draft, setDraft] = useState<Draft>(toDraft(lead));
  const [error, setError] = useState<string | null>(null);

  const labels =
    lang === "ru"
      ? {
          title: "Редактирование заявки",
          subtitle: "Все поля анкеты и контактные данные клиента.",
          contact: "Контактные данные",
          request: "Детали запроса",
          message: "Сообщение клиента",
          save: "Сохранить",
          saving: "Сохранение…",
          cancel: "Отмена",
          fields: {
            name: "Имя",
            email: "Email",
            phone: "Телефон",
            company: "Компания",
            role: "Должность",
            requestType: "Тип запроса",
            urgency: "Срочность",
            partNumber: "Part number",
            altPartNumber: "Alt part number",
            aircraftType: "Тип ВС",
            tailNumber: "Tail number",
            ataChapter: "ATA chapter",
            quantity: "Количество",
            condition: "Состояние",
            certificate: "Сертификат",
            deliveryLocation: "Место доставки",
            targetDate: "Желаемая дата",
            message: "Сообщение",
          },
        }
      : {
          title: "Edit lead",
          subtitle: "All lead fields and customer contact details.",
          contact: "Contact details",
          request: "Request details",
          message: "Customer message",
          save: "Save",
          saving: "Saving…",
          cancel: "Cancel",
          fields: {
            name: "Name",
            email: "Email",
            phone: "Phone",
            company: "Company",
            role: "Role",
            requestType: "Request type",
            urgency: "Urgency",
            partNumber: "Part number",
            altPartNumber: "Alt part number",
            aircraftType: "Aircraft type",
            tailNumber: "Tail number",
            ataChapter: "ATA chapter",
            quantity: "Quantity",
            condition: "Condition",
            certificate: "Certificate",
            deliveryLocation: "Delivery location",
            targetDate: "Target date",
            message: "Message",
          },
        };

  const save = useMutation({
    mutationFn: () => {
      const original = toDraft(lead);
      const changes: Partial<Record<EditableKey, string | null>> = {};
      (Object.keys(draft) as EditableKey[]).forEach((key) => {
        if ((draft[key] ?? "") !== (original[key] ?? "")) {
          changes[key] = draft[key] ?? "";
        }
      });
      if ("targetDate" in changes) {
        changes.targetDate = changes.targetDate ? changes.targetDate : null;
      }
      return api(`/leads/${lead.id}`, {
        method: "PATCH",
        body: JSON.stringify(changes),
      });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["lead", String(lead.id)] });
      qc.invalidateQueries({ queryKey: ["leads"] });
      onClose();
    },
    onError: (err) => setError(err instanceof ApiError ? err.message : "Failed to save"),
  });

  function field(
    key: EditableKey,
    type: "text" | "email" | "tel" | "date" | "textarea" | "select-urgency" | "select-type" = "text",
  ) {
    const value = draft[key] ?? "";
    const update = (v: string) => setDraft({ ...draft, [key]: v });

    return (
      <label className="flex min-w-0 flex-col gap-1.5">
        <span className="text-[11px] font-bold uppercase tracking-wide text-brand-700/60">
          {labels.fields[key]}
        </span>
        {type === "textarea" ? (
          <textarea
            value={value}
            onChange={(e) => update(e.target.value)}
            rows={4}
            className="w-full min-w-0 resize-y rounded-xl border border-[rgba(6,44,73,0.14)] bg-white px-3.5 py-2.5 text-sm text-brand-900 focus-visible:outline-none focus-visible:border-accent-500 focus-visible:ring-4 focus-visible:ring-accent-500/15"
          />
        ) : type === "select-urgency" ? (
          <Select value={value} onChange={(e) => update(e.target.value)} className="min-w-0">
            <option value="">—</option>
            {URGENCIES.map((u) => (
              <option key={u} value={u}>
                {u}
              </option>
            ))}
          </Select>
        ) : type === "select-type" ? (
          <Select value={value} onChange={(e) => update(e.target.value)} className="min-w-0">
            <option value="">—</option>
            {REQUEST_TYPES.map((u) => (
              <option key={u} value={u}>
                {u}
              </option>
            ))}
          </Select>
        ) : (
          <Input
            type={type}
            value={value}
            onChange={(e) => update(e.target.value)}
            className="min-w-0"
          />
        )}
      </label>
    );
  }

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    save.mutate();
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-stretch justify-center bg-brand-900/40 p-0 backdrop-blur-sm sm:items-center sm:p-4"
      onClick={onClose}
    >
      <div
        className="flex h-full w-full max-w-3xl flex-col overflow-hidden bg-white shadow-[0_28px_70px_rgba(6,44,73,0.20)] sm:h-auto sm:max-h-[90vh] sm:rounded-[28px] sm:border sm:border-[rgba(6,44,73,0.08)]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header — sticky */}
        <div className="flex shrink-0 items-start justify-between gap-4 border-b border-[rgba(6,44,73,0.08)] bg-white px-5 py-4 sm:px-7 sm:py-5">
          <div className="min-w-0">
            <h2 className="truncate text-lg font-black tracking-tight text-brand-700 sm:text-2xl">
              {labels.title}
            </h2>
            <p className="mt-0.5 truncate text-xs text-brand-700/60 sm:text-sm">{labels.subtitle}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-brand-700/50 hover:bg-brand-50 hover:text-brand-700"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
          {/* Scrollable body */}
          <div className="flex-1 space-y-5 overflow-y-auto px-5 py-5 sm:px-7 sm:py-6">
            <fieldset className="space-y-3 rounded-2xl border border-[rgba(6,44,73,0.06)] bg-brand-50/30 p-4">
              <legend className="px-2 text-[11px] font-black uppercase tracking-[0.16em] text-brand-700">
                {labels.contact}
              </legend>
              <div className="grid gap-3 sm:grid-cols-2">
                {field("name")}
                {field("company")}
                {field("email", "email")}
                {field("phone", "tel")}
                {field("role")}
              </div>
            </fieldset>

            <fieldset className="space-y-3 rounded-2xl border border-[rgba(6,44,73,0.06)] bg-brand-50/30 p-4">
              <legend className="px-2 text-[11px] font-black uppercase tracking-[0.16em] text-brand-700">
                {labels.request}
              </legend>
              <div className="grid gap-3 sm:grid-cols-2">
                {field("requestType", "select-type")}
                {field("urgency", "select-urgency")}
                {field("partNumber")}
                {field("altPartNumber")}
                {field("aircraftType")}
                {field("tailNumber")}
                {field("ataChapter")}
                {field("quantity")}
                {field("condition")}
                {field("certificate")}
                {field("targetDate", "date")}
                {field("deliveryLocation")}
              </div>
            </fieldset>

            <fieldset className="space-y-3 rounded-2xl border border-[rgba(6,44,73,0.06)] bg-brand-50/30 p-4">
              <legend className="px-2 text-[11px] font-black uppercase tracking-[0.16em] text-brand-700">
                {labels.message}
              </legend>
              {field("message", "textarea")}
            </fieldset>

            {error && (
              <p className="rounded-xl bg-red-50 px-3.5 py-2.5 text-sm font-medium text-red-700 ring-1 ring-red-200">
                {error}
              </p>
            )}
          </div>

          {/* Footer — always visible */}
          <div className="flex shrink-0 items-center justify-end gap-2 border-t border-[rgba(6,44,73,0.08)] bg-white px-5 py-4 sm:px-7">
            <Button type="button" variant="secondary" onClick={onClose}>
              {labels.cancel}
            </Button>
            <Button type="submit" disabled={save.isPending}>
              <Save size={14} />
              {save.isPending ? labels.saving : labels.save}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
