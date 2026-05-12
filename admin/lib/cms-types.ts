export interface PageSummary {
  id: number;
  slug: string;
  title: string;
  updatedAt: string;
  _count: { blocks: number };
}

export interface PageBlock {
  id: number;
  pageId: number;
  type: string;
  order: number;
  enabled: boolean;
  data: Record<string, unknown>;
}

export interface PageSeo {
  id: number;
  pageId: number;
  title: string;
  description: string;
  keywords: string | null;
  ogImage: string | null;
}

export interface PageDetail {
  id: number;
  slug: string;
  title: string;
  updatedAt: string;
  blocks: PageBlock[];
  seo: PageSeo | null;
}
