import { Skeleton, SkeletonGrid } from "@/components/Skeleton";

export default function Loading() {
  return (
    <div className="container-x py-14">
      <div className="mb-10 flex flex-col items-center gap-3">
        <Skeleton className="h-3.5 w-32" />
        <Skeleton className="h-8 w-72" />
        <Skeleton className="h-4 w-64" />
      </div>
      <div className="mb-8 flex flex-wrap justify-center gap-2">
        {Array.from({ length: 7 }, (_, i) => (
          <Skeleton key={i} className="h-9 w-24 rounded-full" />
        ))}
      </div>
      <SkeletonGrid count={6} type="startup" />
    </div>
  );
}
