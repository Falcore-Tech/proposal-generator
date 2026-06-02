import { cn } from "@/lib/utils";
import type { AnimatedProposalStatus } from "@/types/animated-proposal";

const STATUS_LABELS: Record<AnimatedProposalStatus, string> = {
  sent:             "Sent",
  client_signed:    "Client Signed",
  counter_signed:   "Counter-Signed",
  paid:             "Paid",
  archived:         "Archived",
};

const STATUS_COLORS: Record<AnimatedProposalStatus, string> = {
  sent:             "bg-blue-900/60 text-blue-300",
  client_signed:    "bg-purple-900/60 text-purple-300",
  counter_signed:   "bg-emerald-900/60 text-emerald-300",
  paid:             "bg-emerald-800/60 text-emerald-200",
  archived:         "bg-zinc-800 text-zinc-500",
};

interface StatusPillProps {
  status: AnimatedProposalStatus;
  className?: string;
}

export function StatusPill({ status, className }: StatusPillProps) {
  return (
    <span
      className={cn(
        "px-3 py-1.5 rounded-full text-xs font-semibold",
        STATUS_COLORS[status] ?? "bg-zinc-700 text-zinc-300",
        className
      )}
    >
      {STATUS_LABELS[status]}
    </span>
  );
}

export { STATUS_LABELS };
