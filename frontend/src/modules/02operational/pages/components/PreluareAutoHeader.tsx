interface PreluareAutoHeaderProps {
  esteLucrareAsigurare: boolean;
  mesajeBlocare: string[];
  nrComandaPreview: string;
  pasiFlux: string[];
  pasCurent: number;
  rezumatTotal: string | null;
  stareDosarTipPolita: string | null;
  vehiculSelectat: {
    nrInmatriculare: string;
  } | null;
}

export default function PreluareAutoHeader({
  esteLucrareAsigurare,
  mesajeBlocare,
  nrComandaPreview,
  pasiFlux,
  pasCurent,
  rezumatTotal,
  stareDosarTipPolita,
  vehiculSelectat,
}: PreluareAutoHeaderProps) {
  const esteStickyActiv = vehiculSelectat !== null;

  return (
    <div
      className={`relative transition-all duration-300 ${
        esteStickyActiv ? 'sticky top-0 z-40 mb-6' : 'z-0'
      }`}
    >
      {esteStickyActiv ? (
        <>
          <div
            className="pointer-events-none absolute inset-x-4 -top-10 h-24 rounded-t-[28px] backdrop-blur-2xl"
            style={{
              WebkitMaskImage:
                'linear-gradient(to top, transparent 0%, rgba(0,0,0,0.55) 45%, rgba(0,0,0,1) 100%)',
              maskImage:
                'linear-gradient(to top, transparent 0%, rgba(0,0,0,0.55) 45%, rgba(0,0,0,1) 100%)',
            }}
          />
          <div className="pointer-events-none absolute inset-x-4 -top-10 h-24 rounded-t-[28px] bg-gradient-to-t from-white/0 via-white/60 to-white/95" />
        </>
      ) : null}

      <div
        className={`relative border bg-white/92 transition-all duration-300 ${
          esteStickyActiv
            ? 'rounded-2xl border-indigo-100 px-5 py-4 shadow-md backdrop-blur-md'
            : 'rounded-2xl border-slate-100 p-8 shadow-sm'
        }`}
      >
        {!vehiculSelectat ? (
          <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h3 className="text-2xl font-bold tracking-tight text-slate-800">Preluare auto</h3>
              <p className="mt-1 text-sm text-slate-500">
                Alege un vehicul pentru a începe fluxul de recepție și a genera devizul inițial.
              </p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
              Următoarea comandă: <strong>{nrComandaPreview}</strong>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <span className="rounded-md bg-indigo-600 px-3 py-1 text-xs font-bold uppercase tracking-wider text-white shadow-sm">
                PRELUARE
              </span>

              <div className="flex items-center gap-3">
                <span className="hidden text-xs font-semibold uppercase tracking-wider text-indigo-600 sm:block">
                  Pas {pasCurent}: <span className="text-slate-600">{pasiFlux[pasCurent - 1]}</span>
                </span>
                <div className="flex gap-1">
                  {pasiFlux.map((_, index) => (
                    <div
                      key={index}
                      className={`h-2 rounded-full transition-all duration-300 ${
                        index + 1 === pasCurent
                          ? 'w-6 bg-indigo-500 shadow-sm shadow-indigo-200'
                          : index + 1 < pasCurent
                            ? 'w-2 bg-emerald-400'
                            : 'w-2 bg-slate-200'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 text-sm">
              <span className="rounded-md border border-indigo-100 bg-indigo-50 px-2.5 py-1 font-bold text-indigo-700 shadow-sm">
                {vehiculSelectat.nrInmatriculare}
              </span>

              <span
                className={`rounded-md border px-2.5 py-1 text-xs font-medium tracking-wide shadow-sm ${
                  esteLucrareAsigurare
                    ? 'border-amber-200 bg-amber-50 text-amber-800'
                    : 'border-emerald-200 bg-emerald-50 text-emerald-800'
                }`}
              >
                Plătitor:{' '}
                <strong className="uppercase">{esteLucrareAsigurare ? 'Asigurator' : 'Client'}</strong>
              </span>

              {esteLucrareAsigurare && stareDosarTipPolita ? (
                <span className="rounded-md border border-blue-200 bg-blue-50 px-2.5 py-1 text-xs font-bold uppercase tracking-wide text-blue-700 shadow-sm">
                  Dosar: {stareDosarTipPolita}
                </span>
              ) : null}

              {rezumatTotal ? (
                <span className="ml-auto rounded-md border border-slate-200 bg-slate-50 px-2.5 py-1 font-bold text-slate-700 shadow-sm">
                  Total: {rezumatTotal}
                </span>
              ) : null}
            </div>

            {mesajeBlocare.length > 0 ? (
              <div className="mt-2 flex flex-wrap items-center gap-2 border-t border-slate-100/60 pt-3">
                <span className="mr-1 text-xs font-bold uppercase tracking-wide text-rose-600">
                  Câmpuri obligatorii lipsă:
                </span>
                {mesajeBlocare.map((mesaj) => (
                  <span
                    key={mesaj}
                    className="rounded-md border border-rose-200 bg-rose-50 px-2 py-1 text-xs font-medium text-rose-700 shadow-sm"
                  >
                    {mesaj}
                  </span>
                ))}
              </div>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
}
