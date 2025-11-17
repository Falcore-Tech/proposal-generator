import { commonClasses } from "@/lib/design-system";
import { Card } from "@/components/ui/design-card";

export default function ProposalGeneratorSkeleton() {
  return (
    <div className={commonClasses.pageContainer}>
      <div className={commonClasses.contentContainer}>
        <div className="h-9 w-64 bg-neutral-800 rounded mb-8 animate-pulse" />

        {/* Tabs skeleton */}
        <div className="w-full">
          <div className="grid w-full grid-cols-2 mb-8 gap-1 bg-neutral-900 p-1 rounded-lg">
            <div className="h-10 bg-neutral-800 rounded animate-pulse" />
            <div className="h-10 bg-neutral-900 rounded animate-pulse" />
          </div>

          {/* Form skeleton */}
          <div className="space-y-6">
            {/* Client info section */}
            <Card className="p-6 space-y-4 animate-pulse">
              <div className="h-6 w-40 bg-neutral-800 rounded" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="h-4 w-24 bg-neutral-800 rounded" />
                  <div className="h-10 w-full bg-neutral-800 rounded" />
                </div>
                <div className="space-y-2">
                  <div className="h-4 w-24 bg-neutral-800 rounded" />
                  <div className="h-10 w-full bg-neutral-800 rounded" />
                </div>
                <div className="space-y-2">
                  <div className="h-4 w-24 bg-neutral-800 rounded" />
                  <div className="h-10 w-full bg-neutral-800 rounded" />
                </div>
                <div className="space-y-2">
                  <div className="h-4 w-24 bg-neutral-800 rounded" />
                  <div className="h-10 w-full bg-neutral-800 rounded" />
                </div>
              </div>
            </Card>

            {/* Package selection skeleton */}
            <Card className="p-6 space-y-4 animate-pulse">
              <div className="h-6 w-48 bg-neutral-800 rounded" />
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="p-4 border border-neutral-700 rounded-lg space-y-3">
                    <div className="h-5 w-32 bg-neutral-800 rounded" />
                    <div className="h-7 w-24 bg-neutral-800 rounded" />
                    <div className="space-y-2">
                      <div className="h-3 w-full bg-neutral-800 rounded" />
                      <div className="h-3 w-3/4 bg-neutral-800 rounded" />
                      <div className="h-3 w-5/6 bg-neutral-800 rounded" />
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Services skeleton */}
            <Card className="p-6 space-y-4 animate-pulse">
              <div className="h-6 w-44 bg-neutral-800 rounded" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 border border-neutral-700 rounded">
                    <div className="h-5 w-5 bg-neutral-800 rounded" />
                    <div className="flex-1 space-y-1">
                      <div className="h-4 w-32 bg-neutral-800 rounded" />
                      <div className="h-3 w-full bg-neutral-800 rounded" />
                    </div>
                    <div className="h-5 w-16 bg-neutral-800 rounded" />
                  </div>
                ))}
              </div>
            </Card>

            {/* Submit button skeleton */}
            <div className="h-12 w-full bg-neutral-800 rounded animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  );
}
