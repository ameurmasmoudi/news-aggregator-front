export default function Loading() {
  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="overflow-hidden rounded-xl border border-hairline bg-surface">
          <div className="aspect-[16/10] w-full animate-pulse bg-white/[0.06]" />
          <div className="flex flex-col gap-3 p-4">
            <div className="h-3 w-20 animate-pulse rounded bg-white/[0.08]" />
            <div className="h-4 w-full animate-pulse rounded bg-white/[0.08]" />
            <div className="h-4 w-2/3 animate-pulse rounded bg-white/[0.08]" />
          </div>
        </div>
      ))}
    </div>
  );
}
