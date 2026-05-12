"use client";

import { useLang } from "@/lib/i18n";
import { cn } from "@/lib/utils";

export function LangToggle() {
  const { lang, setLang } = useLang();

  return (
    <div className="grid h-10 grid-cols-2 rounded-full border border-[rgba(6,44,73,0.12)] bg-white p-1 text-xs font-black">
      <button
        type="button"
        onClick={() => setLang("en")}
        className={cn(
          "rounded-full transition",
          lang === "en" ? "bg-brand-700 text-white shadow-sm" : "text-brand-700/60 hover:text-brand-700",
        )}
      >
        EN
      </button>
      <button
        type="button"
        onClick={() => setLang("ru")}
        className={cn(
          "rounded-full transition",
          lang === "ru" ? "bg-brand-700 text-white shadow-sm" : "text-brand-700/60 hover:text-brand-700",
        )}
      >
        RU
      </button>
    </div>
  );
}
