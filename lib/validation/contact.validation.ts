import { PRIORITIES, type ContactInput, type Priority } from "@/lib/types/contact";

export interface ValidationResult {
  valid: boolean;
  errors: Record<string, string>;
}

/**
 * Pure validation for contact create/update payloads. No DB or network access,
 * so it can be unit tested directly and reused by both the create (POST) and
 * update (PATCH) API route handlers before any Data API call is made.
 *
 * This is intentionally duplicated by the database's NOT NULL/CHECK (name) and
 * ENUM (priority) constraints in db/schema.sql — this layer gives fast,
 * field-specific error messages; the DB layer is the backstop that still holds
 * even if this function is ever bypassed or a new code path forgets to call it.
 */
export function validateContactInput(input: ContactInput): ValidationResult {
  const errors: Record<string, string> = {};

  if (!input.name || input.name.trim().length === 0) {
    errors.name = "Name is required and cannot be empty.";
  }

  if (!PRIORITIES.includes(input.priority as Priority)) {
    errors.priority = `Priority must be one of: ${PRIORITIES.join(", ")}.`;
  }

  if (input.next_follow_up_date) {
    const parsed = Date.parse(input.next_follow_up_date);
    if (Number.isNaN(parsed)) {
      errors.next_follow_up_date = "Next follow-up date must be a valid date.";
    }
  }

  return { valid: Object.keys(errors).length === 0, errors };
}
