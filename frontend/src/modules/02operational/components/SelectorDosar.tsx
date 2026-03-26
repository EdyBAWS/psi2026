// Selectorul de dosar rezolvă ramura "de asigurare" a fluxului:
// fie atașează un dosar deja existent pentru vehicul, fie completează
// datele principale pentru a crea unul nou la salvarea comenzii.
// Componenta nu salvează nimic direct. Ea doar editează starea de formular
// primită prin `value` și trimite modificările înapoi prin `onChange`.
import type { StareDosarAsigurare } from '../formState';
import type { Asigurator, DosarDauna, StatusDosar, Vehicul } from '../types';

interface SelectorDosarProps {
  asiguratori: Asigurator[];
  dosare: DosarDauna[];
  nrDosarPreview: string;
  value: StareDosarAsigurare;
  vehicul: Vehicul | null;
  onChange: (value: StareDosarAsigurare) => void;
}

const statusuriDosar: StatusDosar[] = [
  'Deschis',
  'In analiza',
  'Aprobat partial',
  'Aprobat',
  'Respins',
];

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
  // Fără vehicul selectat nu putem ști ce dosare sunt relevante,
  // deci afișăm doar un mesaj de ghidare.
  if (!vehicul) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-5 py-6 text-sm text-slate-500">
        Selectează mai întâi un vehicul pentru a putea lega sau crea un dosar de daună.
      </div>
    );
  }

  // Selectăm doar dosarele care aparțin vehiculului curent.
  const dosareVehicul = dosare.filter((dosar) => dosar.idVehicul === vehicul.idVehicul);
  const dosarSelectat =
    dosareVehicul.find((dosar) => dosar.idDosar === value.idDosarSelectat) ?? null;
  const asiguratorSelectat =
    asiguratori.find((asigurator) => asigurator.idAsigurator === dosarSelectat?.idAsigurator) ??
    null;
  const existaDosare = dosareVehicul.length > 0;

  // Când schimbăm modul, păstrăm aceeași structură de stare,
  // dar resetăm câmpurile care nu mai au sens în contextul nou.
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
            cu datele minime de constatare și aprobare.
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

      {/* Aici folosim randare condițională cu `? :`.
          Dacă modul este `existent`, afișăm selectorul de dosare existente.
          Altfel, afișăm formularul pentru dosar nou. */}
      {value.mod === 'existent' ? (
        <div className="space-y-4">
          {/* În acest mod, utilizatorul doar alege un dosar deja cunoscut. */}
          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Selectează dosarul existent
            </label>
            <select
              // `?? ''` este un fallback: dacă nu avem un id selectat, dropdown-ul rămâne gol.
              value={value.idDosarSelectat ?? ''}
              onChange={(event) =>
                onChange({
                  ...value,
                  idDosarSelectat:
                    // `event.target.value` vine ca text din browser.
                    // Îl transformăm în `null` sau `number`, după caz.
                    event.target.value === '' ? null : Number(event.target.value),
                })
              }
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 focus:border-indigo-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">Selectează dosar</option>
              {dosareVehicul.map((dosar) => (
                <option key={dosar.idDosar} value={dosar.idDosar}>
                  {dosar.nrDosar} · {dosar.statusAprobare}
                </option>
              ))}
            </select>
          </div>

          {dosarSelectat ? (
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              {/* Afișăm un rezumat informativ, ca utilizatorul să confirme rapid
                  că a ales dosarul corect înainte de salvarea comenzii. */}
              <dl className="grid gap-3 text-sm text-slate-600 md:grid-cols-2">
                <div>
                  <dt className="font-semibold text-slate-700">Număr dosar</dt>
                  <dd className="mt-1">{dosarSelectat.nrDosar}</dd>
                </div>
                <div>
                  <dt className="font-semibold text-slate-700">Referință asigurator</dt>
                  <dd className="mt-1">{dosarSelectat.numarReferintaAsigurator}</dd>
                </div>
                <div>
                  <dt className="font-semibold text-slate-700">Asigurator</dt>
                  <dd className="mt-1">{asiguratorSelectat?.denumire ?? '-'}</dd>
                </div>
                <div>
                  <dt className="font-semibold text-slate-700">Tip poliță</dt>
                  <dd className="mt-1">{dosarSelectat.tipPolita}</dd>
                </div>
                <div>
                  <dt className="font-semibold text-slate-700">Status aprobare</dt>
                  <dd className="mt-1">{dosarSelectat.statusAprobare}</dd>
                </div>
                <div>
                  <dt className="font-semibold text-slate-700">Inspector</dt>
                  <dd className="mt-1">{dosarSelectat.inspectorDauna}</dd>
                </div>
                <div>
                  <dt className="font-semibold text-slate-700">Data constatării</dt>
                  <dd className="mt-1">{formatData(dosarSelectat.dataConstatare)}</dd>
                </div>
                <div>
                  <dt className="font-semibold text-slate-700">Sumă aprobată</dt>
                  <dd className="mt-1">{formatSuma(dosarSelectat.sumaAprobata)}</dd>
                </div>
                <div>
                  <dt className="font-semibold text-slate-700">Franciză</dt>
                  <dd className="mt-1">{formatSuma(dosarSelectat.franciza)}</dd>
                </div>
                <div className="md:col-span-2">
                  <dt className="font-semibold text-slate-700">Observații</dt>
                  <dd className="mt-1">{dosarSelectat.observatiiDauna}</dd>
                </div>
              </dl>
            </div>
          ) : null}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {/* În modul "nou", componenta colectează doar datele necesare pentru
              construirea obiectului final `DosarDauna` în pagina părinte. */}
          <div className="md:col-span-2 xl:col-span-4 rounded-xl border border-indigo-100 bg-indigo-50 px-4 py-3 text-sm text-indigo-800">
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
              Tip poliță
            </label>
            <select
              value={value.tipPolita}
              onChange={(event) =>
                onChange({
                  ...value,
                  tipPolita: event.target.value as StareDosarAsigurare['tipPolita'],
                })
              }
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 focus:border-indigo-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="CASCO">CASCO</option>
              <option value="RCA">RCA</option>
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Status aprobare
            </label>
            <select
              value={value.statusAprobare}
              onChange={(event) =>
                onChange({
                  ...value,
                  statusAprobare: event.target.value as StatusDosar,
                })
              }
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 focus:border-indigo-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {statusuriDosar.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Data constatării
            </label>
            <input
              type="date"
              value={value.dataConstatare}
              onChange={(event) =>
                onChange({
                  ...value,
                  dataConstatare: event.target.value,
                })
              }
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 focus:border-indigo-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Referință asigurator
            </label>
            <input
              type="text"
              value={value.numarReferintaAsigurator}
              onChange={(event) =>
                onChange({
                  ...value,
                  numarReferintaAsigurator: event.target.value,
                })
              }
              placeholder="Ex: ALT-CASCO-88214"
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 focus:border-indigo-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Inspector daună
            </label>
            <input
              type="text"
              value={value.inspectorDauna}
              onChange={(event) =>
                onChange({
                  ...value,
                  inspectorDauna: event.target.value,
                })
              }
              placeholder="Ex: Radu Enache"
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 focus:border-indigo-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Sumă aprobată
            </label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={value.sumaAprobata}
              onChange={(event) =>
                onChange({
                  ...value,
                  sumaAprobata: event.target.value === '' ? '' : Number(event.target.value),
                })
              }
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 focus:border-indigo-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Franciză
            </label>
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
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 focus:border-indigo-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="md:col-span-2 xl:col-span-4">
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Observații dosar
            </label>
            <textarea
              value={value.observatiiDauna}
              onChange={(event) =>
                onChange({
                  ...value,
                  observatiiDauna: event.target.value,
                })
              }
              rows={3}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 focus:border-indigo-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Mențiuni despre constatare, limitări de aprobare sau pașii următori."
            />
          </div>
        </div>
      )}
    </div>
  );
}
