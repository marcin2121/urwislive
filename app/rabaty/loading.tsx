export default function RabatyLoading() {
  return (
    <div className="min-h-screen pt-28 pb-12 px-4 flex justify-center bg-zinc-50 relative z-30">
      <div className="w-full max-w-2xl animate-pulse space-y-12">
        
        {/* Koło fortuny skeleton (Zajmuje dokładnie tyle samo miejsca co załadowane) */}
        <div className="bg-white p-6 md:p-8 rounded-[2rem] shadow-xl border border-zinc-100 flex flex-col items-center justify-center min-h-[500px] md:min-h-[550px]">
          <div className="h-8 bg-zinc-200/80 rounded-full w-2/3 md:w-1/2 mb-2" />
          <div className="h-4 bg-zinc-200/50 rounded-full w-1/3 mb-10" />
          <div className="w-64 h-64 md:w-80 md:h-80 bg-zinc-200/60 rounded-full mb-8" />
          <div className="h-14 w-full md:w-64 bg-zinc-200/80 rounded-2xl" />
        </div>

        {/* Sekcja Kuponów skeleton */}
        <div className="space-y-6">
          <div className="text-center space-y-2 mb-8">
            <div className="h-10 bg-zinc-200/80 rounded-full w-2/3 md:w-1/2 mx-auto" />
            <div className="h-4 bg-zinc-200/50 rounded-full w-1/3 mx-auto" />
          </div>

          <div className="h-12 bg-white rounded-2xl w-full border border-zinc-200 shadow-sm" />
          
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="bg-white rounded-[2rem] p-6 md:p-8 flex flex-col md:flex-row items-start justify-between gap-6 shadow-xl border border-zinc-100">
                <div className="w-full space-y-3">
                  <div className="flex gap-2 mb-3">
                     <div className="h-5 w-20 bg-zinc-200/60 rounded-full" />
                     <div className="h-5 w-24 bg-zinc-200/60 rounded-full" />
                  </div>
                  <div className="h-8 bg-zinc-200/80 rounded-lg w-3/4" />
                  <div className="h-4 bg-zinc-200/50 rounded-lg w-1/2" />
                </div>
                <div className="h-12 w-full md:w-36 bg-zinc-200/80 rounded-2xl shrink-0 mt-2 md:mt-0" />
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}