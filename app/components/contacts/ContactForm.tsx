"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  CONTACT_METHODS,
  CONTACT_METHOD_LABELS,
  PRIORITIES,
  PRIORITY_LABELS,
  RELATIONSHIP_STAGES,
  RELATIONSHIP_STAGE_LABELS,
  type ContactInput,
} from "@/lib/types/contact";

interface ContactFormProps {
  mode: "create" | "edit";
  contactId?: string;
  initialValues?: ContactInput;
}

const EMPTY_VALUES: ContactInput = {
  name: "",
  company: "",
  role: "",
  met_at: "",
  notes: "",
  priority: "medium",
  next_follow_up_date: "",
  last_contacted_date: "",
  contact_method: "",
  relationship_stage: "cold_outreach",
};

const NO_CONTACT_METHOD = "none";

const PRIORITY_ITEMS = PRIORITIES.map((value) => ({ value, label: PRIORITY_LABELS[value] }));
const RELATIONSHIP_STAGE_ITEMS = RELATIONSHIP_STAGES.map((value) => ({
  value,
  label: RELATIONSHIP_STAGE_LABELS[value],
}));
const CONTACT_METHOD_ITEMS = [
  { value: NO_CONTACT_METHOD, label: "Not set" },
  ...CONTACT_METHODS.map((value) => ({ value, label: CONTACT_METHOD_LABELS[value] })),
];

export function ContactForm({ mode, contactId, initialValues }: ContactFormProps) {
  const router = useRouter();
  const [values, setValues] = useState<ContactInput>(initialValues ?? EMPTY_VALUES);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  function updateField<K extends keyof ContactInput>(key: K, value: ContactInput[K]) {
    setValues((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setErrors({});
    setIsSubmitting(true);

    const url = mode === "create" ? "/api/contacts" : `/api/contacts/${contactId}`;
    const method = mode === "create" ? "POST" : "PATCH";

    try {
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(values),
      });
      const body = await response.json();

      if (!response.ok) {
        setErrors(body.errors ?? { form: "Something went wrong." });
        return;
      }

      toast.success(mode === "create" ? "Contact added." : "Contact updated.");
      if (body.calendarWarning) {
        toast.warning(body.calendarWarning as string);
      }
      router.push("/contacts");
      router.refresh();
    } catch {
      setErrors({ form: "Network error. Check your connection and try again." });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5" noValidate>
      <div className="space-y-2">
        <Label htmlFor="name">Name *</Label>
        <Input
          id="name"
          value={values.name}
          onChange={(e) => updateField("name", e.target.value)}
          aria-invalid={Boolean(errors.name)}
        />
        {errors.name ? (
          <p role="alert" className="text-sm text-destructive">
            {errors.name}
          </p>
        ) : null}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="company">Company</Label>
          <Input
            id="company"
            value={values.company ?? ""}
            onChange={(e) => updateField("company", e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="role">Role</Label>
          <Input
            id="role"
            value={values.role ?? ""}
            onChange={(e) => updateField("role", e.target.value)}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="met_at">Where you met</Label>
        <Input
          id="met_at"
          value={values.met_at ?? ""}
          onChange={(e) => updateField("met_at", e.target.value)}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="priority">Priority *</Label>
          <Select
            items={PRIORITY_ITEMS}
            value={values.priority}
            onValueChange={(value) => updateField("priority", value ?? values.priority)}
          >
            <SelectTrigger id="priority" aria-invalid={Boolean(errors.priority)}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="low">Low</SelectItem>
            </SelectContent>
          </Select>
          {errors.priority ? (
            <p role="alert" className="text-sm text-destructive">
              {errors.priority}
            </p>
          ) : null}
        </div>
        <div className="space-y-2">
          <Label htmlFor="relationship_stage">Relationship stage *</Label>
          <Select
            items={RELATIONSHIP_STAGE_ITEMS}
            value={values.relationship_stage}
            onValueChange={(value) => updateField("relationship_stage", value ?? values.relationship_stage)}
          >
            <SelectTrigger id="relationship_stage" aria-invalid={Boolean(errors.relationship_stage)}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {RELATIONSHIP_STAGES.map((value) => (
                <SelectItem key={value} value={value}>
                  {RELATIONSHIP_STAGE_LABELS[value]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.relationship_stage ? (
            <p role="alert" className="text-sm text-destructive">
              {errors.relationship_stage}
            </p>
          ) : null}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="contact_method">Contact method</Label>
          <Select
            items={CONTACT_METHOD_ITEMS}
            value={values.contact_method || NO_CONTACT_METHOD}
            onValueChange={(value) =>
              updateField("contact_method", value === NO_CONTACT_METHOD ? "" : (value ?? ""))
            }
          >
            <SelectTrigger id="contact_method" aria-invalid={Boolean(errors.contact_method)}>
              <SelectValue placeholder="Not set" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={NO_CONTACT_METHOD}>Not set</SelectItem>
              {CONTACT_METHODS.map((value) => (
                <SelectItem key={value} value={value}>
                  {CONTACT_METHOD_LABELS[value]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.contact_method ? (
            <p role="alert" className="text-sm text-destructive">
              {errors.contact_method}
            </p>
          ) : null}
        </div>
        <div className="space-y-2">
          <Label htmlFor="last_contacted_date">Last contacted</Label>
          <Input
            id="last_contacted_date"
            type="date"
            value={values.last_contacted_date ?? ""}
            onChange={(e) => updateField("last_contacted_date", e.target.value)}
            aria-invalid={Boolean(errors.last_contacted_date)}
          />
          {errors.last_contacted_date ? (
            <p role="alert" className="text-sm text-destructive">
              {errors.last_contacted_date}
            </p>
          ) : null}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="next_follow_up_date">Next follow-up date</Label>
        <Input
          id="next_follow_up_date"
          type="date"
          value={values.next_follow_up_date ?? ""}
          onChange={(e) => updateField("next_follow_up_date", e.target.value)}
          aria-invalid={Boolean(errors.next_follow_up_date)}
        />
        <p className="text-sm text-muted-foreground">
          If you&apos;ve connected Google Calendar, setting this automatically creates a reminder.
        </p>
        {errors.next_follow_up_date ? (
          <p role="alert" className="text-sm text-destructive">
            {errors.next_follow_up_date}
          </p>
        ) : null}
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Notes</Label>
        <Textarea
          id="notes"
          rows={4}
          value={values.notes ?? ""}
          onChange={(e) => updateField("notes", e.target.value)}
        />
      </div>

      {errors.form ? (
        <p role="alert" className="text-sm text-destructive">
          {errors.form}
        </p>
      ) : null}

      <div className="flex gap-3">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Saving…" : mode === "create" ? "Add contact" : "Save changes"}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.push("/contacts")}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
