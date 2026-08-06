export default function Loading() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      {/* Skeleton search bar */}
      <div className="space-y-3 mb-8">
        <div className="skeleton h-10 w-full rounded-xl" />
        <div className="flex gap-2 overflow-hidden">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="skeleton h-8 w-24 rounded-full shrink-0" />
          ))}
        </div>
      </div>

      {/* Skeleton job cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-card)] p-5 space-y-3"
          >
            <div className="flex gap-2">
              <div className="skeleton h-5 w-20 rounded-full" />
              <div className="skeleton h-5 w-16 rounded-full" />
            </div>
            <div className="skeleton h-6 w-3/4 rounded-lg" />
            <div className="flex gap-3">
              <div className="skeleton h-4 w-24 rounded" />
              <div className="skeleton h-4 w-20 rounded" />
            </div>
            <div className="space-y-1.5">
              <div className="skeleton h-3.5 w-full rounded" />
              <div className="skeleton h-3.5 w-2/3 rounded" />
            </div>
            <div className="flex gap-2">
              <div className="skeleton h-6 w-20 rounded-lg" />
              <div className="skeleton h-6 w-12 rounded-lg" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
