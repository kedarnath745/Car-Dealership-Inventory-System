/** Placeholder cards shown while the first page of vehicles loads. */
export function VehicleGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div aria-hidden="true" className="contents">
      {Array.from({ length: count }, (_, index) => (
        <div key={index} className="rounded-card bg-surface p-2 shadow-card">
          <div className="skeleton aspect-[16/10] rounded-card-media" />
          <div className="space-y-2 px-2 pt-3 pb-2">
            <div className="skeleton h-5 w-2/3 rounded-full" />
            <div className="skeleton h-4 w-1/2 rounded-full" />
            <div className="skeleton mt-4 h-5 w-1/3 rounded-full" />
            <div className="skeleton mt-4 h-11 w-full rounded-full" />
          </div>
        </div>
      ))}
    </div>
  );
}
