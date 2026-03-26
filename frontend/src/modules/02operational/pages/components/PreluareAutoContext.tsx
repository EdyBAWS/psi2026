import type { Client, ComandaService, Vehicul } from '../../types';
import { formatData } from '../preluareAuto.helpers';

interface PreluareAutoContextProps {
  clientSelectat: Client | null;
  comandaActivaExistenta: ComandaService | null;
  esteLucrareAsigurare: boolean;
  onSchimbaFluxAsigurare: (activ: boolean) => void;
  vehiculSelectat: Vehicul;
}

export default function PreluareAutoContext({
  clientSelectat,
  comandaActivaExistenta,
  esteLucrareAsigurare,
  onSchimbaFluxAsigurare,
  vehiculSelectat,
}: PreluareAutoContextProps) {
  return (
    <div className="grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
      <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
          Context client și vehicul
        </p>
        <h3 className="mt-2 text-2xl font-bold text-slate-800">
          {vehiculSelectat.marca} {vehiculSelectat.model}
        </h3>
        <dl className="mt-5 grid gap-4 text-sm text-slate-600 md:grid-cols-2">
          <div>
            <dt className="font-semibold text-slate-700">Client</dt>
            <dd className="mt-1">{clientSelectat?.nume ?? `#${vehiculSelectat.idClient}`}</dd>
          </div>
          <div>
            <dt className="font-semibold text-slate-700">Telefon</dt>
            <dd className="mt-1">{clientSelectat?.telefon ?? '-'}</dd>
          </div>
          <div>
            <dt className="font-semibold text-slate-700">Tip client</dt>
            <dd className="mt-1">{clientSelectat?.tipClient ?? '-'}</dd>
          </div>
          <div>
            <dt className="font-semibold text-slate-700">Serie șasiu</dt>
            <dd className="mt-1 break-all">{vehiculSelectat.serieSasiu}</dd>
          </div>
          {clientSelectat?.denumireCompanie ? (
            <div className="md:col-span-2">
              <dt className="font-semibold text-slate-700">Companie</dt>
              <dd className="mt-1">{clientSelectat.denumireCompanie}</dd>
            </div>
          ) : null}
        </dl>
      </div>

      <div className="flex flex-col rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
        <div className="mb-5 flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
              Tip intervenție
            </p>
            <h3 className="mt-2 text-xl font-bold text-slate-800">
              {esteLucrareAsigurare ? 'Lucrare cu asigurare' : 'Lucrare client / flotă'}
            </h3>
          </div>
          <label className="inline-flex cursor-pointer items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 transition-colors hover:bg-slate-100">
            <span className="text-sm font-semibold text-slate-700">Daună</span>
            <input
              type="checkbox"
              checked={esteLucrareAsigurare}
              onChange={(event) => onSchimbaFluxAsigurare(event.target.checked)}
              className="h-4 w-4 cursor-pointer rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
            />
          </label>
        </div>

        {comandaActivaExistenta ? (
          <div className="mb-4 flex-1 rounded-xl border border-rose-200 bg-rose-50 px-4 py-4 text-sm text-rose-800">
            Există deja comanda activă <strong>{comandaActivaExistenta.nrComanda}</strong> pentru acest
            vehicul, cu status <strong>{comandaActivaExistenta.status}</strong> și termen promis{' '}
            <strong>{formatData(comandaActivaExistenta.termenPromis)}</strong>.
          </div>
        ) : null}
      </div>
    </div>
  );
}
