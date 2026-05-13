// src/modules/04incasari/Incasari.tsx
import { BanknoteArrowDown, Receipt, Wallet } from 'lucide-react';
import { useEffect, useRef } from 'react';
import { Button } from '../../componente/ui/Button';
import { EmptyState } from '../../componente/ui/EmptyState';
import { PageHeader } from '../../componente/ui/PageHeader';
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

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24 text-slate-400">
        Se încarcă datele de încasări...
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-10">
      {/* ── HEADER ─────────────────────────────────────────────────────────── */}
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
        <PageHeader
          title="Înregistrare Încasare"
          description="Operează plățile clienților și stinge facturile restante salvate în backend."
        />
        <div className="flex flex-wrap gap-4 mt-2">
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
            label="Încasări"
            value={istoricIncasariBD.length}
            tone="success"
            icon={<BanknoteArrowDown className="h-4 w-4" />}
          />
        </div>
      </div>

      {/* ── CONȚINUT PRINCIPAL ──────────────────────────────────────────────── */}
      <form onSubmit={handleSalvare} className="grid grid-cols-1 items-start gap-6 lg:grid-cols-12">
        
        {/* PARTEA STÂNGĂ: Selecție Client și Facturi */}
        <div className="space-y-6 lg:col-span-8">
          
          {/* Bloc 1: Client */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100" ref={dropdownRef}>
            <h4 className="text-lg font-bold text-slate-800 mb-4 border-b border-slate-100 pb-3 flex items-center gap-2">
              <span className="flex h-5 w-5 items-center justify-center rounded bg-indigo-100 text-[10px] font-bold text-indigo-700">1</span>
              Cine plătește?
            </h4>
            
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                className="w-full rounded-md border border-slate-200 bg-white py-2 pl-9 pr-3 text-[13px] text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                placeholder="Caută clientul după nume sau CUI..."
                value={searchClient}
                onChange={handleSchimbareCautare}
                onFocus={() => setShowDropdown(true)}
              />

              {showDropdown ? (
                <div className="absolute z-20 mt-1 max-h-60 w-full overflow-auto rounded-md border border-slate-200 bg-white shadow-lg">
                  {clientiFiltrati.length > 0 ? (
                    <ul className="py-1">
                      {clientiFiltrati.map((client) => (
                        <li
                          key={client.idClient}
                          onClick={() => handleSelectClient(client)}
                          className="cursor-pointer px-4 py-2 text-[13px] hover:bg-slate-50"
                        >
                          <div className="font-bold text-slate-800">{client.nume}</div>
                          <div className="text-xs text-slate-500">{client.identificatorFiscal}</div>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div className="px-4 py-3 text-center text-[13px] text-slate-500">Niciun client găsit.</div>
                  )}
                </div>
              ) : null}
            </div>
          </div>

          {/* Bloc 2: Facturi */}
          {idClientSelectat !== null ? (
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
               <div className="mb-4 border-b border-slate-100 pb-3 flex items-center justify-between">
                <h4 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                  <span className="flex h-5 w-5 items-center justify-center rounded bg-indigo-100 text-[10px] font-bold text-indigo-700">2</span>
                  Ce facturi achită?
                </h4>
                {facturiAlocate > 0 && (
                  <Button variant="ghost" size="sm" type="button" onClick={resetaAlocari}>
                    Resetează Sumele
                  </Button>
                )}
              </div>

              {facturiRestante.length > 0 ? (
                <div className="divide-y divide-slate-100 border border-slate-100 rounded-lg overflow-hidden">
                  {facturiRestante.map((factura) => {
                    const alocatNum = Number(factura.sumaAlocata) || 0;
                    const esteAchitatIntegral = alocatNum === factura.restDePlata && alocatNum > 0;
                    const estePlatitPartial = alocatNum > 0 && alocatNum < factura.restDePlata;
                    const restRamas = factura.restDePlata - alocatNum;

                    return (
                      <div
                        key={factura.idFactura}
                        className={`flex flex-col md:flex-row items-center justify-between p-4 transition-colors ${
                          esteAchitatIntegral ? 'bg-emerald-50/50' : estePlatitPartial ? 'bg-amber-50/30' : 'bg-white hover:bg-slate-50/80'
                        }`}
                      >
                        <div className="w-full flex-1 md:w-auto">
                          <div className="flex items-center gap-2">
                            <div className="text-[13px] font-bold text-slate-800">{factura.numar}</div>
                            {esteAchitatIntegral && (
                              <span className="bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase">Achitat</span>
                            )}
                            {estePlatitPartial && (
                              <span className="bg-amber-100 text-amber-700 px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase">Rest: {formatSuma(restRamas)}</span>
                            )}
                          </div>
                          <div className="mt-1 text-xs text-slate-500">
                            Emisă: {formatData(factura.dataEmitere)} • Rest curent:{' '}
                            <span className="font-semibold text-slate-700">{formatSuma(factura.restDePlata)}</span>
                          </div>
                        </div>

                        <div className="mt-3 md:mt-0 flex w-full md:w-auto items-center gap-3">
                          <Button
                            variant="outline"
                            size="sm"
                            type="button"
                            onClick={() => aplicaSumaMaxima(factura.idFactura, factura.restDePlata)}
                          >
                            Plătește tot
                          </Button>
                          <input
                            type="number"
                            min="0"
                            max={factura.restDePlata}
                            step="0.01"
                            className={`w-28 rounded-md border px-3 py-1.5 text-right text-[13px] font-medium outline-none transition-all ${
                              esteAchitatIntegral
                                ? 'border-emerald-300 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500'
                                : estePlatitPartial
                                  ? 'border-amber-300 focus:border-amber-500 focus:ring-1 focus:ring-amber-500'
                                  : 'border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500'
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
                  description="Clientul selectat nu are facturi restante în backend."
                />
              )}
            </div>
          ) : (
             <EmptyState
              title="Niciun client selectat"
              description="Alege un client din listă pentru a continua repartizarea sumelor."
            />
          )}
        </div>

        {/* PARTEA DREAPTĂ: Detalii și Sumar */}
        <div className="lg:col-span-4">
          <div className="bg-white p-6 rounded-2xl shadow-xl shadow-slate-200/50 border border-indigo-100 sticky top-6">
            <h4 className="text-lg font-bold text-slate-800 mb-4 border-b border-slate-100 pb-3 flex items-center gap-2">
               <span className="flex h-5 w-5 items-center justify-center rounded bg-indigo-100 text-[10px] font-bold text-indigo-700">3</span>
               Detalii Încasare
            </h4>

            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-[13px] font-medium text-slate-700">Bani primiți (RON) *</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-base font-bold text-slate-800 placeholder-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  placeholder="0.00"
                  value={sumaIncasata}
                  onChange={(event) => setSumaIncasata(event.target.value === '' ? '' : Number(event.target.value))}
                />
              </div>

              <div>
                <label className="mb-1 block text-[13px] font-medium text-slate-700">Data încasării *</label>
                <input
                  type="date"
                  className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-[13px] text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  value={dataIncasare}
                  onChange={(event) => setDataIncasare(event.target.value)}
                />
              </div>

              <div>
                <label className="mb-1 block text-[13px] font-medium text-slate-700">Metodă de plată *</label>
                <div className="grid grid-cols-3 gap-2">
                  {METODE_PLATA.map((metoda) => (
                    <button
                      key={metoda.id}
                      type="button"
                      onClick={() => setModalitate(metoda.id)}
                      className={`rounded-md border py-1.5 text-[11px] font-bold transition-all ${
                        modalitate === metoda.id
                          ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                          : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {metoda.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="mb-1 block text-[13px] font-medium text-slate-700">
                  Referință document {isReferintaObligatorie && <span className="text-rose-500">*</span>}
                </label>
                <input
                  type="text"
                  className={`w-full rounded-md border px-3 py-2 text-[13px] focus:outline-none focus:ring-1 ${
                    referintaLipsa
                      ? 'border-rose-300 bg-rose-50/40 text-slate-900 focus:border-rose-500 focus:ring-rose-500'
                      : 'border-slate-300 bg-white text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:ring-indigo-500'
                  }`}
                  placeholder={modalitate === 'Cash' ? 'Ex: Nr. bon (opțional)' : 'Ex: Nr. OP / POS'}
                  value={referinta}
                  onChange={(event) => setReferinta(event.target.value)}
                />
              </div>
            </div>

            <div className="mt-6 space-y-2 bg-slate-50 p-4 rounded-lg border border-slate-100">
              <div className="flex items-center justify-between text-[13px]">
                <span className="text-slate-500">Total datorie</span>
                <span className="font-semibold text-slate-700">{formatSuma(totalDatorieClient)}</span>
              </div>
              <div className="flex items-center justify-between text-[13px]">
                <span className="text-slate-500">Total repartizat</span>
                <span className="font-semibold text-slate-700">{formatSuma(totalAlocat)}</span>
              </div>
              <div className="flex items-center justify-between border-t border-slate-200 pt-2 mt-2">
                <span className="text-[13px] font-bold text-slate-700">
                  {baniRamasi >= 0 ? 'Bani nealocați' : 'Eroare (Bani lipsă)'}
                </span>
                <span
                  className={`text-sm font-bold ${
                    baniRamasi < 0 ? 'text-rose-600' : baniRamasi > 0 ? 'text-emerald-600' : 'text-slate-800'
                  }`}
                >
                  {formatSuma(Math.abs(baniRamasi))}
                </span>
              </div>
            </div>

            <div className="mt-6">
              <Button
                variant="primary"
                type="submit"
                className="w-full justify-center"
                disabled={idClientSelectat === null || sumaNum <= 0 || areEroareSume || referintaLipsa}
              >
                {idClientSelectat === null
                  ? 'Alege clientul'
                  : sumaNum <= 0
                    ? 'Introdu suma'
                    : areEroareSume
                      ? 'Corectează sumele'
                      : referintaLipsa
                        ? 'Adaugă referința'
                        : 'Înregistrează încasarea'}
              </Button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
