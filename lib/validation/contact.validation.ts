import {
  CONTACT_METHODS,
  PRIORITIES,
  RELATIONSHIP_STAGES,
  type ContactInput,
  type ContactMethod,
  type Priority,
  type RelationshipStage,
} from "@/lib/types/contact";

export interface ValidationResult {
  valid: boolean;
  errors: Record<string, string>;
}

function isValidDateString(value: string): boolean {
  return !Number.isNaN(Date.parse(value));
}

/**
 * Pure validation for contact create/update payloads. No DB or network access,
 * so it can be unit tested directly and reused by both the create (POST) and
 * update (PATCH) API route handlers before any Data API call is made.
 *
 * This is intentionally duplicated by the database's NOT NULL/CHECK (name) and
 * ENUM (priority, contact_method, relationship_stage) constraints in
 * db/schema.sql — this layer gives fast, field-specific error messages; the DB
 * layer is the backstop that still holds even if this function is ever
 * bypassed or a new code path forgets to call it.
 */
export function validateContactInput(input: ContactInput): ValidationResult {
  const errors: Record<string, string> = {};

  if (!input.name || input.name.trim().length === 0) {
    errors.name = "Name is required and cannot be empty.";
  }

  if (!PRIORITIES.includes(input.priority as Priority)) {
    errors.priority = `Priority must be one of: ${PRIORITIES.join(", ")}.`;
  }

  if (!RELATIONSHIP_STAGES.includes(input.relationship_stage as RelationshipStage)) {
    errors.relationship_stage = `Relationship stage must be one of: ${RELATIONSHIP_STAGES.join(", ")}.`;
  }

  if (input.contact_method && !CONTACT_METHODS.includes(input.contact_method as ContactMethod)) {
    errors.contact_method = `Contact method must be one of: ${CONTACT_METHODS.join(", ")}.`;
  }

  if (input.next_follow_up_date && !isValidDateString(input.next_follow_up_date)) {
    errors.next_follow_up_date = "Next follow-up date must be a valid date.";
  }

  if (input.last_contacted_date && !isValidDateString(input.last_contacted_date)) {
    errors.last_contacted_date = "Last contacted date must be a valid date.";
  }

  return { valid: Object.keys(errors).length === 0, errors };
}
