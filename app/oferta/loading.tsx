export default function OfertaLoading() {
  return (
    <div className="min-h-screen pt-32 pb-16 px-4 bg-transparent relative z-10">
      <div className="container mx-auto px-6 animate-pulse">
        {/* Skeleton nagłówka */}
        <div className="mb-16 max-w-2xl">
          <div className="h-4 bg-zinc-200/50 rounded-full w-48 mb-6" />
          <div className="h-16 bg-zinc-200/80 rounded-2xl w-3/4 mb-4" />
          <div className="h-16 bg-zinc-200/80 rounded-2xl w-1/2 mb-6" />
          <div className="h-6 bg-zinc-200/50 rounded-full w-full" />
        </div>

        {/* Skeleton Bento Grid (Zgadza się z layoutem md:grid-cols-4) */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 md:auto-rows-[240px] mb-8">
          {/* Karta 1 (Duża - lg) */}
          <div className="bg-white/40 border border-white/50 rounded-4xl p-8 md:col-span-2 md:row-span-2 min-h-[280px] md:min-h-0" />
          {/* Karta 2, 3, 4 (Małe - md) */}
          <div className="bg-white/40 border border-white/50 rounded-4xl p-8 md:col-span-2 md:row-span-1 min-h-[280px] md:min-h-0" />
          <div className="bg-white/40 border border-white/50 rounded-4xl p-8 md:col-span-2 md:row-span-1 min-h-[280px] md:min-h-0" />
          <div className="bg-white/40 border border-white/50 rounded-4xl p-8 md:col-span-2 md:row-span-1 min-h-[280px] md:min-h-0" />
        </div>

        {/* Skeleton Banera Złotych Urwisów */}
        <div className="rounded-4xl bg-white/20 border border-white/50 p-8 md:p-12 h-[300px]" />
      </div>
    </div>
  );
}