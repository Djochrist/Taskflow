import { Badge } from "@/components/ui/badge";

export function StatusBadge({ status }: { status: string }) {
  const config: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline", className?: string }> = {
    // Projects
    planning: { label: "Planning", variant: "outline", className: "bg-blue-500/10 text-blue-600 border-blue-500/20" },
    active: { label: "Active", variant: "default", className: "bg-primary/10 text-primary border-primary/20 hover:bg-primary/20" },
    on_hold: { label: "On Hold", variant: "secondary", className: "bg-orange-500/10 text-orange-600 border-orange-500/20" },
    completed: { label: "Completed", variant: "outline", className: "bg-green-500/10 text-green-600 border-green-500/20" },
    cancelled: { label: "Cancelled", variant: "destructive" },
    // Tasks
    todo: { label: "To Do", variant: "outline" },
    in_progress: { label: "In Progress", variant: "default", className: "bg-primary/10 text-primary hover:bg-primary/20 border-primary/20" },
    review: { label: "Review", variant: "secondary", className: "bg-purple-500/10 text-purple-600 border-purple-500/20" },
    done: { label: "Done", variant: "outline", className: "bg-green-500/10 text-green-600 border-green-500/20" },
  };

  const current = config[status] || { label: status, variant: "outline" };

  return (
    <Badge 
      variant={current.variant} 
      className={current.className}
      data-testid={`status-${status}`}
    >
      {current.label}
    </Badge>
  );
}

export function PriorityBadge({ priority }: { priority: string }) {
  const config: Record<string, { label: string; className: string }> = {
    low: { label: "Low", className: "bg-gray-500/10 text-gray-600 border-gray-500/20" },
    medium: { label: "Medium", className: "bg-blue-500/10 text-blue-600 border-blue-500/20" },
    high: { label: "High", className: "bg-orange-500/10 text-orange-600 border-orange-500/20" },
    critical: { label: "Critical", className: "bg-red-500/10 text-red-600 border-red-500/20" },
  };

  const current = config[priority] || { label: priority, className: "" };

  return (
    <Badge 
      variant="outline" 
      className={current.className}
      data-testid={`priority-${priority}`}
    >
      {current.label}
    </Badge>
  );
}
