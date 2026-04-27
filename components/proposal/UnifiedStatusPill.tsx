const ANIMATED_LABELS: Record<string, string> = {
  draft: "Draft",
  pending_approval: "Pending Approval",
  approved: "Approved",
  sent: "Sent",
  client_signed: "Client Signed",
  counter_signed: "Counter Signed",
  paid: "Paid",
  archived: "Archived",
};

const CLASSIC_LABELS: Record<string, string> = {
  draft: "Draft",
  sent: "Sent",
  accepted: "Accepted",
  paid: "Paid",
  rejected: "Rejected",
  expired: "Expired",
  archived: "Archived",
};

const STATUS_CLASSES: Record<string, string> = {
  draft: "bg-status-draft text-status-draft-foreground",
  sent: "bg-status-sent text-status-sent-foreground",
  accepted: "bg-status-accepted text-status-accepted-foreground",
  paid: "bg-status-paid text-status-paid-foreground",
  rejected: "bg-status-rejected text-status-rejected-foreground",
  expired: "bg-status-expired text-status-expired-foreground",
  archived: "bg-status-expired text-status-expired-foreground",
  pending_approval: "bg-yellow-500/20 text-yellow-400",
  approved: "bg-emerald-500/20 text-emerald-400",
  client_signed: "bg-blue-500/20 text-blue-400",
  counter_signed: "bg-indigo-500/20 text-indigo-400",
};

interface Props {
  kind: "classic" | "animated";
  status: string;
}

export function UnifiedStatusPill({ kind, status }: Props) {
  const label = kind === "animated"
    ? (ANIMATED_LABELS[status] ?? status)
    : (CLASSIC_LABELS[status] ?? status);

  const classes = STATUS_CLASSES[status] ?? "bg-surface-elevated text-text-muted";

  return (
    <span className={`inline-flex items-center rounded px-2 py-1 text-xs font-medium ${classes}`}>
      {label}
    </span>
  );
}
