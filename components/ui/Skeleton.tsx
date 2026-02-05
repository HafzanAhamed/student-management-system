type SkeletonProps = {
  className?: string;
};

export default function Skeleton({ className }: SkeletonProps) {
  return <div className={`animate-pulse rounded-md bg-surface-2/80 ${className ?? ""}`} />;
}
