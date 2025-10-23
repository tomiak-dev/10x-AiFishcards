import { Skeleton } from "@/components/ui/skeleton";

/**
 * Loading state indicator
 */
export const LoadingSpinner = () => {
  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-2 w-full" />
      </div>
      <div className="w-full max-w-2xl mx-auto">
        <Skeleton className="h-64 w-full" />
      </div>
      <div className="flex justify-center">
        <Skeleton className="h-12 w-48" />
      </div>
    </div>
  );
};
