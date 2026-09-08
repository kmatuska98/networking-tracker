import { validateContactInput } from "@/lib/validation/contact.validation";

describe("validateContactInput", () => {
  it("rejects an empty name", () => {
    const result = validateContactInput({ name: "", priority: "high" });
    expect(result.valid).toBe(false);
    expect(result.errors.name).toBeDefined();
  });

  it("rejects a whitespace-only name", () => {
    const result = validateContactInput({ name: "   ", priority: "medium" });
    expect(result.valid).toBe(false);
    expect(result.errors.name).toBeDefined();
  });

  it("rejects an invalid priority value", () => {
    const result = validateContactInput({ name: "Ada Lovelace", priority: "urgent" });
    expect(result.valid).toBe(false);
    expect(result.errors.priority).toBeDefined();
  });

  it("rejects an invalid next_follow_up_date", () => {
    const result = validateContactInput({
      name: "Ada Lovelace",
      priority: "high",
      next_follow_up_date: "not-a-date",
    });
    expect(result.valid).toBe(false);
    expect(result.errors.next_follow_up_date).toBeDefined();
  });

  it("accepts valid input with all optional fields omitted", () => {
    const result = validateContactInput({ name: "Ada Lovelace", priority: "high" });
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
    });
    expect(result.valid).toBe(true);
    expect(Object.keys(result.errors)).toHaveLength(0);
  });
});
