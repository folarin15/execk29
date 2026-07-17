interface SkeletonProps {
  lines?: number;
  width?: string;
}

export function LoadingSkeleton({ lines = 3, width = '100%' }: SkeletonProps) {
  return (
    <div className="space-y-3 animate-pulse" style={{ width }}>
      {Array.from({ length: lines }).map((_, i) => (
        <div key={i} className="h-3 bg-[#e3ddd0] rounded-full" style={{ width: `${100 - i * 15}%` }} />
      ))}
    </div>
  );
}
