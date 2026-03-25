// Selectorul de vehicul este primul pas din flux.
// El filtrează lista local și trimite mai departe doar `idVehicul`,
// iar pagina părinte decide ce face cu selecția.
import { useState } from 'react';
import type { Vehicul } from '../types';

interface SelectorVehiculProps {
  idVehiculSelectat: number | null;
  onSelecteaza: (idVehicul: number | null) => void;
  vehicule: Vehicul[];
}

export default function SelectorVehicul({
  idVehiculSelectat,
  onSelecteaza,
  vehicule,
}: SelectorVehiculProps) {
  const [cautare, setCautare] = useState('');

  // Căutarea lucrează pe câmpurile cele mai utile din front office:
  // număr, marcă, model și serie șasiu.
  const termen = cautare.trim().toLowerCase();
  const vehiculeFiltrate = vehicule.filter((vehicul) => {
    if (!termen) {
      return true;
    }

    return [
      vehicul.nrInmatriculare,
      vehicul.marca,
      vehicul.model,
      vehicul.serieSasiu,
    ].some((camp) => camp.toLowerCase().includes(termen));
  });

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 space-y-5">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h3 className="text-xl font-bold text-slate-800">Selector vehicul</h3>
          <p className="mt-1 text-sm text-slate-500">
            Caută după număr de înmatriculare, marcă, model sau serie de șasiu.
          </p>
        </div>

        {idVehiculSelectat !== null ? (
          <button
            type="button"
            onClick={() => onSelecteaza(null)}
            className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50"
          >
            Resetează selecția
          </button>
        ) : null}
      </div>

      <input
        type="text"
        value={cautare}
        onChange={(event) => setCautare(event.target.value)}
        placeholder="Ex: IS-09-SAG, Logan, UU1LSDL4H60512345"
        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 focus:border-indigo-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
      />

      {/* Fiecare card reprezintă un vehicul; selecția merge mai departe doar ca id. */}
      <div className="grid gap-3 lg:grid-cols-3">
        {vehiculeFiltrate.map((vehicul) => {
          const esteSelectat = vehicul.idVehicul === idVehiculSelectat;

          return (
            <button
              key={vehicul.idVehicul}
              type="button"
              onClick={() => onSelecteaza(vehicul.idVehicul)}
              className={`rounded-2xl border p-5 text-left transition-all ${
                esteSelectat
                  ? 'border-indigo-500 bg-indigo-50 shadow-sm shadow-indigo-500/10'
                  : 'border-slate-200 bg-white hover:border-indigo-200 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                    {vehicul.nrInmatriculare}
                  </p>
                  <h4 className="mt-2 text-lg font-bold text-slate-800">
                    {vehicul.marca} {vehicul.model}
                  </h4>
                </div>
                {esteSelectat ? (
                  <span className="rounded-full bg-indigo-600 px-2.5 py-1 text-xs font-bold uppercase tracking-wide text-white">
                    Selectat
                  </span>
                ) : null}
              </div>

              <dl className="mt-4 space-y-2 text-sm text-slate-500">
                <div className="flex items-center justify-between gap-2">
                  <dt className="font-medium text-slate-600">An</dt>
                  <dd>{vehicul.an}</dd>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <dt className="font-medium text-slate-600">Client</dt>
                  <dd>#{vehicul.idClient}</dd>
                </div>
                <div className="space-y-1">
                  <dt className="font-medium text-slate-600">Serie șasiu</dt>
                  <dd className="break-all text-xs text-slate-500">{vehicul.serieSasiu}</dd>
                </div>
              </dl>
            </button>
          );
        })}
      </div>

      {vehiculeFiltrate.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-6 text-center text-sm text-slate-500">
          Nu există vehicule care să corespundă criteriului introdus.
        </div>
      ) : null}
    </div>
  );
}
