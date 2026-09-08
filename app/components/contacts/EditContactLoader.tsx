"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { buttonVariants } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import type { Contact } from "@/lib/types/contact";
import { ContactForm } from "./ContactForm";

type Status = "loading" | "success" | "error" | "not-found";

export function EditContactLoader({ contactId }: { contactId: string }) {
  const [status, setStatus] = useState<Status>("loading");
  const [contact, setContact] = useState<Contact | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setStatus("loading");
      try {
        const response = await fetch(`/api/contacts/${contactId}`, { credentials: "include" });
        const body = await response.json();
        if (cancelled) return;

        if (response.status === 404) {
          setStatus("not-found");
          return;
        }
        if (!response.ok) {
          setStatus("error");
          return;
        }

        setContact(body.contact);
        setStatus("success");
      } catch {
        if (!cancelled) setStatus("error");
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [contactId]);

  if (status === "loading") {
    return (
      <div className="space-y-3">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-24 w-full" />
      </div>
    );
  }

  if (status === "not-found") {
    return (
      <div className="space-y-3">
        <p className="text-sm text-muted-foreground">
          This contact doesn&apos;t exist, or it doesn&apos;t belong to you.
        </p>
        <Link href="/contacts" className={buttonVariants({ variant: "outline", size: "sm" })}>
          Back to contacts
        </Link>
      </div>
    );
  }

  if (status === "error" || !contact) {
    return <p className="text-sm text-destructive">Could not load this contact. Please try again.</p>;
  }

  return (
    <ContactForm
      mode="edit"
      contactId={contact.id}
      initialValues={{
        name: contact.name,
        company: contact.company ?? "",
        role: contact.role ?? "",
        met_at: contact.met_at ?? "",
        notes: contact.notes ?? "",
        priority: contact.priority,
        next_follow_up_date: contact.next_follow_up_date ?? "",
      }}
    />
  );
}
