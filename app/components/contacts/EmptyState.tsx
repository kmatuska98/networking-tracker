import Link from "next/link";
import { Button, buttonVariants } from "@/components/ui/button";

interface EmptyStateProps {
  hasActiveFilters: boolean;
  onClearFilters: () => void;
}

export function EmptyState({ hasActiveFilters, onClearFilters }: EmptyStateProps) {
  if (hasActiveFilters) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed py-16 text-center">
        <p className="text-sm text-muted-foreground">No contacts match this filter.</p>
        <Button variant="outline" size="sm" onClick={onClearFilters}>
          Clear filters
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed py-16 text-center">
      <p className="text-sm text-muted-foreground">
        You haven&apos;t added any contacts yet.
      </p>
      <Link href="/contacts/new" className={buttonVariants({ size: "sm" })}>
        Add your first contact
      </Link>
    </div>
  );
}
