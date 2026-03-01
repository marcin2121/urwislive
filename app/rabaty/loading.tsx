export default function RabatyLoading() {
  return (
    <div className="min-h-screen pt-32 pb-16 px-4 bg-transparent">
      <div className="max-w-2xl mx-auto animate-pulse space-y-8">
        <div className="h-12 bg-zinc-200/50 rounded-full w-2/3 mx-auto" />
        <div className="h-5 bg-zinc-200/30 rounded-full w-1/2 mx-auto" />

        {/* Koło fortuny skeleton */}
        <div className="aspect-square max-w-sm mx-auto bg-zinc-200/30 rounded-full mt-8" />

        {/* Kupony skeleton */}
        <div className="space-y-4 mt-8">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="bg-white/40 border border-white/50 rounded-3xl p-6 flex items-center gap-4">
              <div className="w-16 h-16 bg-zinc-200/40 rounded-2xl shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-5 bg-zinc-200/50 rounded-full w-3/4" />
                <div className="h-4 bg-zinc-200/30 rounded-full w-1/2" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
