import { cn, STATUS_FR } from "@/lib/utils";
import type { BookingStatus } from "@/types/database";

export function StatusBadge({ status, className }: { status: BookingStatus; className?: string }) {
  const styles: Record<BookingStatus, string> = {
    en_attente: "bg-amber-100 text-amber-800 border-amber-200",
    confirme: "bg-emerald-100 text-emerald-800 border-emerald-200",
    annule: "bg-rose-100 text-rose-800 border-rose-200"
  };
  return (
    <span
      data-testid={`status-badge-${status}`}
      className={cn(
        "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border",
        styles[status],
        className
      )}
    >
      <span className={cn("w-1.5 h-1.5 rounded-full",
        status === "en_attente" ? "bg-amber-500" :
        status === "confirme" ? "bg-emerald-500" : "bg-rose-500")} />
      {STATUS_FR[status]}
    </span>
  );
}
