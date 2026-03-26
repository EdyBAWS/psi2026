import { useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';
import {
  facturiEmiseMock,
  obtineLiniiFacturaEmisaDinMock,
} from '../../../mock/facturare';
import type { FacturaMock } from '../../../mock/types';

export default function Oferta() {
  const [idFacturaSelectata, setIdFacturaSelectata] = useState<number | ''>('');
  const [tipOperatiune, setTipOperatiune] = useState<'discount' | 'storno'>('discount');

  const [searchTerm, setSearchTerm] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [tipDiscount, setTipDiscount] = useState<'procent' | 'valoare'>('procent');
  const [valoareDiscount, setValoareDiscount] = useState<number>(0);
  const [motivOperatiune, setMotivOperatiune] = useState('');
  const [liniiStorno, setLiniiStorno] = useState<number[]>([]);

  const facturiFiltrate = useMemo(() => {
    if (!searchTerm) return facturiEmiseMock;
    const term = searchTerm.toLowerCase();
    return facturiEmiseMock.filter(
      (factura) =>
        factura.numar.toLowerCase().includes(term) ||
        factura.client.toLowerCase().includes(term),
    );
  }, [searchTerm]);

  const factura = useMemo(
    () => facturiEmiseMock.find((item) => item.idFactura === idFacturaSelectata) || null,
    [idFacturaSelectata],
  );

  const liniiFactura = useMemo(
    () => (factura ? obtineLiniiFacturaEmisaDinMock(factura.idFactura) : []),
    [factura],
  );

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectFactura = (facturaGasita: FacturaMock) => {
    setIdFacturaSelectata(facturaGasita.idFactura);
    setSearchTerm(`${facturaGasita.numar} | ${facturaGasita.client}`);
    setIsDropdownOpen(false);
    setValoareDiscount(0);
    setLiniiStorno([]);
  };

  const toggleLinieStorno = (idLinie: number) => {
    setLiniiStorno((prev) =>
      prev.includes(idLinie) ? prev.filter((id) => id !== idLinie) : [...prev, idLinie],
    );
  };

  const calculeFinale = useMemo(() => {
    if (!factura) return null;

    let sumaScazuta = 0;

    if (tipOperatiune === 'discount') {
      sumaScazuta =
        tipDiscount === 'procent'
          ? factura.restDePlata * (valoareDiscount / 100)
          : valoareDiscount;
    } else {
      sumaScazuta = liniiFactura
        .filter((linie) => liniiStorno.includes(linie.idLinie))
        .reduce((acc, linie) => acc + (linie.cantitate * linie.pretUnitar), 0);
    }

    sumaScazuta = Math.min(sumaScazuta, factura.restDePlata);
    return { sumaScazuta, noulRestDePlata: factura.restDePlata - sumaScazuta };
  }, [factura, tipOperatiune, tipDiscount, valoareDiscount, liniiFactura, liniiStorno]);

  const handleSalvare = (e: React.FormEvent) => {
    e.preventDefault();

    if (!factura) {
      toast.error('Selectează o factură mai întâi.');
      return;
    }

    if (!motivOperatiune) {
      toast.error('Motivul sau codul campaniei este obligatoriu.');
      return;
    }

    if (tipOperatiune === 'discount') {
      toast.success(
        `Discount aplicat pe factura ${factura.numar}: -${calculeFinale?.sumaScazuta.toFixed(2)} RON.`,
      );
    } else {
      if (liniiStorno.length === 0) {
        toast.error('Selectează cel puțin o linie pentru a emite factura storno.');
        return;
      }
      toast.success(
        `Factura storno a fost pregătită pentru ${liniiStorno.length} articole în valoare de ${calculeFinale?.sumaScazuta.toFixed(2)} RON.`,
      );
    }

    setIdFacturaSelectata('');
    setSearchTerm('');
    setMotivOperatiune('');
    setValoareDiscount(0);
    setLiniiStorno([]);
  };

  return (
    <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 max-w-4xl mx-auto">
      <div className="mb-8 border-b border-slate-100 pb-4">
        <h2 className="text-2xl font-bold text-slate-800">Ajustări Financiare: Oferte & Storno</h2>
        <p className="text-slate-500 mt-1 text-sm">
          Modul de gestiune a discounturilor comerciale și a retururilor pe facturi.
        </p>
      </div>

      <form onSubmit={handleSalvare} className="space-y-8">
        <div className="bg-slate-50 p-6 rounded-xl border border-slate-200">
          <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wide">
            1. Caută și Selectează Factura
          </label>
          <div className="relative" ref={dropdownRef}>
            <div className="relative">
              <input
                type="text"
                placeholder="Scrie numele clientului sau numărul facturii..."
                className="w-full bg-white border border-slate-300 text-slate-900 rounded-xl pl-12 pr-4 py-3.5 focus:ring-2 focus:ring-indigo-500 outline-none font-medium shadow-sm transition-shadow"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setIsDropdownOpen(true);
                  if (idFacturaSelectata) setIdFacturaSelectata('');
                }}
                onFocus={() => setIsDropdownOpen(true)}
              />
              <svg
                className="w-5 h-5 absolute left-4 top-4 text-slate-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
            {isDropdownOpen && (
              <div className="absolute z-10 w-full mt-2 bg-white border border-slate-200 rounded-xl shadow-xl max-h-60 overflow-y-auto animate-fade-in">
                {facturiFiltrate.length > 0 ? (
                  <ul className="divide-y divide-slate-100">
                    {facturiFiltrate.map((facturaFiltrata) => (
                      <li
                        key={facturaFiltrata.idFactura}
                        onClick={() => handleSelectFactura(facturaFiltrata)}
                        className="p-4 hover:bg-indigo-50 cursor-pointer transition-colors flex justify-between items-center group"
                      >
                        <div>
                          <p className="font-bold text-slate-800 group-hover:text-indigo-700">
                            {facturaFiltrata.numar}
                          </p>
                          <p className="text-sm text-slate-500">{facturaFiltrata.client}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-slate-400">Rest de plată</p>
                          <p className="font-semibold text-rose-600">
                            {facturaFiltrata.restDePlata} RON
                          </p>
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="p-4 text-center text-slate-500 text-sm">
                    Nu a fost găsită nicio factură.
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {factura && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-fade-in">
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-3 uppercase tracking-wide">
                  2. Tipul Ajustării
                </label>
                <div className="flex bg-slate-100 p-1 rounded-xl">
                  <button
                    type="button"
                    onClick={() => setTipOperatiune('discount')}
                    className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all ${
                      tipOperatiune === 'discount'
                        ? 'bg-white shadow-sm text-indigo-700'
                        : 'text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    🏷️ Discount
                  </button>
                  <button
                    type="button"
                    onClick={() => setTipOperatiune('storno')}
                    className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all ${
                      tipOperatiune === 'storno'
                        ? 'bg-white shadow-sm text-rose-600'
                        : 'text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    ↩️ Retur / Storno
                  </button>
                </div>
              </div>

              {tipOperatiune === 'discount' ? (
                <div className="space-y-4 bg-indigo-50 p-5 rounded-xl border border-indigo-100">
                  <div className="flex gap-4">
                    <div className="flex-1">
                      <label className="block text-xs font-semibold text-indigo-900 mb-1">
                        Tip Reducere
                      </label>
                      <select
                        value={tipDiscount}
                        onChange={(e) => setTipDiscount(e.target.value as 'procent' | 'valoare')}
                        className="w-full p-2.5 rounded-lg border border-indigo-200 focus:ring-2 focus:ring-indigo-500 bg-white"
                      >
                        <option value="procent">Procentual (%)</option>
                        <option value="valoare">Valoare Fixă (RON)</option>
                      </select>
                    </div>
                    <div className="flex-1">
                      <label className="block text-xs font-semibold text-indigo-900 mb-1">
                        Valoare
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={valoareDiscount}
                        onChange={(e) => setValoareDiscount(Number(e.target.value))}
                        className="w-full p-2.5 rounded-lg border border-indigo-200 focus:ring-2 focus:ring-indigo-500 font-bold"
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-3 bg-rose-50 p-5 rounded-xl border border-rose-100 max-h-64 overflow-y-auto">
                  <label className="block text-xs font-semibold text-rose-900 mb-2">
                    Selectează articolele stornate:
                  </label>
                  {liniiFactura.map((linie) => (
                    <label
                      key={linie.idLinie}
                      className="flex items-center justify-between p-3 bg-white rounded-lg border border-rose-100 cursor-pointer hover:border-rose-300 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          className="w-4 h-4 text-rose-600 rounded border-gray-300 focus:ring-rose-500"
                          checked={liniiStorno.includes(linie.idLinie)}
                          onChange={() => toggleLinieStorno(linie.idLinie)}
                        />
                        <span className="text-sm font-medium text-slate-700">{linie.denumire}</span>
                      </div>
                      <span className="text-sm font-bold text-rose-700">
                        {(linie.cantitate * linie.pretUnitar).toFixed(2)} RON
                      </span>
                    </label>
                  ))}
                </div>
              )}

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">
                  Motiv / Cod Campanie (Obligatoriu)
                </label>
                <input
                  type="text"
                  required
                  placeholder="Motiv operațiune..."
                  className="w-full bg-white border border-slate-300 text-slate-900 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 outline-none"
                  value={motivOperatiune}
                  onChange={(e) => setMotivOperatiune(e.target.value)}
                />
              </div>
            </div>

            <div className="bg-slate-800 rounded-xl p-6 text-white shadow-lg flex flex-col justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">
                  Impact Financiar
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center text-slate-300">
                    <span>Rest de plată curent:</span>
                    <span className="font-medium">{factura.restDePlata.toFixed(2)} RON</span>
                  </div>
                  <div className="flex justify-between items-center text-emerald-400 font-medium">
                    <span>Suma ajustată:</span>
                    <span>- {calculeFinale?.sumaScazuta.toFixed(2)} RON</span>
                  </div>
                </div>
              </div>
              <div className="border-t border-slate-600 pt-4 mt-6">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-medium text-slate-200">Noua Valoare:</span>
                  <span className="text-3xl font-bold text-white">
                    {calculeFinale?.noulRestDePlata.toFixed(2)}{' '}
                    <span className="text-lg text-slate-400">RON</span>
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="pt-6 border-t border-slate-100 flex justify-end">
          <button
            type="submit"
            disabled={!factura}
            className={`px-8 py-3.5 rounded-xl font-bold text-lg shadow-md transition-all ${
              !factura
                ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                : 'bg-indigo-600 hover:bg-indigo-700 text-white hover:shadow-lg'
            }`}
          >
            ✔ Procesează Operațiunea
          </button>
        </div>
      </form>
    </div>
  );
}
