import type { ObjectId } from "mongodb";

export interface Founder {
  name: string;
  position: string;
}

export interface FounderDoc extends Founder {
  _id: ObjectId;
  startupId: ObjectId;
  createdAt: string;
}

export interface Funding {
  name: string;
  from: string;
  amount: number;
  link: string;
  dateAwarded?: string | null;
}

export interface FundingDoc extends Funding {
  _id: ObjectId;
  startupId: ObjectId;
  createdAt: string;
}

export interface FundingInput {
  name: string;
  from: string;
  amount: number | string;
  link: string;
  dateAwarded?: string | null;
}

export interface Startup {
  _id: string;
  slug: string;
  companyName: string;
  productName: string;
  dateFounded: string | null;
  address: string;
  lat: number | null;
  lng: number | null;
  website: string;
  employeeRange: string;
  description: string;
  province: string;
  logo: string;
  featured: boolean;
  status: "active" | "inactive";
  founders: Founder[];
  fundings: Funding[];
  totalFunding: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface StartupDoc {
  _id: ObjectId;
  slug?: string;
  companyName: string;
  productName: string;
  dateFounded: string | null;
  address: string;
  lat: number | null;
  lng: number | null;
  website: string;
  employeeRange: string;
  description: string;
  province: string;
  logo: string;
  featured: boolean;
  status: "active" | "inactive";
  createdAt: string;
  updatedAt: string;
}

export interface ContentItem {
  _id: string;
  title: string;
  slug?: string;
  subtitle?: string;
  excerpt?: string;
  content?: string;
  image?: string;
  link?: string;
  category?: string;
  author?: string;
  featured?: boolean;
  active?: boolean;
  sortOrder?: number;
  published?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface ContentDoc {
  _id: ObjectId;
  title: string;
  slug?: string;
  subtitle?: string;
  excerpt?: string;
  content?: string;
  image?: string;
  link?: string;
  category?: string;
  author?: string;
  featured?: boolean;
  active?: boolean;
  sortOrder?: number;
  published?: boolean;
  createdAt: string;
  updatedAt: string;
}

export type CollectionName =
  | "startups"
  | "founders"
  | "fundings"
  | "news"
  | "blogs"
  | "carousel_items"
  | "government_pages";

export interface Province {
  name: string;
  slug: string;
}

export interface AnalyticsData {
  totals: {
    startups: number;
    founders: number;
    news: number;
    blogs: number;
    carousel: number;
    government: number;
  };
  byProvince: Record<string, number>;
  byEmployeeRange: Record<string, number>;
  byYear: Record<string, number>;
  featured: number;
  inactive: number;
  recent: {
    _id: string;
    companyName: string;
    province: string;
    createdAt: string;
  }[];
}

export interface FounderInput {
  name: string;
  position: string;
}

/**
 * Canonical payload produced by the LocationPicker component.
 * Returned from the `onChange` callback so callers get the full location object.
 */
export interface LocationPayload {
  address: string;
  lat: number;
  lng: number;
  placeId?: string;
}

export interface VisitDoc {
  visitorId: string;
  path: string;
  durationMs: number;
  visitedAt: Date;
}

export interface TrafficPageStat {
  path: string;
  views: number;
  totalDurationMs: number;
  avgDurationMs: number;
}

export type TrafficRange = "day" | "week" | "month" | "year" | "all";

export interface TrafficData {
  totalVisits: number;
  uniqueVisitors: number;
  avgSessionMs: number;
  pages: TrafficPageStat[];
  totalPages: number;
  page: number;
  pageSize: number;
}
