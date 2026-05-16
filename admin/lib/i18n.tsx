"use client";

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { api, getToken } from "./api";

export type Lang = "en" | "ru";

const dict = {
  appName: { en: "Jetsonic Admin", ru: "Jetsonic Админ" },

  login: { en: "Sign in", ru: "Вход" },
  email: { en: "Email", ru: "Email" },
  password: { en: "Password", ru: "Пароль" },
  signIn: { en: "Sign in", ru: "Войти" },
  signingIn: { en: "Signing in…", ru: "Входим…" },
  loginError: { en: "Invalid email or password", ru: "Неверный email или пароль" },
  signOut: { en: "Sign out", ru: "Выйти" },

  navLeads: { en: "Leads", ru: "Заявки" },
  navCms: { en: "Site content", ru: "Контент сайта" },
  navSeo: { en: "SEO", ru: "SEO" },
  navUsers: { en: "Users", ru: "Пользователи" },

  leads: { en: "Leads", ru: "Заявки" },
  leadsSubtitle: { en: "Customer requests from the website RFQ form.", ru: "Заявки клиентов с формы RFQ на сайте." },
  search: { en: "Search by name, company, phone, email, part number", ru: "Поиск по имени, компании, телефону, email, номеру детали" },
  filterStatus: { en: "Status", ru: "Статус" },
  filterUrgency: { en: "Urgency", ru: "Срочность" },
  filterAll: { en: "All", ru: "Все" },
  fromDate: { en: "Pick start date", ru: "Выбрать дату с" },
  toDate: { en: "Pick end date", ru: "Выбрать дату по" },
  refresh: { en: "Refresh", ru: "Обновить" },
  exportExcel: { en: "Export to Excel", ru: "Экспорт в Excel" },
  resetFilters: { en: "Reset", ru: "Сбросить" },

  colNumber: { en: "#", ru: "№" },
  colDate: { en: "Date", ru: "Дата" },
  colName: { en: "Name", ru: "Имя" },
  colCompany: { en: "Company", ru: "Компания" },
  colPhone: { en: "Phone", ru: "Телефон" },
  colType: { en: "Type", ru: "Тип" },
  colUrgency: { en: "Urgency", ru: "Срочность" },
  colStatus: { en: "Status", ru: "Статус" },
  colActions: { en: "Actions", ru: "Действия" },
  open: { en: "Open", ru: "Открыть" },

  status_NEW: { en: "New", ru: "Новая" },
  status_IN_PROGRESS: { en: "In progress", ru: "В работе" },
  status_PLANNED: { en: "Planned", ru: "План" },
  status_REJECTED: { en: "Rejected", ru: "Отказался" },
  status_CONVERTED: { en: "Converted", ru: "Продажа" },

  urgency_AOG: { en: "AOG", ru: "AOG" },
  urgency_Priority: { en: "Priority", ru: "Приоритет" },
  urgency_Routine: { en: "Routine", ru: "Плановая" },

  noLeads: { en: "No leads found.", ru: "Заявок не найдено." },
  loading: { en: "Loading…", ru: "Загрузка…" },
  loadError: { en: "Failed to load data.", ru: "Не удалось загрузить данные." },
  total: { en: "Total", ru: "Всего" },
  page: { en: "Page", ru: "Страница" },
  prev: { en: "Previous", ru: "Назад" },
  next: { en: "Next", ru: "Вперёд" },

  users: { en: "Users", ru: "Пользователи" },
  usersSubtitle: { en: "Team members with access to the admin.", ru: "Сотрудники с доступом к админке." },
  addUser: { en: "Add user", ru: "Добавить" },
  editUser: { en: "Edit user", ru: "Редактировать" },
  deleteUser: { en: "Delete", ru: "Удалить" },
  deleteConfirm: { en: "Delete this user?", ru: "Удалить этого пользователя?" },
  name: { en: "Name", ru: "Имя" },
  role: { en: "Role", ru: "Роль" },
  newPassword: { en: "New password (leave empty to keep)", ru: "Новый пароль (пусто — не менять)" },
  cancel: { en: "Cancel", ru: "Отмена" },
  save: { en: "Save", ru: "Сохранить" },
  saving: { en: "Saving…", ru: "Сохранение…" },
  saved: { en: "Saved", ru: "Сохранено" },
  unsaved: { en: "Unsaved changes", ru: "Есть несохранённые изменения" },
  roleAdmin: { en: "Admin", ru: "Админ" },
  roleManager: { en: "Manager", ru: "Менеджер" },

  seoTitle: { en: "Meta title", ru: "Заголовок (Meta title)" },
  seoDescription: { en: "Meta description", ru: "Описание (Meta description)" },
  seoKeywords: { en: "Keywords", ru: "Ключевые слова" },
  seoOgImage: { en: "Social share image (URL)", ru: "Картинка для соцсетей (URL)" },
  seoKeywordsHint: {
    en: "Comma separated, e.g. aircraft parts, AOG, RFQ.",
    ru: "Через запятую, например: запчасти, AOG, RFQ.",
  },
  seoTitleHint: { en: "50–60 characters works best for Google.", ru: "Лучше 50–60 символов для Google." },
  seoDescriptionHint: {
    en: "Up to 160 characters — what shows under the title in search results.",
    ru: "До 160 символов — текст под заголовком в результатах поиска.",
  },
} as const;

type DictKey = keyof typeof dict;

interface LangCtx {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (key: DictKey) => string;
}

const LanguageContext = createContext<LangCtx | null>(null);

const STORAGE_KEY = "jetsonic_admin_lang";

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("en");

  // On mount: local cache first (instant), then sync from backend if logged in.
  useEffect(() => {
    const saved = (typeof window !== "undefined" && (localStorage.getItem(STORAGE_KEY) as Lang | null)) || null;
    if (saved === "en" || saved === "ru") setLangState(saved);

    if (getToken()) {
      api<{ language?: string }>("/auth/me")
        .then((me) => {
          if (me?.language === "ru" || me?.language === "en") {
            setLangState(me.language);
            try {
              localStorage.setItem(STORAGE_KEY, me.language);
            } catch {
              /* ignore */
            }
          }
        })
        .catch(() => {
          /* ignore — keep local lang */
        });
    }
  }, []);

  const setLang = useCallback((l: Lang) => {
    setLangState(l);
    if (typeof window !== "undefined") localStorage.setItem(STORAGE_KEY, l);
    if (getToken()) {
      api("/users/me/language", {
        method: "PATCH",
        body: JSON.stringify({ language: l }),
      }).catch(() => {
        /* silent: local cache still updated */
      });
    }
  }, []);

  const t = useCallback((key: DictKey) => dict[key][lang], [lang]);

  return <LanguageContext.Provider value={{ lang, setLang, t }}>{children}</LanguageContext.Provider>;
}

export function useLang() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLang must be used within LanguageProvider");
  return ctx;
}
