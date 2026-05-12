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
