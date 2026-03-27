import { createPortal } from "react-dom";
import { useEffect, useRef, useState } from "react";

interface PreluareAutoHeaderProps {
  esteLucrareAsigurare: boolean;
  mesajeBlocare: string[];
  nrComandaPreview: string;
  pasiFlux: string[];
  pasCurent: number;
  rezumatTotal: string | null;
  stareDosarTipPolita: string | null;
  vehiculSelectat: { nrInmatriculare: string } | null;
}

interface BlurOverlayRect {
  top: number;
  left: number;
  width: number;
  height: number;
}

const RAZA_CARD = 16;
const OVERLAY_EXTINDERE_SUB_CARD = RAZA_CARD + 2;

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
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  // Rect-ul complet al zonei de blur (calculat din main + card)
  const [blurRect, setBlurRect] = useState<BlurOverlayRect | null>(null);

  useEffect(() => {
    if (!esteStickyActiv) return;

    const actualizeaza = () => {
      const wrapper = wrapperRef.current;
      if (!wrapper) return;

      const main = wrapper.closest("main");
      const section = wrapper.closest("section");
      const cardRect = wrapper.getBoundingClientRect();

      const mainRect =
        main instanceof HTMLElement
          ? main.getBoundingClientRect()
          : { top: 0, left: 0, width: window.innerWidth };

      const sectionRect =
        section instanceof HTMLElement
          ? section.getBoundingClientRect()
          : cardRect;
      const overlayTop = Math.max(sectionRect.top, (mainRect as DOMRect).top);
      const height = Math.max(
        cardRect.top - overlayTop + OVERLAY_EXTINDERE_SUB_CARD,
        0,
      );

      setBlurRect({
        top: overlayTop,
        left: cardRect.left,
        width: cardRect.width,
        height,
      });
    };

    actualizeaza();

    const main = wrapperRef.current?.closest("main");
    const target = main instanceof HTMLElement ? main : window;

    target.addEventListener("scroll", actualizeaza, { passive: true });
    window.addEventListener("resize", actualizeaza);

    return () => {
      target.removeEventListener("scroll", actualizeaza);
      window.removeEventListener("resize", actualizeaza);
    };
  }, [esteStickyActiv]);

  return (
    <>
      {/* Portal: blur-ul iese din orice stacking context și se poziționează
          exact deasupra cardului, pe lățimea lui main (nu acoperă sidebar-ul) */}
      {esteStickyActiv && blurRect
        ? createPortal(
            <div
              aria-hidden="true"
              style={{
                position: "fixed",
                top: blurRect.top,
                left: blurRect.left,
                width: blurRect.width,
                height: blurRect.height,
                zIndex: 39,
                pointerEvents: "none",
                backdropFilter: "blur(12px)",
                WebkitBackdropFilter: "blur(12px)",
                background: "rgba(255, 255, 255, 0.16)",
                borderBottomLeftRadius: `${RAZA_CARD}px`,
                borderBottomRightRadius: `${RAZA_CARD}px`,
              }}
            />,
            document.body,
          )
        : null}

      <div
        ref={wrapperRef}
        className={`pointer-events-none relative transition-all duration-300 ${
          esteStickyActiv ? "sticky top-0 z-40 mb-6" : "z-0"
        }`}
      >
        <div
          className={`pointer-events-auto relative z-10 isolate border transition-all duration-300 ${
            esteStickyActiv
              ? "rounded-2xl border-indigo-100/70 bg-transparent px-5 py-4 shadow-md shadow-slate-900/5"
              : "rounded-2xl border-slate-100 bg-white p-8 shadow-sm"
          }`}
        >
          {esteStickyActiv ? (
            <>
              <div className="absolute inset-0 -z-10 rounded-2xl bg-white/38 backdrop-blur-[32px] backdrop-saturate-150" />
              <div className="absolute inset-0 -z-10 rounded-2xl bg-gradient-to-b from-white/50 via-white/34 to-white/30" />
            </>
          ) : null}

          {!vehiculSelectat ? (
            <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <h3 className="text-2xl font-bold tracking-tight text-slate-800">
                  Preluare auto
                </h3>
                <p className="mt-1 text-sm text-slate-500">
                  Alege un vehicul pentru a începe fluxul de recepție și a
                  genera devizul inițial.
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
                    Pas {pasCurent}:{" "}
                    <span className="text-slate-600">
                      {pasiFlux[pasCurent - 1]}
                    </span>
                  </span>
                  <div className="flex gap-1">
                    {pasiFlux.map((_, index) => (
                      <div
                        key={index}
                        className={`h-2 rounded-full transition-all duration-300 ${
                          index + 1 === pasCurent
                            ? "w-6 bg-indigo-500 shadow-sm shadow-indigo-200"
                            : index + 1 < pasCurent
                              ? "w-2 bg-emerald-400"
                              : "w-2 bg-slate-200"
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 text-sm">
                <span className="rounded-md border border-indigo-100 bg-indigo-50/80 px-2.5 py-1 font-bold text-indigo-700 shadow-sm">
                  {vehiculSelectat.nrInmatriculare}
                </span>
                <span
                  className={`rounded-md border px-2.5 py-1 text-xs font-medium tracking-wide shadow-sm ${
                    esteLucrareAsigurare
                      ? "border-amber-200 bg-amber-50/80 text-amber-800"
                      : "border-emerald-200 bg-emerald-50/80 text-emerald-800"
                  }`}
                >
                  Plătitor:{" "}
                  <strong className="uppercase">
                    {esteLucrareAsigurare ? "Asigurator" : "Client"}
                  </strong>
                </span>
                {esteLucrareAsigurare && stareDosarTipPolita ? (
                  <span className="rounded-md border border-blue-200 bg-blue-50/80 px-2.5 py-1 text-xs font-bold uppercase tracking-wide text-blue-700 shadow-sm">
                    Dosar: {stareDosarTipPolita}
                  </span>
                ) : null}
                {rezumatTotal ? (
                  <span className="ml-auto rounded-md border border-slate-200 bg-slate-50/80 px-2.5 py-1 font-bold text-slate-700 shadow-sm">
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
                      className="rounded-md border border-rose-200 bg-rose-50/80 px-2 py-1 text-xs font-medium text-rose-700 shadow-sm"
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
    </>
  );
}
