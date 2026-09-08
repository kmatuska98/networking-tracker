"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { ContactInput } from "@/lib/types/contact";

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
};

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
          <Label htmlFor="next_follow_up_date">Next follow-up date</Label>
          <Input
            id="next_follow_up_date"
            type="date"
            value={values.next_follow_up_date ?? ""}
            onChange={(e) => updateField("next_follow_up_date", e.target.value)}
            aria-invalid={Boolean(errors.next_follow_up_date)}
          />
          {errors.next_follow_up_date ? (
            <p role="alert" className="text-sm text-destructive">
              {errors.next_follow_up_date}
            </p>
          ) : null}
        </div>
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
