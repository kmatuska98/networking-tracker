export const PRIORITIES = ["high", "medium", "low"] as const;

export type Priority = (typeof PRIORITIES)[number];

export const PRIORITY_LABELS: Record<Priority, string> = {
  high: "High",
  medium: "Medium",
  low: "Low",
};

export const CONTACT_METHODS = ["phone", "linkedin", "slack", "email", "other"] as const;

export type ContactMethod = (typeof CONTACT_METHODS)[number];

export const RELATIONSHIP_STAGES = ["cold_outreach", "warm_connection", "established"] as const;

export type RelationshipStage = (typeof RELATIONSHIP_STAGES)[number];

export const RELATIONSHIP_STAGE_LABELS: Record<RelationshipStage, string> = {
  cold_outreach: "Cold Outreach",
  warm_connection: "Warm Connection",
  established: "Established",
};

export const CONTACT_METHOD_LABELS: Record<ContactMethod, string> = {
  phone: "Phone",
  linkedin: "LinkedIn",
  slack: "Slack",
  email: "Email",
  other: "Other",
};

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
  last_contacted_date: string | null;
  contact_method: ContactMethod | null;
  relationship_stage: RelationshipStage;
  google_calendar_event_id: string | null;
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
  last_contacted_date?: string | null;
  contact_method?: string | null;
  relationship_stage: string;
}

export type SortField = "name" | "priority" | "next_follow_up_date" | "last_contacted_date" | "created_at";
export type SortDirection = "asc" | "desc";
