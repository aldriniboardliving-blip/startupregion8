import { Skeleton, SkeletonGrid } from "@/components/Skeleton";

export default function Loading() {
  return (
    <div className="container-x py-14">
      <div className="mx-auto mb-10 flex max-w-2xl flex-col items-center gap-3 text-center">
        <Skeleton className="h-3.5 w-32" />
        <Skeleton className="h-8 w-72" />
        <Skeleton className="h-4 w-full" />
      </div>
      <SkeletonGrid count={6} type="article" />
    </div>
  );
}
