import { validateContactInput } from "@/lib/validation/contact.validation";

describe("validateContactInput", () => {
  it("rejects an empty name", () => {
    const result = validateContactInput({ name: "", priority: "high", relationship_stage: "cold_outreach" });
    expect(result.valid).toBe(false);
    expect(result.errors.name).toBeDefined();
  });

  it("rejects a whitespace-only name", () => {
    const result = validateContactInput({
      name: "   ",
      priority: "medium",
      relationship_stage: "cold_outreach",
    });
    expect(result.valid).toBe(false);
    expect(result.errors.name).toBeDefined();
  });

  it("rejects an invalid priority value", () => {
    const result = validateContactInput({
      name: "Ada Lovelace",
      priority: "urgent",
      relationship_stage: "cold_outreach",
    });
    expect(result.valid).toBe(false);
    expect(result.errors.priority).toBeDefined();
  });

  it("rejects an invalid relationship_stage value", () => {
    const result = validateContactInput({
      name: "Ada Lovelace",
      priority: "high",
      relationship_stage: "best_friend",
    });
    expect(result.valid).toBe(false);
    expect(result.errors.relationship_stage).toBeDefined();
  });

  it("rejects an invalid contact_method value", () => {
    const result = validateContactInput({
      name: "Ada Lovelace",
      priority: "high",
      relationship_stage: "cold_outreach",
      contact_method: "carrier_pigeon",
    });
    expect(result.valid).toBe(false);
    expect(result.errors.contact_method).toBeDefined();
  });

  it("rejects an invalid next_follow_up_date", () => {
    const result = validateContactInput({
      name: "Ada Lovelace",
      priority: "high",
      relationship_stage: "cold_outreach",
      next_follow_up_date: "not-a-date",
    });
    expect(result.valid).toBe(false);
    expect(result.errors.next_follow_up_date).toBeDefined();
  });

  it("rejects an invalid last_contacted_date", () => {
    const result = validateContactInput({
      name: "Ada Lovelace",
      priority: "high",
      relationship_stage: "cold_outreach",
      last_contacted_date: "not-a-date",
    });
    expect(result.valid).toBe(false);
    expect(result.errors.last_contacted_date).toBeDefined();
  });

  it("accepts valid input with all optional fields omitted", () => {
    const result = validateContactInput({
      name: "Ada Lovelace",
      priority: "high",
      relationship_stage: "cold_outreach",
    });
    expect(result.valid).toBe(true);
    expect(Object.keys(result.errors)).toHaveLength(0);
  });

  it("accepts valid input with all fields populated", () => {
    const result = validateContactInput({
      name: "Grace Hopper",
      company: "US Navy",
      role: "Rear Admiral",
      met_at: "Conference",
      notes: "Follow up about COBOL",
      priority: "low",
      next_follow_up_date: "2026-01-01",
      last_contacted_date: "2025-12-01",
      contact_method: "email",
      relationship_stage: "established",
    });
    expect(result.valid).toBe(true);
    expect(Object.keys(result.errors)).toHaveLength(0);
  });
});
