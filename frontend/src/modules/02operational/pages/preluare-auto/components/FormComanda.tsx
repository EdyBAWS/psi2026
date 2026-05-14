// Componenta afișează antetul comenzii, datele de recepție și tabelul de poziții.
// Ea nu salvează nimic singură; pagina părinte deține starea și validarea finală.
// Acesta este un pattern important pentru începători:
// - componenta copil afișează și colectează input-uri
// - componenta părinte decide când datele sunt valide și când se salvează
import TabelPozitii from "../../../shared-components/TabelPozitii";
import type { DetaliiPreluareForm } from "../../../receptie/formState";
import type {
  CatalogKit,
  CatalogManopera,
  CatalogPiesa,
  Mecanic,
  PozitieComandaDraft,
  Vehicul,
} from "../../../types";

interface FormComandaProps {
  blocheazaTipPlataAsigurare: boolean;
  campuriCuEroare: {
    kilometrajPreluare: boolean;
    mecanic: boolean;
    pozitii: boolean;
    simptomeReclamate: boolean;
    termenPromis: boolean;
    tipPlata: boolean;
  };
  catalogKituri: CatalogKit[];
  catalogManopere: CatalogManopera[];
  catalogPiese: CatalogPiesa[];
  detaliiPreluare: DetaliiPreluareForm;
  idMecaniciSelectati: number[];
  mecanici: Mecanic[];
  nrComandaPreview: string;
  pozitii: PozitieComandaDraft[];
  subtotalEstimat: number;
  totalEstimat: number;
  tvaEstimat: number;
  vehicul: Vehicul;
  onDetaliiChange: (modificari: Partial<DetaliiPreluareForm>) => void;
  onMecaniciChange: (ids: number[]) => void;
  onPozitiiChange: (pozitii: PozitieComandaDraft[]) => void;
}

const formatSuma = (valoare: number) =>
  new Intl.NumberFormat("ro-RO", {
    style: "currency",
    currency: "RON",
    maximumFractionDigits: 2,
  }).format(valoare);

export default function FormComanda({
  blocheazaTipPlataAsigurare,
  campuriCuEroare,
  catalogKituri,
  catalogManopere,
  catalogPiese,
  detaliiPreluare,
  idMecaniciSelectati,
  mecanici,
  nrComandaPreview,
  pozitii,
  subtotalEstimat,
  totalEstimat,
  tvaEstimat,
  vehicul,
  onDetaliiChange,
  onMecaniciChange,
  onPozitiiChange,
}: FormComandaProps) {
  const claseCamp = (areEroare: boolean) =>
    `w-full rounded-xl border px-4 py-3 text-slate-900 focus:bg-white focus:outline-none focus:ring-2 ${
      areEroare
        ? "border-rose-300 bg-rose-50/40 ring-2 ring-inset ring-rose-500/70 focus:border-rose-400 focus:ring-rose-500"
        : "border-slate-200 bg-slate-50 focus:border-indigo-300 focus:ring-indigo-500"
    }`;

  const toggleMecanic = (id: number) => {
    if (idMecaniciSelectati.includes(id)) {
      onMecaniciChange(idMecaniciSelectati.filter((m) => m !== id));
    } else {
      onMecaniciChange([...idMecaniciSelectati, id]);
    }
  };

  const mecaniciSelectati = mecanici.filter((m) => idMecaniciSelectati.includes(m.idMecanic));

  return (
    // JSX-ul de mai jos descrie interfața componentei.
    // Tag-uri precum `div`, `p`, `select` și `input` sunt elemente de UI.
    <div className="space-y-5">
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
              Comandă pregătită
            </p>
            <h3 className="mt-2 text-2xl font-bold text-slate-800">
              {nrComandaPreview}
            </h3>
            <p className="mt-2 text-sm text-slate-500">
              Vehicul selectat: {vehicul.marca} {vehicul.model} ·{" "}
              {vehicul.numarInmatriculare}
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            {/* Cardurile din dreapta sunt doar rezumate vizuale.
                Valorile sunt calculate în pagina părinte și doar afișate aici. */}
            <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Status inițial
              </p>
              <p className="mt-2 text-sm font-bold text-slate-800">
                In așteptare diagnoză
              </p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Subtotal
              </p>
              <p className="mt-2 text-sm font-bold text-slate-800">
                {formatSuma(subtotalEstimat)}
              </p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Total estimat
              </p>
              <p className="mt-2 text-sm font-bold text-slate-800">
                {formatSuma(totalEstimat)}
              </p>
            </div>
          </div>
        </div>

        {/* Această grilă grupează toate datele de recepție ale comenzii.
            Fiecare input trimite doar modificarea locală înapoi către părinte. */}
        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <div className="md:col-span-2 xl:col-span-1">
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Mecanici responsabili<span className="text-rose-500 ml-1">*</span>
            </label>
            <div className={`min-h-[50px] flex flex-wrap gap-2 p-2 rounded-xl border ${campuriCuEroare.mecanic ? 'border-rose-300 bg-rose-50/40 ring-2 ring-rose-500/70' : 'border-slate-200 bg-slate-50'}`}>
              {mecaniciSelectati.map((m) => (
                <span key={m.idMecanic} className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-indigo-100 text-indigo-700 text-xs font-bold border border-indigo-200">
                  {m.nume}
                  <button type="button" onClick={() => toggleMecanic(m.idMecanic)} className="hover:text-indigo-900">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12"></path></svg>
                  </button>
                </span>
              ))}
              <select
                value=""
                onChange={(e) => {
                  if (e.target.value) toggleMecanic(Number(e.target.value));
                }}
                className="bg-transparent text-xs font-semibold text-slate-500 focus:outline-none cursor-pointer min-w-[80px] flex-1"
              >
                <option value="">+ Adaugă</option>
                {mecanici.filter(m => !idMecaniciSelectati.includes(m.idMecanic)).map((mecanic) => (
                  <option key={mecanic.idMecanic} value={mecanic.idMecanic}>
                    {mecanic.nume} ({mecanic.specialitate})
                  </option>
                ))}
              </select>
            </div>
            {idMecaniciSelectati.length > 0 && (
               <p className="mt-1.5 text-[10px] text-slate-400 font-medium italic">
                 {idMecaniciSelectati.length === 1 ? 'Un mecanic asignat' : `${idMecaniciSelectati.length} mecanici asignați echipei`}
               </p>
            )}
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Tip plată<span className="text-rose-500 ml-1">*</span>
            </label>
            <select
              value={detaliiPreluare.tipPlata}
              disabled={blocheazaTipPlataAsigurare}
              onChange={(event) =>
                onDetaliiChange({
                  tipPlata: event.target
                    .value as DetaliiPreluareForm["tipPlata"],
                })
              }
              className={`${claseCamp(campuriCuEroare.tipPlata)} disabled:cursor-not-allowed disabled:bg-slate-100`}
            >
              <option value="Client Direct">Client Direct</option>
              <option value="Flota">Flotă</option>
              <option value="Asigurare">Asigurare</option>
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Prioritate<span className="text-rose-500 ml-1">*</span>
            </label>
            <select
              value={detaliiPreluare.prioritate}
              onChange={(event) =>
                onDetaliiChange({
                  prioritate: event.target
                    .value as DetaliiPreluareForm["prioritate"],
                })
              }
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 focus:border-indigo-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="Scazuta">Scăzută</option>
              <option value="Normala">Normală</option>
              <option value="Ridicata">Ridicată</option>
              <option value="Urgenta">Urgentă</option>
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Termen promis<span className="text-rose-500 ml-1">*</span>
            </label>
            <input
              type="date"
              value={detaliiPreluare.termenPromis}
              onChange={(event) =>
                onDetaliiChange({
                  termenPromis: event.target.value,
                })
              }
              className={claseCamp(campuriCuEroare.termenPromis)}
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Kilometraj preluare<span className="text-rose-500 ml-1">*</span>
            </label>
            <input
              type="number"
              min="0"
              value={detaliiPreluare.kilometrajPreluare}
              onChange={(event) =>
                onDetaliiChange({
                  kilometrajPreluare:
                    event.target.value === "" ? "" : Number(event.target.value),
                })
              }
              className={claseCamp(campuriCuEroare.kilometrajPreluare)}
              placeholder="Ex: 146220"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Nivel combustibil<span className="text-rose-500 ml-1">*</span>
            </label>
            <select
              value={detaliiPreluare.nivelCombustibil}
              onChange={(event) =>
                onDetaliiChange({
                  nivelCombustibil: event.target
                    .value as DetaliiPreluareForm["nivelCombustibil"],
                })
              }
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 focus:border-indigo-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="Rezerva">Rezervă</option>
              <option value="1/4">1/4</option>
              <option value="1/2">1/2</option>
              <option value="3/4">3/4</option>
              <option value="Plin">Plin</option>
            </select>
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-4 md:col-span-2">
            {/* Rezumatul folosește totalurile deja calculate în părinte.
                Componenta nu recalculează aici formulele, doar le afișează. */}
            <p className="text-sm font-semibold text-slate-700">
              Rezumat deviz
            </p>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <p className="text-sm text-slate-500">
                TVA estimat:{" "}
                <strong className="text-slate-700">
                  {formatSuma(tvaEstimat)}
                </strong>
              </p>
              <p className="text-sm text-slate-500">
                Total final:{" "}
                <strong className="text-slate-700">
                  {formatSuma(totalEstimat)}
                </strong>
              </p>
            </div>
          </div>

          <div className="xl:col-span-2">
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Simptome reclamate<span className="text-rose-500 ml-1">*</span>
            </label>
            <textarea
              rows={3}
              value={detaliiPreluare.simptomeReclamate}
              onChange={(event) =>
                onDetaliiChange({
                  simptomeReclamate: event.target.value,
                })
              }
              className={claseCamp(campuriCuEroare.simptomeReclamate)}
              placeholder="Descrierea problemei observate de client."
            />
          </div>

          <div className="xl:col-span-2">
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Observații la preluare
            </label>
            <textarea
              rows={3}
              value={detaliiPreluare.observatiiPreluare}
              onChange={(event) =>
                onDetaliiChange({
                  observatiiPreluare: event.target.value,
                })
              }
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 focus:border-indigo-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Condiții speciale, aprobări necesare, condiții de livrare."
            />
          </div>

          <div className="xl:col-span-2">
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Observații caroserie
            </label>
            <textarea
              rows={3}
              value={detaliiPreluare.observatiiCaroserie}
              onChange={(event) =>
                onDetaliiChange({
                  observatiiCaroserie: event.target.value,
                })
              }
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 focus:border-indigo-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Zgârieturi, lovituri sau alte observații vizibile la recepție."
            />
          </div>

          <div className="xl:col-span-2">
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Accesorii predate
            </label>
            <input
              type="text"
              value={detaliiPreluare.accesoriiPredate}
              onChange={(event) =>
                onDetaliiChange({
                  accesoriiPredate: event.target.value,
                })
              }
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 focus:border-indigo-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Ex: talon, cheie rezervă, roată de rezervă"
            />
          </div>
        </div>
      </div>

      {/* Tabelul de poziții este separat pentru a păstra componenta curată.
          El gestionează lista de rânduri, iar această componentă se ocupă de antetul comenzii. */}
      <div
        className={
          campuriCuEroare.pozitii
            ? "rounded-2xl ring-2 ring-inset ring-rose-500/70"
            : ""
        }
      >
        <TabelPozitii
          catalogKituri={catalogKituri}
          catalogManopere={catalogManopere}
          catalogPiese={catalogPiese}
          pozitii={pozitii}
          onChange={onPozitiiChange}
          areEroare={campuriCuEroare.pozitii}
        />
      </div>
    </div>
  );
}

