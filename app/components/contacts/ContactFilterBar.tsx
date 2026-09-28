import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PRIORITIES, PRIORITY_LABELS, RELATIONSHIP_STAGES, RELATIONSHIP_STAGE_LABELS } from "@/lib/types/contact";

interface ContactFilterBarProps {
  priority: string;
  stage: string;
  search: string;
  onPriorityChange: (value: string) => void;
  onStageChange: (value: string) => void;
  onSearchChange: (value: string) => void;
}

const PRIORITY_ITEMS = [
  { value: "all", label: "All priorities" },
  ...PRIORITIES.map((value) => ({ value, label: PRIORITY_LABELS[value] })),
];

const STAGE_ITEMS = [
  { value: "all", label: "All stages" },
  ...RELATIONSHIP_STAGES.map((value) => ({ value, label: RELATIONSHIP_STAGE_LABELS[value] })),
];

export function ContactFilterBar({
  priority,
  stage,
  search,
  onPriorityChange,
  onStageChange,
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
      <Select items={PRIORITY_ITEMS} value={priority} onValueChange={(value) => onPriorityChange(value ?? "all")}>
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
      <Select items={STAGE_ITEMS} value={stage} onValueChange={(value) => onStageChange(value ?? "all")}>
        <SelectTrigger className="sm:w-48" aria-label="Filter by relationship stage">
          <SelectValue placeholder="All stages" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All stages</SelectItem>
          {RELATIONSHIP_STAGES.map((value) => (
            <SelectItem key={value} value={value}>
              {RELATIONSHIP_STAGE_LABELS[value]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
