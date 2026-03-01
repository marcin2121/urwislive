export default function OfertaLoading() {
  return (
    <div className="min-h-screen pt-32 pb-16 px-4 bg-transparent">
      <div className="max-w-7xl mx-auto animate-pulse space-y-8">
        <div className="h-12 bg-zinc-200/50 rounded-full w-1/2 max-w-lg" />
        <div className="h-5 bg-zinc-200/30 rounded-full w-1/3 max-w-sm" />

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-8">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="bg-white/40 border border-white/50 rounded-3xl p-4 space-y-3">
              <div className="aspect-square bg-zinc-200/40 rounded-2xl" />
              <div className="h-4 bg-zinc-200/50 rounded-full w-3/4" />
              <div className="h-3 bg-zinc-200/30 rounded-full w-1/2" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
