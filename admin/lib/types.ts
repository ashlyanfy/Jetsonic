export type Role = "ADMIN" | "MANAGER";

export type LeadStatus =
  | "NEW"
  | "IN_PROGRESS"
  | "PLANNED"
  | "REJECTED"
  | "CONVERTED";

export type Urgency = "AOG" | "Priority" | "Routine";

export interface User {
  id: string;
  email: string;
  name: string | null;
  role: Role;
}

export interface LeadNote {
  id: number;
  body: string;
  author?: { id: string; name: string | null; email: string } | null;
  createdAt: string;
}

export interface LeadAssignee {
  id: string;
  name: string | null;
  email: string;
  role: Role;
}

export interface Lead {
  id: number;
  createdAt: string;
  updatedAt: string;
  name: string;
  company: string | null;
  role: string | null;
  email: string;
  phone: string | null;
  requestType: string | null;
  urgency: string | null;
  partNumber: string | null;
  altPartNumber: string | null;
  aircraftType: string | null;
  tailNumber: string | null;
  ataChapter: string | null;
  quantity: string | null;
  condition: string | null;
  certificate: string | null;
  targetDate: string | null;
  deliveryLocation: string | null;
  attachmentUrl: string | null;
  message: string | null;
  source: string | null;
  status: LeadStatus;
  assigneeId: string | null;
  assignee: LeadAssignee | null;
  notes?: LeadNote[];
}

export interface LeadListResponse {
  items: Lead[];
  total: number;
  page: number;
  pageSize: number;
  pages: number;
}

export interface LeadFilters {
  status?: LeadStatus | "";
  urgency?: string | "";
  q?: string;
  from?: string;
  to?: string;
  page?: number;
  pageSize?: number;
}

// ---------- Site analytics (first-party visitor actions) ----------

export type SiteEventType =
  | "PAGE_VIEW"
  | "WHATSAPP"
  | "CALL"
  | "EMAIL"
  | "FORM_START"
  | "RFQ_SUBMIT";

export interface SiteEvent {
  id: number;
  type: SiteEventType;
  page: string | null;
  visitorId: string;
  createdAt: string;
}

export interface SiteEventListResponse {
  items: SiteEvent[];
  total: number;
  page: number;
  pageSize: number;
  pages: number;
}

export interface SiteEventStats {
  pageViews: number;
  whatsapp: number;
  call: number;
  email: number;
  formStart: number;
  rfqSubmit: number;
  uniqueVisitors: number;
  actions: number;
  total: number;
}

export interface SiteEventDailyPoint {
  date: string;
  views: number;
  actions: number;
  visitors: number;
}

export interface SiteEventPageRow {
  page: string;
  pageViews: number;
  whatsapp: number;
  call: number;
  email: number;
  formStart: number;
  rfqSubmit: number;
  total: number;
}

export interface SiteEventPageBreakdown {
  items: SiteEventPageRow[];
}
