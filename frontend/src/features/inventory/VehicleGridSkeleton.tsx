/** Placeholder cards shown while the first page of cars loads. */
export function VehicleGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div aria-hidden="true" className="contents">
      {Array.from({ length: count }, (_, index) => (
        <div key={index} className="overflow-hidden rounded-lg border border-line bg-surface">
          <div className="skeleton aspect-[16/10]" />
          <div className="space-y-2.5 p-4">
            <div className="skeleton h-5 w-2/3 rounded-sm" />
            <div className="skeleton h-4 w-1/3 rounded-sm" />
            <div className="skeleton mt-5 h-6 w-1/2 rounded-sm" />
            <div className="skeleton mt-5 h-11 w-full rounded-md" />
          </div>
        </div>
      ))}
    </div>
  );
}
