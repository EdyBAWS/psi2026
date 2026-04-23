// src/modules/04incasari/Incasari.tsx
import { BanknoteArrowDown, Receipt, Wallet } from 'lucide-react';
import { useEffect, useRef } from 'react';
import { EmptyState } from '../../componente/ui/EmptyState';
import { StatCard } from '../../componente/ui/StatCard';
import { useIncasari, METODE_PLATA, formatSuma, formatData } from './useIncasari';

export default function Incasari() {
  const {
    loading, facturiRestanteBD, istoricIncasariBD,
    searchClient, showDropdown, setShowDropdown,
    idClientSelectat, sumaIncasata, setSumaIncasata, modalitate, setModalitate,
    dataIncasare, setDataIncasare, referinta, setReferinta,
    clientiFiltrati, facturiRestante, totalDatorieClient, totalAlocat,
    sumaNum, baniRamasi, areEroareSume, isReferintaObligatorie, referintaLipsa, facturiAlocate,
    handleSelectClient, handleSchimbareCautare, handleAlocareSuma, aplicaSumaMaxima,
    resetaAlocari, handleSalvare
  } = useIncasari();

  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [setShowDropdown]);

  if (loading) return <div className="py-12 text-center text-slate-500">Se încarcă datele de încasări...</div>;

  return (
    <div className="mx-auto max-w-7xl font-sans">
      <div className="mb-8">
        <h2 className="text-3xl font-extrabold tracking-tight text-slate-800">Înregistrare Încasare</h2>
        <p className="mt-1 font-medium text-slate-500">
          Operează plățile clienților și stinge facturile restante din setul comun de mock-uri.
        </p>
      </div>

      <div className="mb-6 grid gap-3 md:grid-cols-3">
        <StatCard
          label="Facturi restante"
          value={facturiRestanteBD.length}
          icon={<Receipt className="h-4 w-4" />}
        />
        <StatCard
          label="Valoare deschisă"
          value={formatSuma(facturiRestanteBD.reduce((total, factura) => total + factura.restDePlata, 0))}
          tone="warning"
          icon={<Wallet className="h-4 w-4" />}
        />
        <StatCard
          label="Încasări demo"
          value={istoricIncasariBD.length}
          tone="success"
          icon={<BanknoteArrowDown className="h-4 w-4" />}
        />
      </div>

      <form onSubmit={handleSalvare} className="grid grid-cols-1 items-start gap-6 lg:grid-cols-12">
        <div className="space-y-6 lg:col-span-8">
          <div className="relative rounded-3xl border border-slate-200 bg-white p-6 shadow-sm" ref={dropdownRef}>
            <div className="mb-4 flex items-center gap-2">
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-indigo-100 text-xs font-bold text-indigo-700">
                1
              </div>
              <h3 className="font-bold text-slate-800">Cine plătește?</h3>
            </div>

            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                className="w-full rounded-xl border border-slate-300 bg-slate-50 py-3.5 pl-11 pr-4 font-medium text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Caută clientul după nume..."
                value={searchClient}
                onChange={handleSchimbareCautare}
                onFocus={() => setShowDropdown(true)}
              />

              {showDropdown ? (
                <div className="absolute z-20 mt-2 max-h-60 w-full overflow-auto rounded-xl border border-slate-200 bg-white shadow-lg">
                  {clientiFiltrati.length > 0 ? (
                    <ul className="py-2">
                      {clientiFiltrati.map((client) => (
                        <li
                          key={client.idClient}
                          onClick={() => handleSelectClient(client)}
                          className="cursor-pointer border-b border-slate-50 px-5 py-3 transition-colors hover:bg-indigo-50 last:border-0"
                        >
                          <div className="font-bold text-slate-800">{client.nume}</div>
                          <div className="text-xs text-slate-500">{client.identificatorFiscal}</div>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div className="px-5 py-4 text-center text-sm text-slate-500">Niciun client găsit.</div>
                  )}
                </div>
              ) : null}
            </div>
          </div>

          {idClientSelectat !== null ? (
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="mb-6 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-indigo-100 text-xs font-bold text-indigo-700">
                    2
                  </div>
                  <h3 className="font-bold text-slate-800">Ce facturi achită?</h3>
                </div>
                {facturiAlocate > 0 ? (
                  <button
                    type="button"
                    onClick={resetaAlocari}
                    className="rounded-xl bg-slate-100 px-3 py-2 text-xs font-bold text-slate-500 transition-colors hover:bg-slate-200"
                  >
                    Resetează Sumele
                  </button>
                ) : null}
              </div>

              {facturiRestante.length > 0 ? (
                <div className="space-y-4">
                  {facturiRestante.map((factura) => {
                    const alocatNum = Number(factura.sumaAlocata) || 0;
                    const esteAchitatIntegral = alocatNum === factura.restDePlata && alocatNum > 0;
                    const estePlatitPartial = alocatNum > 0 && alocatNum < factura.restDePlata;
                    const restRamas = factura.restDePlata - alocatNum;

                    const containerClass = esteAchitatIntegral
                      ? 'border-emerald-200 bg-emerald-50/50'
                      : estePlatitPartial
                        ? 'border-amber-200 bg-amber-50/30'
                        : 'border-slate-200 bg-slate-50/50 hover:border-slate-300';

                    return (
                      <div
                        key={factura.idFactura}
                        className={`flex flex-col items-center justify-between gap-3 rounded-2xl border p-4 transition-all md:flex-row ${containerClass}`}
                      >
                        <div className="mb-1 w-full flex-1 md:mb-0 md:w-auto">
                          <div className="flex items-center gap-2">
                            <div className="text-base font-bold text-slate-800">{factura.numar}</div>
                            {esteAchitatIntegral ? (
                              <span className="rounded-md bg-emerald-100 px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-emerald-700">
                                Achitat integral
                              </span>
                            ) : null}
                            {estePlatitPartial ? (
                              <span className="rounded-md bg-amber-100 px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-amber-700">
                                Rest rămas: {formatSuma(restRamas)}
                              </span>
                            ) : null}
                          </div>
                          <div className="mt-1 text-xs text-slate-500">
                            Emisă: {formatData(factura.dataEmitere)} • Rest curent:{' '}
                            <span className="font-bold text-slate-700">{formatSuma(factura.restDePlata)}</span>
                          </div>
                        </div>

                        <div className="flex w-full items-center gap-3 md:w-auto">
                          <button
                            type="button"
                            onClick={() => aplicaSumaMaxima(factura.idFactura, factura.restDePlata)}
                            className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs font-bold text-slate-500 shadow-sm transition-colors hover:text-indigo-600"
                          >
                            Plătește tot
                          </button>
                          <input
                            type="number"
                            min="0"
                            max={factura.restDePlata}
                            step="0.01"
                            className={`w-32 rounded-xl border bg-white px-3 py-2.5 text-right text-sm font-bold shadow-sm outline-none transition-all ${
                              esteAchitatIntegral
                                ? 'border-emerald-300 text-emerald-700 focus:ring-2 focus:ring-emerald-200'
                                : estePlatitPartial
                                  ? 'border-amber-300 text-amber-800 focus:ring-2 focus:ring-amber-200'
                                  : 'border-slate-300 focus:ring-2 focus:ring-indigo-500'
                            }`}
                            value={factura.sumaAlocata}
                            onChange={(event) => handleAlocareSuma(factura.idFactura, event.target.value)}
                            placeholder="0.00"
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <EmptyState
                  title="Clientul este la zi"
                  description="Clientul selectat nu are facturi restante în setul comun de demo."
                />
              )}
            </div>
          ) : (
            <EmptyState
              title="Niciun client selectat"
              description="Alege un client din lista comună de facturi restante pentru a continua repartizarea."
            />
          )}
        </div>

        <div className="lg:col-span-4">
          <div className="sticky top-6 flex h-full min-h-[32rem] flex-col rounded-3xl bg-slate-900 p-6 text-white shadow-xl">
            <h3 className="mb-6 border-b border-slate-800 pb-4 text-sm font-bold uppercase tracking-widest text-slate-400">
              Detalii Încasare
            </h3>

            <div className="mb-6">
              <label className="mb-2 block text-xs font-medium text-slate-400">Bani primiți</label>
              <div className="relative">
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  className="w-full rounded-2xl border-2 border-slate-700 bg-slate-800 px-5 py-4 text-3xl font-light text-white outline-none transition-all placeholder:text-slate-600 focus:border-indigo-500"
                  placeholder="0.00"
                  value={sumaIncasata}
                  onChange={(event) => setSumaIncasata(event.target.value === '' ? '' : Number(event.target.value))}
                />
                <span className="absolute right-5 top-1/2 -translate-y-1/2 font-bold text-slate-500">RON</span>
              </div>
            </div>

            <div className="mb-6 space-y-4 rounded-2xl border border-slate-700/50 bg-slate-800/50 p-4">
              <div>
                <label className="mb-2 block text-xs font-medium text-slate-400">Data încasării</label>
                <input
                  type="date"
                  className="w-full rounded-xl border border-slate-600 bg-slate-800 px-4 py-2.5 text-sm text-white focus:border-indigo-500 focus:outline-none"
                  value={dataIncasare}
                  onChange={(event) => setDataIncasare(event.target.value)}
                />
              </div>

              <div>
                <label className="mb-2 block text-xs font-medium text-slate-400">Metodă de plată</label>
                <div className="grid grid-cols-3 gap-2">
                  {METODE_PLATA.map((metoda) => (
                    <button
                      key={metoda.id}
                      type="button"
                      onClick={() => setModalitate(metoda.id)}
                      className={`rounded-xl border py-2 text-[11px] font-bold transition-all ${
                        modalitate === metoda.id
                          ? 'border-indigo-500 bg-indigo-600 text-white shadow-md'
                          : 'border-slate-600 bg-slate-800 text-slate-400 hover:bg-slate-700'
                      }`}
                    >
                      {metoda.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="mb-2 block text-xs font-medium text-slate-400">
                  Referință document {isReferintaObligatorie ? <span className="text-rose-400">*</span> : null}
                </label>
                <input
                  type="text"
                  className={`w-full rounded-xl border bg-slate-800 px-4 py-2.5 text-sm text-white placeholder:text-slate-600 focus:outline-none ${
                    referintaLipsa
                      ? 'border-rose-500/50 focus:border-rose-500'
                      : 'border-slate-600 focus:border-indigo-500'
                  }`}
                  placeholder={modalitate === 'Cash' ? 'Ex: Nr. bon fiscal (opțional)' : 'Ex: Nr. OP / POS'}
                  value={referinta}
                  onChange={(event) => setReferinta(event.target.value)}
                />
                {referintaLipsa ? (
                  <p className="mt-1 text-[10px] text-rose-400">Obligatoriu pentru bancă sau POS.</p>
                ) : null}
              </div>
            </div>

            <div className="mb-auto space-y-3 px-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-400">Total datorie client</span>
                <span className="font-medium text-slate-300">{formatSuma(totalDatorieClient)}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-300">Total repartizat</span>
                <span className="font-medium text-slate-200">{formatSuma(totalAlocat)}</span>
              </div>
              <div className="flex items-center justify-between border-t border-slate-700/50 pt-2">
                <span className="text-sm font-medium text-slate-300">
                  {baniRamasi >= 0 ? 'Bani nealocați' : 'Bani lipsă'}
                </span>
                <span
                  className={`text-lg font-bold ${
                    baniRamasi < 0 ? 'text-rose-400' : baniRamasi > 0 ? 'text-emerald-400' : 'text-slate-200'
                  }`}
                >
                  {formatSuma(Math.abs(baniRamasi))}
                </span>
              </div>
            </div>

            <button
              type="submit"
              disabled={idClientSelectat === null || sumaNum <= 0 || areEroareSume || referintaLipsa}
              className="mt-8 w-full rounded-2xl bg-emerald-500 py-4 font-bold text-white shadow-[0_0_20px_rgba(16,185,129,0.2)] transition-all hover:bg-emerald-400 disabled:cursor-not-allowed disabled:bg-slate-800 disabled:text-slate-500 disabled:shadow-none"
            >
              {idClientSelectat === null
                ? '1. Alege clientul'
                : sumaNum <= 0
                  ? '2. Introdu suma'
                  : areEroareSume
                    ? 'Corectează sumele'
                    : referintaLipsa
                      ? 'Adaugă referința'
                      : 'Înregistrează încasarea'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}