// Selectorul de dosar rezolvă ramura "de asigurare" a fluxului:
// fie atașează un dosar deja existent pentru vehicul, fie completează
// datele minime pentru a crea unul nou la salvarea comenzii.
import type { StareDosarAsigurare } from '../formState';
import type { Asigurator, DosarDauna, Vehicul } from '../types';

interface SelectorDosarProps {
  asiguratori: Asigurator[];
  dosare: DosarDauna[];
  nrDosarPreview: string;
  value: StareDosarAsigurare;
  vehicul: Vehicul | null;
  onChange: (value: StareDosarAsigurare) => void;
}

const formatSuma = (valoare: number) =>
  new Intl.NumberFormat('ro-RO', {
    style: 'currency',
    currency: 'RON',
    maximumFractionDigits: 2,
  }).format(valoare);

const formatData = (valoare: Date) => valoare.toLocaleDateString('ro-RO');

export default function SelectorDosar({
  asiguratori,
  dosare,
  nrDosarPreview,
  value,
  vehicul,
  onChange,
}: SelectorDosarProps) {
  // Fără vehicul selectat nu știm ce dosare putem filtra, deci oprim fluxul aici.
  if (!vehicul) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-5 py-6 text-sm text-slate-500">
        Selectează mai întâi un vehicul pentru a putea lega sau crea un dosar de daună.
      </div>
    );
  }

  // Filtrăm dosarele strict după vehiculul curent, pentru a evita asocierea
  // accidentală a unui dosar cu altă mașină.
  const dosareVehicul = dosare.filter((dosar) => dosar.idVehicul === vehicul.idVehicul);
  const dosarSelectat =
    dosareVehicul.find((dosar) => dosar.idDosar === value.idDosarSelectat) ?? null;
  const existaDosare = dosareVehicul.length > 0;

  // Schimbarea modului resetează doar partea relevantă din stare:
  // la existent alegem un dosar din listă, iar la nou golim selecția.
  const schimbaMod = (mod: 'existent' | 'nou') => {
    if (mod === 'existent') {
      onChange({
        ...value,
        mod,
        idDosarSelectat: dosareVehicul[0]?.idDosar ?? null,
      });
      return;
    }

    onChange({
      ...value,
      mod,
      idDosarSelectat: null,
    });
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 space-y-5">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h3 className="text-xl font-bold text-slate-800">Dosar de daună</h3>
          <p className="mt-1 text-sm text-slate-500">
            Atașează un dosar existent pentru vehiculul selectat sau creează unul nou
            local în aplicație.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => schimbaMod('existent')}
            disabled={!existaDosare}
            className={`rounded-lg px-4 py-2 text-sm font-semibold transition-all ${
              value.mod === 'existent'
                ? 'bg-indigo-600 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            } disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400`}
          >
            Dosar existent
          </button>
          <button
            type="button"
            onClick={() => schimbaMod('nou')}
            className={`rounded-lg px-4 py-2 text-sm font-semibold transition-all ${
              value.mod === 'nou'
                ? 'bg-indigo-600 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Dosar nou
          </button>
        </div>
      </div>

      {!existaDosare ? (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          Pentru acest vehicul nu există încă un dosar deschis. Creează unul nou pentru
          a continua fluxul de asigurare.
        </div>
      ) : null}

      {/* În modul existent alegem un dosar și afișăm rapid detaliile lui. */}
      {value.mod === 'existent' ? (
        <div className="space-y-4">
          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Selectează dosarul existent
            </label>
            <select
              value={value.idDosarSelectat ?? ''}
              onChange={(event) =>
                onChange({
                  ...value,
                  idDosarSelectat:
                    event.target.value === '' ? null : Number(event.target.value),
                })
              }
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 focus:border-indigo-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">Selectează dosar</option>
              {dosareVehicul.map((dosar) => (
                <option key={dosar.idDosar} value={dosar.idDosar}>
                  {dosar.nrDosar} · {formatSuma(dosar.sumaAprobata)}
                </option>
              ))}
            </select>
          </div>

          {dosarSelectat ? (
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <dl className="grid gap-3 text-sm text-slate-600 md:grid-cols-2">
                <div>
                  <dt className="font-semibold text-slate-700">Număr dosar</dt>
                  <dd className="mt-1">{dosarSelectat.nrDosar}</dd>
                </div>
                <div>
                  <dt className="font-semibold text-slate-700">Data deschiderii</dt>
                  <dd className="mt-1">{formatData(dosarSelectat.dataDeschidere)}</dd>
                </div>
                <div>
                  <dt className="font-semibold text-slate-700">Sumă aprobată</dt>
                  <dd className="mt-1">{formatSuma(dosarSelectat.sumaAprobata)}</dd>
                </div>
                <div>
                  <dt className="font-semibold text-slate-700">Franciză</dt>
                  <dd className="mt-1">{formatSuma(dosarSelectat.franciza)}</dd>
                </div>
              </dl>
            </div>
          ) : null}
        </div>
      ) : (
        // În modul nou păstrăm doar valorile de bază; numărul dosarului se generează
        // automat la salvarea finală a comenzii.
        <div className="grid gap-4 md:grid-cols-3">
          <div className="md:col-span-3 rounded-xl border border-indigo-100 bg-indigo-50 px-4 py-3 text-sm text-indigo-800">
            Numărul noului dosar va fi generat automat la salvare: <strong>{nrDosarPreview}</strong>
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Asigurator
            </label>
            <select
              value={value.idAsigurator ?? ''}
              onChange={(event) =>
                onChange({
                  ...value,
                  idAsigurator:
                    event.target.value === '' ? null : Number(event.target.value),
                })
              }
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 focus:border-indigo-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">Selectează asigurator</option>
              {asiguratori.map((asigurator) => (
                <option key={asigurator.idAsigurator} value={asigurator.idAsigurator}>
                  {asigurator.denumire}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Sumă aprobată
            </label>
            <div className="relative">
              <input
                type="number"
                min="0"
                step="0.01"
                value={value.sumaAprobata}
                onChange={(event) =>
                  onChange({
                    ...value,
                    sumaAprobata:
                      event.target.value === '' ? '' : Number(event.target.value),
                  })
                }
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 pr-14 text-slate-900 focus:border-indigo-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="0.00"
              />
              <span className="absolute right-4 top-3 text-sm font-medium text-slate-400">
                RON
              </span>
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Franciză
            </label>
            <div className="relative">
              <input
                type="number"
                min="0"
                step="0.01"
                value={value.franciza}
                onChange={(event) =>
                  onChange({
                    ...value,
                    franciza: event.target.value === '' ? '' : Number(event.target.value),
                  })
                }
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 pr-14 text-slate-900 focus:border-indigo-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="0.00"
              />
              <span className="absolute right-4 top-3 text-sm font-medium text-slate-400">
                RON
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
