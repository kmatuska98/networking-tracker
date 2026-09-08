export const PRIORITIES = ["high", "medium", "low"] as const;

export type Priority = (typeof PRIORITIES)[number];

export interface Contact {
  id: string;
  user_id: string;
  name: string;
  company: string | null;
  role: string | null;
  met_at: string | null;
  notes: string | null;
  priority: Priority;
  next_follow_up_date: string | null;
  created_at: string;
  updated_at: string;
}

export interface ContactInput {
  name: string;
  company?: string | null;
  role?: string | null;
  met_at?: string | null;
  notes?: string | null;
  priority: string;
  next_follow_up_date?: string | null;
}

export type SortField = "name" | "priority" | "next_follow_up_date" | "created_at";
export type SortDirection = "asc" | "desc";
