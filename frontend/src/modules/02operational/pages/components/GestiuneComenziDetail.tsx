import { calculeazaRezumatPozitii } from '../../calculations';
import StatusBadge from '../../components/StatusBadge';
import type { DetaliiComandaSelectata } from '../gestiuneComenzi.helpers';
import { formatData, formatSuma } from '../gestiuneComenzi.helpers';

const badgePrioritate = (prioritate: NonNullable<DetaliiComandaSelectata['comandaSelectata']>['prioritate']) => {
  const stiluri = {
    Scazuta: 'border-slate-200 bg-slate-100 text-slate-700',
    Normala: 'border-indigo-200 bg-indigo-50 text-indigo-700',
    Ridicata: 'border-amber-200 bg-amber-50 text-amber-700',
    Urgenta: 'border-rose-200 bg-rose-50 text-rose-700',
  };

  return (
    <span
      className={`inline-flex rounded-md border px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider ${stiluri[prioritate]}`}
    >
      {prioritate}
    </span>
  );
};

interface GestiuneComenziDetailProps extends DetaliiComandaSelectata {
  onInchide: () => void;
}

export default function GestiuneComenziDetail({
  asiguratorSelectat,
  clientSelectat,
  comandaSelectata,
  dosarSelectat,
  mecanicSelectat,
  onInchide,
  pozitiiComandaSelectata,
  rezumatSelectat,
  vehiculSelectat,
}: GestiuneComenziDetailProps) {
  if (!comandaSelectata || !vehiculSelectat || !clientSelectat) {
    return null;
  }

  return (
    <div className="relative z-10 mb-8 flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl shadow-slate-200/40 animate-fisa-intrare">
      <div className="relative bg-slate-900 p-6 text-white">
        <button
          onClick={onInchide}
          className="absolute right-4 top-4 rounded-lg p-2 text-slate-400 transition-all duration-200 hover:rotate-90 hover:scale-110 hover:bg-slate-800 hover:text-white"
          title="Închide fișa"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="flex flex-col gap-4 pr-10 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-indigo-300">
              Fișă Comandă Service
            </span>
            <h2 className="mt-1 text-3xl font-black tracking-tight">{comandaSelectata.nrComanda}</h2>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <span className="text-sm text-slate-400">
                Deschisă la {formatData(comandaSelectata.dataDeschidere)}
              </span>
              <span className="text-slate-600">•</span>
              <span className="text-sm text-slate-400">
                Termen:{' '}
                <strong className="text-slate-300">{formatData(comandaSelectata.termenPromis)}</strong>
              </span>
            </div>
          </div>
          <div className="flex flex-col items-end gap-2">
            <StatusBadge status={comandaSelectata.status} />
            {badgePrioritate(comandaSelectata.prioritate)}
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-6 bg-slate-50/50 p-6 xl:flex-row">
        <div className="flex-1 space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="rounded-xl border border-slate-100 bg-white p-5 shadow-sm transition-shadow hover:shadow-md">
              <div className="mb-3 flex items-center gap-2">
                <div className="h-6 w-1 rounded-full bg-indigo-500" />
                <h4 className="text-sm font-bold uppercase tracking-wide text-slate-800">Vehicul</h4>
              </div>
              <p className="text-xl font-black text-indigo-700">{vehiculSelectat.nrInmatriculare}</p>
              <p className="mt-1 text-sm font-medium text-slate-600">
                {vehiculSelectat.marca} {vehiculSelectat.model}{' '}
                <span className="ml-1 text-slate-400">({vehiculSelectat.an})</span>
              </p>
              <p className="mt-1 break-all text-xs text-slate-400">VIN: {vehiculSelectat.serieSasiu}</p>
              <div className="mt-4 flex justify-between border-t border-slate-100 pt-4 text-xs font-medium text-slate-500">
                <span>Km: {comandaSelectata.kilometrajPreluare}</span>
                <span>Rezervor: {comandaSelectata.nivelCombustibil}</span>
              </div>
            </div>

            <div className="rounded-xl border border-slate-100 bg-white p-5 shadow-sm transition-shadow hover:shadow-md">
              <div className="mb-3 flex items-center gap-2">
                <div className="h-6 w-1 rounded-full bg-emerald-500" />
                <h4 className="text-sm font-bold uppercase tracking-wide text-slate-800">
                  Plătitor: {comandaSelectata.tipPlata}
                </h4>
              </div>
              <p className="text-lg font-bold text-slate-800">{clientSelectat.nume}</p>
              <p className="mt-1 text-sm text-slate-600">{clientSelectat.telefon}</p>
              {clientSelectat.denumireCompanie ? (
                <p className="mt-2 inline-block rounded bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-500">
                  {clientSelectat.denumireCompanie}
                </p>
              ) : null}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {dosarSelectat && asiguratorSelectat ? (
              <div className="rounded-xl border border-blue-100 bg-blue-50/50 p-4 transition-all hover:bg-blue-50">
                <h4 className="mb-1 text-sm font-bold text-blue-900">
                  Dosar Daună {dosarSelectat.tipPolita}
                </h4>
                <p className="text-sm font-medium text-blue-800">
                  {dosarSelectat.nrDosar} <span className="mx-1 text-blue-400">•</span>{' '}
                  {asiguratorSelectat.denumire}
                </p>
                <span className="mt-3 inline-flex rounded-md border border-blue-200 bg-white px-2 py-0.5 text-[10px] font-bold uppercase text-blue-700">
                  {dosarSelectat.statusAprobare}
                </span>
              </div>
            ) : (
              <div className="flex items-center rounded-xl border border-slate-100 bg-white p-4 shadow-sm">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Lucrare Standard
                  </span>
                  <p className="mt-0.5 text-sm font-medium text-slate-600">
                    Fără dosar de daună atașat
                  </p>
                </div>
              </div>
            )}

            <div className="rounded-xl border border-slate-100 bg-white p-4 shadow-sm transition-shadow hover:shadow-md">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Mecanic Alocat
              </span>
              <p className="mt-1 text-sm font-bold text-slate-800">
                {mecanicSelectat?.nume ?? 'Nealocat încă'}
              </p>
              <div className="mt-3 border-t border-slate-50 pt-3">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Observații recepție
                </span>
                <p className="mt-1 text-xs italic text-slate-600">
                  {comandaSelectata.observatiiPreluare || 'Nicio observație'}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-slate-100 bg-white p-5 shadow-sm">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Simptome / Cerințe reclamate
            </span>
            <p className="mt-1.5 text-sm font-medium leading-relaxed text-slate-700">
              {comandaSelectata.simptomeReclamate}
            </p>
          </div>
        </div>

        <div className="flex flex-col overflow-hidden rounded-xl border border-slate-100 bg-white shadow-sm xl:w-[28rem]">
          <div className="flex shrink-0 items-center justify-between border-b border-slate-100 bg-slate-50 px-5 py-4">
            <h4 className="text-sm font-bold text-slate-800">Deviz Lucrare</h4>
            <span className="rounded border border-slate-200 bg-white px-2 py-1 text-xs font-semibold text-slate-500">
              {pozitiiComandaSelectata.length} poziții
            </span>
          </div>

          <div className="flex-1 overflow-y-auto p-2">
            {pozitiiComandaSelectata.length > 0 ? (
              <ul className="space-y-1.5">
                {pozitiiComandaSelectata.map((pozitie) => {
                  const totalLinie = calculeazaRezumatPozitii([pozitie]).total;

                  return (
                    <li
                      key={pozitie.idPozitieCmd}
                      className="rounded-lg border border-transparent p-3 transition-colors hover:border-slate-100 hover:bg-slate-50"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-sm font-bold text-slate-700">{pozitie.descriere}</p>
                          <div className="mt-1 flex items-center gap-2">
                            <span className="font-mono text-xs text-slate-400">{pozitie.codArticol}</span>
                            <span
                              className={`inline-flex h-2 w-2 items-center justify-center rounded-full ${
                                pozitie.disponibilitateStoc ? 'bg-emerald-400' : 'bg-amber-400'
                              }`}
                              title={pozitie.disponibilitateStoc ? 'În stoc' : 'Necesar comandă'}
                            />
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-bold text-slate-800">{formatSuma(totalLinie)}</p>
                          <p className="mt-1 text-xs text-slate-500">
                            {pozitie.cantitate} {pozitie.unitateMasura}
                          </p>
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <div className="p-8 text-center text-sm text-slate-400">Nicio poziție adăugată pe deviz.</div>
            )}
          </div>

          <div className="mt-auto shrink-0 bg-slate-800 p-5 text-white">
            <div className="mb-2 flex justify-between text-xs text-slate-400">
              <span>Subtotal</span>
              <span className="font-medium text-white">{formatSuma(rezumatSelectat.subtotal)}</span>
            </div>
            <div className="mb-3 flex justify-between border-b border-slate-700 pb-3 text-xs text-slate-400">
              <span>TVA (19%)</span>
              <span className="font-medium text-white">{formatSuma(rezumatSelectat.tva)}</span>
            </div>
            <div className="flex items-end justify-between">
              <span className="text-sm font-bold uppercase tracking-wider text-slate-300">Total</span>
              <span className="text-2xl font-black tracking-tight text-emerald-400">
                {formatSuma(rezumatSelectat.total)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
