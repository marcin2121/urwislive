export default function Loading() {
  return (
    <div className="min-h-screen pt-32 pb-16 px-4 bg-transparent">
      <div className="max-w-7xl mx-auto">
        {/* Hero skeleton */}
        <div className="animate-pulse space-y-8">
          <div className="h-10 bg-zinc-200/50 rounded-full w-2/3 max-w-md" />
          <div className="h-6 bg-zinc-200/40 rounded-full w-1/2 max-w-sm" />

          {/* Cards grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-12">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="bg-white/40 backdrop-blur-xl border border-white/50 rounded-[2rem] p-6 space-y-4"
              >
                <div className="h-40 bg-zinc-200/40 rounded-2xl" />
                <div className="h-5 bg-zinc-200/50 rounded-full w-3/4" />
                <div className="h-4 bg-zinc-200/30 rounded-full w-1/2" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
