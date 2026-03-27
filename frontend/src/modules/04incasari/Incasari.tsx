import React, { useState, useMemo, useRef, useEffect, type FormEvent, type ChangeEvent } from 'react';

// --- INTERFEȚE ---
interface FacturaRestanta {
  idFactura: number;
  numar: string;
  dataEmitere: string;
  restDePlata: number;
  sumaAlocata: number | '';
}

interface Client {
  id: string;
  nume: string;
  cui: string;
}

// --- DATE DE TEST ---
const CLIENTI_MOCK: Client[] = [
  { id: '1', nume: 'SC Auto Fleet SRL', cui: 'RO123456' },
  { id: '2', nume: 'Ion Popescu', cui: 'CNP: 190...' },
  { id: '3', nume: 'Omega Construct SA', cui: 'RO987654' },
];

const FACTURI_MOCK: Record<string, FacturaRestanta[]> = {
  '1': [
    { idFactura: 101, numar: 'F-2026-001', dataEmitere: '01 Mar 2026', restDePlata: 1500, sumaAlocata: '' },
    { idFactura: 102, numar: 'F-2026-005', dataEmitere: '10 Mar 2026', restDePlata: 850, sumaAlocata: '' },
  ],
  '2': [
    { idFactura: 201, numar: 'F-2026-021', dataEmitere: '05 Mar 2026', restDePlata: 3200, sumaAlocata: '' },
  ],
  '3': [
    { idFactura: 301, numar: 'F-2026-041', dataEmitere: '02 Feb 2026', restDePlata: 9500, sumaAlocata: '' },
  ],
};

const METODE = [
  { id: 'Transfer Bancar', label: 'OP / Bancă' },
  { id: 'POS', label: 'Card (POS)' },
  { id: 'Cash', label: 'Numerar / Bon' },
];

export default function Incasari() {
  // --- STĂRI PENTRU AUTOCOMPLETE CLIENȚI ---
  const [searchClient, setSearchClient] = useState<string>('');
  const [showDropdown, setShowDropdown] = useState<boolean>(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // --- STĂRI FORMULAR ---
  const [clientSelectat, setClientSelectat] = useState<string>('');
  const [sumaIncasata, setSumaIncasata] = useState<number | ''>('');
  const [modalitate, setModalitate] = useState<string>('Transfer Bancar');
  const [dataIncasare, setDataIncasare] = useState<string>(new Date().toISOString().split('T')[0]);
  const [referinta, setReferinta] = useState<string>('');
  const [facturiRestante, setFacturiRestante] = useState<FacturaRestanta[]>([]);

  // Închide dropdown-ul dacă dai click în afara lui
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const clientiFiltrati = CLIENTI_MOCK.filter(c => 
    c.nume.toLowerCase().includes(searchClient.toLowerCase()) || 
    c.cui.toLowerCase().includes(searchClient.toLowerCase())
  );

  // --- CALCULE ---
  const totalDatorieClient = useMemo(
    () => facturiRestante.reduce((acc, f) => acc + f.restDePlata, 0),
    [facturiRestante]
  );

  const totalAlocat = useMemo(
    () => facturiRestante.reduce((acc, f) => acc + (Number(f.sumaAlocata) || 0), 0),
    [facturiRestante]
  );
  
  const sumaNum = Number(sumaIncasata) || 0;
  const baniRamasi = sumaNum - totalAlocat;
  const areEroareSume = baniRamasi < 0;

  const isReferintaObligatorie = modalitate === 'Transfer Bancar' || modalitate === 'POS';
  const referintaLipsa = isReferintaObligatorie && referinta.trim() === '';

  // --- HANDLERS ---
  const handleSelectClient = (id: string, nume: string) => {
    setClientSelectat(id);
    setSearchClient(nume);
    setShowDropdown(false);
    setSumaIncasata(''); 
    
    const facturiClient = FACTURI_MOCK[id] || [];
    setFacturiRestante(facturiClient.map(f => ({ ...f, sumaAlocata: '' as const })));
  };

  const handleSchimbareCautare = (e: ChangeEvent<HTMLInputElement>) => {
    setSearchClient(e.target.value);
    setShowDropdown(true);
    if (clientSelectat) {
      setClientSelectat('');
      setFacturiRestante([]);
      setSumaIncasata('');
    }
  };

  const handleAlocareSuma = (idFactura: number, valoare: string) => {
    setFacturiRestante(prev => {
      const targetFactura = prev.find(f => f.idFactura === idFactura);
      if (!targetFactura) return prev;

      const raw = Number(valoare);
      const clamped = valoare === '' ? ('' as const) : Math.max(0, raw); 
      
      const newState = prev.map(f => f.idFactura === idFactura ? { ...f, sumaAlocata: clamped } : f);
      
      const noulTotalAlocat = newState.reduce((acc, f) => acc + (Number(f.sumaAlocata) || 0), 0);
      setSumaIncasata(noulTotalAlocat > 0 ? parseFloat(noulTotalAlocat.toFixed(2)) : '');

      return newState;
    });
  };

  const aplicaSumaMaxima = (idFactura: number, restDePlata: number) => {
    handleAlocareSuma(idFactura, restDePlata.toString());
  };

  const resetaAlocari = () => {
    setFacturiRestante(prev => prev.map(f => ({ ...f, sumaAlocata: '' as const })));
    setSumaIncasata(''); 
  };

  const reseteazaFormular = () => {
    setClientSelectat('');
    setSearchClient('');
    setSumaIncasata('');
    setReferinta('');
    setModalitate('Transfer Bancar');
    setDataIncasare(new Date().toISOString().split('T')[0]);
    setFacturiRestante([]);
  };

  const handleSalvare = (e: FormEvent) => {
    e.preventDefault();
    if (!clientSelectat || !sumaIncasata) return alert('Selectează clientul și introdu suma primită!');
    if (areEroareSume) return alert('Eroare: Ai alocat pe facturi mai mulți bani decât ai primit!');
    if (referintaLipsa) return alert(`Te rog introdu numărul documentului pentru metoda: ${modalitate}!`);
    
    alert(`✓ Tranzacție salvată cu succes!\n\nClient: ${searchClient}\nDată: ${dataIncasare}\nDocument: ${referinta || 'N/A'}\nTotal: ${sumaNum} RON\nRepartizat: ${totalAlocat} RON`);
    reseteazaFormular();
  };

  return (
    <div className="max-w-7xl mx-auto font-sans">
      
      <div className="mb-8">
        <h2 className="text-3xl font-extrabold text-slate-800 tracking-tight">Înregistrare Încasare</h2>
        <p className="text-slate-500 mt-1 font-medium">Operează plățile clienților și închide facturile restante.</p>
      </div>

      <form onSubmit={handleSalvare} className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

        {/* PARTEA STÂNGĂ */}
        <div className="lg:col-span-8 space-y-6">

          {/* Pasul 1: Căutare Client */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm relative" ref={dropdownRef}>
            <div className="flex items-center gap-2 mb-4">
              <div className="bg-indigo-100 text-indigo-700 w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs">1</div>
              <h3 className="font-bold text-slate-800">Cine plătește?</h3>
            </div>
            
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
              </div>
              <input
                type="text"
                className="w-full bg-slate-50 border border-slate-300 text-slate-900 rounded-xl pl-11 pr-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all font-medium placeholder:text-slate-400"
                placeholder="Caută clientul după nume sau CUI..."
                value={searchClient}
                onChange={handleSchimbareCautare}
                onFocus={() => setShowDropdown(true)}
              />

              {showDropdown && (
                <div className="absolute z-20 w-full mt-2 bg-white border border-slate-200 rounded-xl shadow-lg max-h-60 overflow-auto">
                  {clientiFiltrati.length > 0 ? (
                    <ul className="py-2">
                      {clientiFiltrati.map((c) => (
                        <li 
                          key={c.id} 
                          onClick={() => handleSelectClient(c.id, c.nume)}
                          className="px-5 py-3 hover:bg-indigo-50 cursor-pointer transition-colors border-b border-slate-50 last:border-0"
                        >
                          <div className="font-bold text-slate-800">{c.nume}</div>
                          <div className="text-xs text-slate-500">{c.cui}</div>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div className="px-5 py-4 text-sm text-slate-500 text-center">Niciun client găsit.</div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Pasul 2: Facturi */}
          {clientSelectat && (
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm transition-all">
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-2">
                  <div className="bg-indigo-100 text-indigo-700 w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs">2</div>
                  <h3 className="font-bold text-slate-800">Ce facturi achită?</h3>
                </div>
                
                <div className="flex items-center gap-2">
                   {totalAlocat > 0 && (
                     <button type="button" onClick={resetaAlocari} className="text-xs text-slate-500 bg-slate-100 hover:bg-slate-200 font-bold px-3 py-2 rounded-xl transition-colors shadow-sm">
                       Resetează Sumele
                     </button>
                   )}
                </div>
              </div>

              {facturiRestante.length > 0 ? (
                <div className="space-y-4">
                  {facturiRestante.map(f => {
                    const alocatNum = Number(f.sumaAlocata) || 0;
                    const esteAchitatIntegral = alocatNum >= f.restDePlata && alocatNum > 0;
                    const estePlatitPartial = alocatNum > 0 && alocatNum < f.restDePlata;
                    const areEroareFactura = alocatNum > f.restDePlata;
                    const restRamas = f.restDePlata - alocatNum;

                    const containerClass = esteAchitatIntegral 
                        ? 'bg-emerald-50/50 border-emerald-200' 
                        : estePlatitPartial 
                        ? 'bg-amber-50/20 border-amber-200' 
                        : areEroareFactura 
                        ? 'bg-rose-50 border-rose-200'
                        : 'bg-slate-50/50 border-slate-200 hover:border-slate-300';

                    return (
                      <div key={f.idFactura} className={`flex flex-col md:flex-row items-center justify-between p-4 rounded-2xl border ${containerClass} transition-all`}>
                        
                        <div className="flex-1 w-full md:w-auto mb-3 md:mb-0">
                          <div className="flex items-center gap-2">
                            <div className="font-bold text-slate-800 text-base">{f.numar}</div>
                            {esteAchitatIntegral && <span className="text-[10px] uppercase font-black tracking-wider bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-md">Achitat Integral</span>}
                            {estePlatitPartial && <span className="text-[10px] uppercase font-black tracking-wider bg-amber-100 text-amber-700 px-2 py-0.5 rounded-md">Rest Rămas: {restRamas.toFixed(2)} RON</span>}
                          </div>
                          <div className="text-xs text-slate-500 mt-1">Emisă: {f.dataEmitere} • Total factură: <span className="font-bold text-slate-700">{f.restDePlata.toFixed(2)} RON</span></div>
                        </div>

                        <div className="flex items-center gap-3 w-full md:w-auto">
                          <button type="button" onClick={() => aplicaSumaMaxima(f.idFactura, f.restDePlata)}
                                  className="text-xs font-bold text-slate-500 hover:text-indigo-600 border border-slate-200 bg-white px-3 py-2.5 rounded-xl transition-colors shadow-sm active:scale-95">
                            Plătește Tot
                          </button>
                          
                          <input
                            type="number"
                            className={`w-32 bg-white border rounded-xl px-3 py-2.5 text-right font-bold text-sm outline-none transition-all shadow-sm ${areEroareFactura ? 'border-rose-400 text-rose-600 focus:ring-2 focus:ring-rose-200' : esteAchitatIntegral ? 'border-emerald-300 text-emerald-700 focus:ring-2 focus:ring-emerald-200' : estePlatitPartial ? 'border-amber-300 text-amber-800 focus:ring-2 focus:ring-amber-200' : 'border-slate-300 focus:ring-2 focus:ring-indigo-500'}`}
                            value={f.sumaAlocata}
                            onChange={e => handleAlocareSuma(f.idFactura, e.target.value)}
                            placeholder="0.00"
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-10 bg-slate-50 rounded-2xl border border-slate-100">
                  <div className="text-4xl mb-2">🎉</div>
                  <p className="text-slate-500 font-medium">Clientul este la zi, nu are facturi restante.</p>
                </div>
              )}
            </div>
          )}

        </div>

        {/* PARTEA DREAPTĂ: Chitanțierul */}
        <div className="lg:col-span-4">
          <div className="bg-slate-900 rounded-3xl p-6 shadow-xl sticky top-6 text-white flex flex-col h-full min-h-100">
            
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-6 border-b border-slate-800 pb-4 flex justify-between">
              <span>Detalii Încasare</span>
            </h3>

            {/* Input Sumă Primită */}
            <div className="mb-6">
              <label className="block text-xs font-medium text-slate-400 mb-2">Bani primiți:</label>
              <div className="relative">
                <input
                  type="number"
                  className="w-full bg-slate-800 border-2 border-slate-700 rounded-2xl px-5 py-4 text-3xl font-mono font-light text-white outline-none focus:border-indigo-500 transition-all placeholder:text-slate-600"
                  placeholder="0.00"
                  value={sumaIncasata}
                  onChange={e => setSumaIncasata(e.target.value === '' ? '' : Number(e.target.value))}
                />
                <span className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-500 font-bold">RON</span>
              </div>
            </div>

            {/* Audit */}
            <div className="bg-slate-800/50 rounded-2xl p-4 mb-6 border border-slate-700/50 space-y-4">
               <div>
                  <label className="block text-xs font-medium text-slate-400 mb-2">Data Încasării</label>
                  <input type="date" className="w-full bg-slate-800 border border-slate-600 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
                         value={dataIncasare} onChange={e => setDataIncasare(e.target.value)} />
               </div>

               <div>
                  <label className="block text-xs font-medium text-slate-400 mb-2">Metodă de plată</label>
                  <div className="grid grid-cols-3 gap-2">
                    {METODE.map(m => (
                      <button key={m.id} type="button" onClick={() => setModalitate(m.id)}
                              className={`py-2 text-[11px] font-bold rounded-xl border transition-all ${modalitate === m.id ? 'bg-indigo-600 border-indigo-500 text-white shadow-md' : 'bg-slate-800 border-slate-600 text-slate-400 hover:bg-slate-700'}`}>
                        {m.label}
                      </button>
                    ))}
                  </div>
               </div>

               <div>
                  <label className="block text-xs font-medium text-slate-400 mb-2">
                    Referință Document {isReferintaObligatorie && <span className="text-rose-400">*</span>}
                  </label>
                  <input type="text" 
                         className={`w-full bg-slate-800 border rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500 placeholder:text-slate-600 transition-colors ${referintaLipsa ? 'border-rose-500/50 focus:border-rose-500' : 'border-slate-600'}`}
                         placeholder={modalitate === 'Cash' ? 'Ex: Nr. Bon Fiscal (Opțional)' : 'Ex: Nr. OP / Nr. Bon POS'}
                         value={referinta} onChange={e => setReferinta(e.target.value)} />
                  {referintaLipsa && <p className="text-[10px] text-rose-400 mt-1">Obligatoriu pentru bancă/POS.</p>}
               </div>
            </div>

            {/* Totaluri Refăcute */}
            <div className="space-y-3 mb-auto px-2">
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-400">Total Datorie Client:</span>
                <span className="font-mono font-medium text-slate-400">{totalDatorieClient.toFixed(2)} RON</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-300">Total Repartizat:</span>
                <span className="font-mono font-medium text-slate-200">{totalAlocat.toFixed(2)} RON</span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-slate-700/50">
                <span className="text-slate-300 font-medium text-sm">Bani nealocați (Rest/Avans):</span>
                <span className={`font-mono font-bold text-lg ${baniRamasi < 0 ? 'text-rose-400' : baniRamasi > 0 ? 'text-emerald-400' : 'text-slate-300'}`}>
                  {baniRamasi.toFixed(2)} RON
                </span>
              </div>
            </div>

            {/* Buton Final */}
            <button
              type="submit"
              disabled={!clientSelectat || !sumaIncasata || areEroareSume || referintaLipsa}
              className="mt-8 w-full bg-emerald-500 hover:bg-emerald-400 disabled:bg-slate-800 disabled:text-slate-500 text-white py-4 rounded-2xl font-bold transition-all disabled:cursor-not-allowed shadow-[0_0_20px_rgba(16,185,129,0.2)] disabled:shadow-none"
            >
              {!clientSelectat ? '1. Alege Clientul' : !sumaIncasata ? '2. Introdu Suma' : areEroareSume ? 'Eroare la sume' : referintaLipsa ? 'Adaugă Referința' : 'Înregistrează Încasarea'}
            </button>

          </div>
        </div>

      </form>
    </div>
  );
}