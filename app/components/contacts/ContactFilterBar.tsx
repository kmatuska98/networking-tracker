import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface ContactFilterBarProps {
  priority: string;
  search: string;
  onPriorityChange: (value: string) => void;
  onSearchChange: (value: string) => void;
}

export function ContactFilterBar({
  priority,
  search,
  onPriorityChange,
  onSearchChange,
}: ContactFilterBarProps) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
      <Input
        placeholder="Search by name or company…"
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
        className="sm:max-w-xs"
        aria-label="Search contacts"
      />
      <Select value={priority} onValueChange={(value) => onPriorityChange(value ?? "all")}>
        <SelectTrigger className="sm:w-40" aria-label="Filter by priority">
          <SelectValue placeholder="All priorities" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All priorities</SelectItem>
          <SelectItem value="high">High</SelectItem>
          <SelectItem value="medium">Medium</SelectItem>
          <SelectItem value="low">Low</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
