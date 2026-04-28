import { createPortal } from "react-dom";
import { useEffect, useRef, useState } from "react";

// Props-urile spun ce informații primește headerul din pagina părinte.
// Componenta nu calculează singură logica de business principală;
// ea doar afișează progresul și contextul deja pregătite în `PreluareAuto.tsx`.
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

// Aceste constante controlează forma vizuală a suprapunerii dintre card și blur.
// `RAZA_CARD` este folosită pentru a păstra o continuitate cu colțurile rotunjite.
// `SUPRAPUNERE_PX` spune cât de mult intră zona de blur "sub" cardul sticky,
// ca tranziția să nu pară tăiată brusc.
const RAZA_CARD = 16;
const SUPRAPUNERE_PX = RAZA_CARD + 8;

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
  // Headerul devine "activ" doar după ce utilizatorul a ales un vehicul.
  // Până atunci, componenta afișează doar mesajul introductiv.
  const esteStickyActiv = vehiculSelectat !== null;
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  // Aici memorăm dreptunghiul exact în care trebuie desenat blur-ul flotant.
  // Nu este suficient să punem doar un `div` cu `absolute`, pentru că vrem
  // să controlăm foarte exact:
  // - de unde începe blur-ul
  // - cât de lat este
  // - cât urcă deasupra cardului
  // - și să îl ținem sincronizat cu poziția reală a cardului sticky.
  const [blurRect, setBlurRect] = useState<BlurOverlayRect | null>(null);

  useEffect(() => {
    // Dacă nu există vehicul selectat, nu are sens să calculăm zona de blur,
    // pentru că headerul încă nu funcționează ca un card sticky de progres.
    if (!esteStickyActiv) return;

    const actualizeaza = () => {
      const wrapper = wrapperRef.current;
      if (!wrapper) return;

      // `main` este containerul real care face scroll în layout-ul aplicației.
      // Nu folosim doar `window`, pentru că aici scroll-ul se produce în zona
      // de conținut, nu pe întreaga pagină a browserului.
      const main = wrapper.closest("main");

      // `section` este zona logică a paginii de preluare auto.
      // Ne ajută să știm până unde ar trebui să urce blur-ul fără să invadeze
      // inutil alte regiuni din layout.
      const section = wrapper.closest("section");

      // `cardRect` este poziția și dimensiunea cardului sticky în viewport.
      // Browserul întoarce aici coordonate reale în pixeli.
      const cardRect = wrapper.getBoundingClientRect();

      // Dacă nu găsim `main`, folosim fallback pe dimensiunile ferestrei.
      // În practică, în aplicația curentă, `main` există și este sursa reală
      // pentru calculele de poziționare.
      const mainRect =
        main instanceof HTMLElement
          ? main.getBoundingClientRect()
          : { top: 0, left: 0, width: window.innerWidth };

      // `sectionRect` este folosit ca limită superioară logică a zonei blurate.
      // Dacă nu există un `section`, folosim chiar poziția cardului ca fallback.
      const sectionRect =
        section instanceof HTMLElement
          ? section.getBoundingClientRect()
          : cardRect;

      // `overlayTop` este punctul de sus al blur-ului.
      // Alegem maximul dintre top-ul secțiunii și top-ul lui `main`,
      // ca blur-ul să rămână doar în zona utilă de conținut.
      const overlayTop = Math.max(sectionRect.top, (mainRect as DOMRect).top);

      // Înălțimea blur-ului este distanța dintre top-ul cardului sticky și top-ul
      // zonei pe care vrem s-o blurăm, plus o mică suprapunere.
      // Suprapunerea face tranziția dintre blur și card mai naturală.
      const height = Math.max(cardRect.top - overlayTop + SUPRAPUNERE_PX, 0);

      setBlurRect({
        top: overlayTop,
        left: cardRect.left,
        width: cardRect.width,
        height,
      });
    };

    actualizeaza();

    // Ascultăm scroll-ul pe containerul real.
    // De fiecare dată când utilizatorul scrollează sau schimbă dimensiunea ferestrei,
    // recalculează dreptunghiul blur-ului, ca efectul să rămână aliniat cu headerul.
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
      {/* `createPortal(...)` desenează overlay-ul direct în `document.body`.
          Facem asta pentru că blur-ul trebuie să "iasă" din contextul normal
          al componentei și să stea liber peste conținutul din spate.

          Dacă am ține acest blur doar ca un copil normal în interiorul cardului,
          ar putea fi tăiat de stacking context, de `overflow`, de z-index sau
          de structura locală a layout-ului.

          Efectul vizual este acesta:
          - cardurile și conținutul aflate în spatele zonei devin blurate
          - cardul sticky din față rămâne clar și lizibil
          - sidebar-ul nu este afectat, pentru că lățimea blur-ului este calculată
            doar pe zona de conținut a lui `main`
          - overlay-ul nu blochează click-uri, fiindcă are `pointerEvents: "none"`
      */}
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

                // Foarte important: overlay-ul vizual nu trebuie să "prindă" click-uri.
                // Utilizatorul trebuie să poată interacționa în continuare cu ce este
                // în fața lui, mai ales cu headerul sticky.
                pointerEvents: "none",

                // `backdropFilter` nu blurează propriul conținut, ci tot ce se vede
                // în spatele acestui element.
                // Asta înseamnă că:
                // - cardurile din spate, conținutul sau textul care rămân sub această zonă
                //   devin blurate
                // - headerul flotant nu devine blurat, pentru că este desenat deasupra lui
                //   cu `z-10` / `z-40`
                backdropFilter: "blur(12px)",
                WebkitBackdropFilter: "blur(12px)",

                // Adăugăm și un alb foarte transparent, ca blur-ul să pară mai mult
                // ca un "glass layer", nu doar ca o deformare a fundalului.
                background: "rgba(255, 255, 255, 0.16)",

                // Masca face blur-ul să se estompeze la bază, aproape de card.
                // Fără această mască, tranziția dintre blur și header ar arăta prea dură.
                maskImage: `linear-gradient(to bottom, black calc(100% - ${SUPRAPUNERE_PX}px), transparent 100%)`,
                WebkitMaskImage: `linear-gradient(to bottom, black calc(100% - ${SUPRAPUNERE_PX}px), transparent 100%)`,
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
        {/* Wrapper-ul exterior este sticky, dar are `pointer-events-none`.
            Facem asta pentru ca zona lui transparentă să nu devină un "zid invizibil"
            peste restul paginii.

            Cu alte cuvinte:
            - containerul mare nu blochează click-uri
            - cardul real din interior va reactiva click-urile cu `pointer-events-auto`
        */}
        <div
          className={`pointer-events-auto relative z-10 isolate border transition-all duration-300 ${
            esteStickyActiv
              ? "rounded-2xl border-indigo-100/70 bg-transparent px-5 py-4 shadow-md shadow-slate-900/5"
              : "rounded-2xl border-slate-100 bg-white p-8 shadow-sm"
          }`}
        >
          {/* Când headerul este activ, cardul capătă un fundal de tip glassmorphism.
              Aceste două layere sunt doar pentru cardul din față, nu pentru conținutul
              din spate:
              - primul layer aplică blur și un alb translucid în interiorul cardului
              - al doilea layer adaugă o trecere subtilă de lumină

              De aceea cardul rămâne clar și "premium", în timp ce fundalul din spate
              este tratat separat prin portalul de mai sus.
          */}
          {esteStickyActiv ? (
            <>
              <div className="absolute inset-0 -z-10 rounded-2xl bg-white/38 backdrop-blur-[32px] backdrop-saturate-150" />
              <div className="absolute inset-0 -z-10 rounded-2xl bg-linear-to-b from-white/50 via-white/34 to-white/30" />
            </>
          ) : null}

          {!vehiculSelectat ? (
            // Varianta inițială a componentei:
            // încă nu avem vehicul ales, deci afișăm doar ghidajul de început.
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
            // Varianta "de lucru":
            // după selectarea vehiculului, headerul devine un rezumat flotant al fluxului.
            <div className="flex flex-col gap-4">
              {/* Primul rând:
                  - badge-ul "PRELUARE"
                  - pasul curent
                  - indicatorii de progres */}
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
                    {/* Fiecare element din `pasiFlux` devine o bulină.
                        React folosește `map(...)` pentru a genera UI repetitiv.

                        Regulile vizuale sunt:
                        - pasul curent: bulină mai lungă și indigo
                        - pas deja trecut: bulină verde
                        - pas încă neparcurs: bulină gri
                    */}
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

              {/* Al doilea rând rezumă contextul curent:
                  - ce vehicul este selectat
                  - cine plătește
                  - ce tip de dosar este activ, dacă există
                  - totalul estimat

                  Practic, utilizatorul poate înțelege foarte rapid "unde este"
                  în flux fără să recitească tot formularul de dedesubt.
              */}
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
                // Dacă fluxul nu poate fi salvat încă, afișăm toate blocările aici.
                // Avantajul este că utilizatorul le vede în headerul flotant chiar și
                // atunci când a scrollat mai jos în formular.
                <div className="mt-2 flex flex-wrap items-center gap-2 border-t border-slate-100/60 pt-3">
                  <span className="mr-1 text-xs font-bold uppercase tracking-wide text-rose-600">
                    Câmpuri obligatorii lipsă:
                  </span>
                  {mesajeBlocare.map((mesaj) => (
                    // Fiecare mesaj este randat ca badge separat,
                    // nu ca text lung, pentru a fi mai ușor de scanat vizual.
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
