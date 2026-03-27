// Selectorul de vehicul este primul pas din flux.
// Pe lângă datele mașinii, afișăm și contextul clientului și eventualele
// comenzi deja active pentru același vehicul.
import { useState } from 'react';
import { comandaEsteActiva } from '../calculations';
import type { Client, ComandaService, Vehicul } from '../types';

interface SelectorVehiculProps {
  clienti: Client[];
  comenzi: ComandaService[];
  idVehiculSelectat: number | null;
  onSelecteaza: (idVehicul: number | null) => void;
  vehicule: Vehicul[];
}

export default function SelectorVehicul({
  clienti,
  comenzi,
  idVehiculSelectat,
  onSelecteaza,
  vehicule,
}: SelectorVehiculProps) {
  // Componenta păstrează local doar textul de căutare.
  // Vehiculul selectat rămâne în pagina părinte, pentru că și alte componente
  // trebuie să știe ce mașină a fost aleasă.
  const [cautare, setCautare] = useState('');

  const termen = cautare.trim().toLowerCase();
  // Filtrarea se face pe mai multe câmpuri ca să imite o căutare practică din recepție:
  // număr de înmatriculare, model, VIN, numele clientului sau telefon.
  const vehiculeFiltrate = vehicule.filter((vehicul) => {
    const client = clienti.find((item) => item.idClient === vehicul.idClient);
    const campuriCautare = [
      vehicul.nrInmatriculare,
      vehicul.marca,
      vehicul.model,
      vehicul.serieSasiu,
      client?.nume ?? '',
      client?.telefon ?? '',
      client?.denumireCompanie ?? '',
    ];

    if (!termen) {
      return true;
    }

    return campuriCautare.some((camp) => camp.toLowerCase().includes(termen));
  });

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 space-y-5">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h3 className="text-xl font-bold text-slate-800">Selector vehicul</h3>
          <p className="mt-1 text-sm text-slate-500">
            Caută după număr, marcă, model, serie șasiu sau datele clientului.
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
        placeholder="Ex: IS-09-SAG, Ion Popescu, Octavia, 0722..."
        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 focus:border-indigo-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
      />

      <div className="grid gap-3 lg:grid-cols-3">
        {/* `vehiculeFiltrate.map(...)` înseamnă:
            "pentru fiecare vehicul din listă, desenează un card". */}
        {vehiculeFiltrate.map((vehicul) => {
          // Pentru fiecare card derivăm context suplimentar din alte liste.
          // Nu duplicăm aceste date în `Vehicul`, ci le calculăm la afișare.
          const client = clienti.find((item) => item.idClient === vehicul.idClient) ?? null;
          const comenziActiveVehicul = comenzi.filter(
            (comanda) =>
              comanda.idVehicul === vehicul.idVehicul && comandaEsteActiva(comanda.status),
          );
          const esteSelectat = vehicul.idVehicul === idVehiculSelectat;

          return (
            <button
              key={vehicul.idVehicul}
              type="button"
              // La click, componenta nu își schimbă singură selecția finală.
              // Ea anunță pagina părinte prin callback-ul `onSelecteaza`.
              onClick={() => onSelecteaza(vehicul.idVehicul)}
              className={`rounded-2xl border p-5 text-left transition-all ${
                // Operatorul ternar alege un set de clase dacă vehiculul este selectat
                // și alt set dacă nu este selectat.
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
                <div className="flex flex-col items-end gap-2">
                  {esteSelectat ? (
                    <span className="rounded-full bg-indigo-600 px-2.5 py-1 text-xs font-bold uppercase tracking-wide text-white">
                      Selectat
                    </span>
                  ) : null}
                  {comenziActiveVehicul.length > 0 ? (
                    <span className="rounded-full bg-amber-100 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-amber-800">
                      {comenziActiveVehicul.length} comandă activă
                    </span>
                  ) : null}
                </div>
              </div>

              <dl className="mt-4 space-y-2 text-sm text-slate-500">
                {/* `dl` / `dt` / `dd` formează o listă de descrieri:
                    etichetă + valoarea ei. */}
                <div className="flex items-center justify-between gap-2">
                  <dt className="font-medium text-slate-600">Client</dt>
                  <dd className="text-right">{client?.nume ?? `#${vehicul.idClient}`}</dd>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <dt className="font-medium text-slate-600">Telefon</dt>
                  <dd>{client?.telefon ?? '-'}</dd>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <dt className="font-medium text-slate-600">Tip client</dt>
                  <dd>{client?.tipClient ?? '-'}</dd>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <dt className="font-medium text-slate-600">An</dt>
                  <dd>{vehicul.an}</dd>
                </div>
                <div className="space-y-1">
                  <dt className="font-medium text-slate-600">Serie șasiu</dt>
                  <dd className="break-all text-xs text-slate-500">{vehicul.serieSasiu}</dd>
                </div>
                {client?.denumireCompanie ? (
                  <div className="space-y-1">
                    <dt className="font-medium text-slate-600">Companie</dt>
                    <dd className="text-xs text-slate-500">{client.denumireCompanie}</dd>
                  </div>
                ) : null}
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
