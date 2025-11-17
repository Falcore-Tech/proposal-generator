import { Card } from "@/components/ui/design-card";

function ProposalCardSkeleton() {
  return (
    <Card className="p-6 animate-pulse">
      <div className="flex justify-between items-start mb-4">
        <div className="space-y-2">
          <div className="h-6 w-48 bg-neutral-800 rounded" />
          <div className="h-4 w-32 bg-neutral-800 rounded" />
        </div>
        <div className="h-6 w-20 bg-neutral-800 rounded-full" />
      </div>
      <div className="space-y-3">
        <div className="h-4 w-full bg-neutral-800 rounded" />
        <div className="h-4 w-3/4 bg-neutral-800 rounded" />
      </div>
      <div className="mt-4 flex gap-2">
        <div className="h-9 w-24 bg-neutral-800 rounded" />
        <div className="h-9 w-24 bg-neutral-800 rounded" />
      </div>
    </Card>
  );
}

export default function ProposalsListSkeleton() {
  return (
    <div className="space-y-6">
      {/* Filter tabs skeleton */}
      <div className="flex gap-2">
        <div className="h-10 w-full bg-neutral-800 rounded animate-pulse" />
      </div>

      {/* Search bar skeleton */}
      <div className="h-10 w-full max-w-md bg-neutral-800 rounded animate-pulse" />

      {/* Proposal cards skeleton */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <ProposalCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}
