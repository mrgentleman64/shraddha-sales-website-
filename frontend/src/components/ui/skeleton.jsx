import clsx from 'clsx';

export function Skeleton({ className }) {
  return <div className={clsx('skeleton-shimmer rounded-2xl', className)} aria-hidden="true" />;
}

export function ProductGridSkeleton({ count = 6 }) {
  return (
    <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3" aria-label="Loading products">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="section-panel overflow-hidden p-5">
          <Skeleton className="h-56 w-full rounded-[1.35rem]" />
          <Skeleton className="mt-5 h-4 w-28" />
          <Skeleton className="mt-3 h-5 w-4/5" />
          <Skeleton className="mt-3 h-4 w-20" />
          <Skeleton className="mt-6 h-11 w-full" />
        </div>
      ))}
    </div>
  );
}
