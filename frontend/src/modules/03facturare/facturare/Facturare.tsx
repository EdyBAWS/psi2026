// src/modules/03facturare/Facturare.tsx
import { FileClock, Receipt, Wallet } from 'lucide-react';
import { EmptyState } from '../../../componente/ui/EmptyState';
import { StatCard } from '../../../componente/ui/StatCard';
import { useFacturare } from './useFacturare';

export default function Facturare() {
  const {
    loading, comenziGata, comenziFiltrate, totalValoareFacturabila,
    comandaSelectata, setComandaSelectata,
    cautare, setCautare, sortField, sortDir, handleSort,
    serieFactura, setSerieFactura, numarFactura, setNumarFactura,
    termenPlata, setTermenPlata, discountProcent, setDiscountProcent,
    penalizareProcent, setPenalizareProcent,
    liniiFactura, subtotal, valoareTVA, valoareDiscount, valoarePenalizare, totalPlata, dataScadenta,
    handleEmitereFactura
  } = useFacturare();

  if (loading) return <div className="py-12 text-center text-slate-500">Se încarcă comenzile...</div>;

  return (
    <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 relative overflow-hidden">
      <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
        <Receipt className="w-64 h-64 text-indigo-900" />
      </div>
      <div className="relative z-10">
      <div className="flex justify-between items-center mb-8 border-b border-slate-100 pb-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">
            {comandaSelectata ? 'Emitere Factură Fiscală' : 'Facturare Comenzi (În Așteptare)'}
          </h2>
          <p className="text-slate-500 mt-1 text-sm">
            {comandaSelectata
              ? `Generare documente fiscale pentru comanda #${comandaSelectata.nrComanda}`
              : 'Selectează o comandă din lista de mai jos pentru a genera factura.'}
          </p>
        </div>
        {comandaSelectata && (
          <button
            onClick={() => setComandaSelectata(null)}
            className="text-slate-500 hover:text-slate-800 transition-colors font-medium bg-slate-100 hover:bg-slate-200 px-4 py-2 rounded-lg"
          >
            ← Înapoi la listă
          </button>
        )}
      </div>

      {!comandaSelectata ? (
        <div className="mb-6 grid gap-3 md:grid-cols-3">
          <StatCard label="Comenzi facturabile" value={comenziGata.length} icon={<Receipt className="h-4 w-4" />} />
          <StatCard label="Valoare totală" value={`${totalValoareFacturabila.toFixed(2)} RON`} tone="info" icon={<Wallet className="h-4 w-4" />} />
          <StatCard label="În așteptare" value={comenziFiltrate.length} tone="warning" icon={<FileClock className="h-4 w-4" />} />
        </div>
      ) : null}

      {!comandaSelectata ? (
        <>
          <div className="mb-4 flex flex-col gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3 md:flex-row md:items-center md:justify-between">
            <input
              id="input-cautare-factura"
              type="text"
              value={cautare}
              onChange={(e) => setCautare(e.target.value)}
              placeholder="Caută după comandă, client sau vehicul..."
              className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm text-slate-900 focus:border-indigo-400 focus:outline-none focus:ring-1 focus:ring-indigo-400 md:max-w-md"
            />
            <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-slate-500">
              <button
                type="button"
                onClick={() => handleSort('data')}
                className="rounded-lg border border-slate-200 bg-white px-3 py-2 hover:bg-slate-50"
              >
                Data {sortField === 'data' ? (sortDir === 'asc' ? '↑' : '↓') : ''}
              </button>
              <button
                type="button"
                onClick={() => handleSort('nrComanda')}
                className="rounded-lg border border-slate-200 bg-white px-3 py-2 hover:bg-slate-50"
              >
                Comandă {sortField === 'nrComanda' ? (sortDir === 'asc' ? '↑' : '↓') : ''}
              </button>
              <button
                type="button"
                onClick={() => handleSort('valoare')}
                className="rounded-lg border border-slate-200 bg-white px-3 py-2 hover:bg-slate-50"
              >
                Valoare {sortField === 'valoare' ? (sortDir === 'asc' ? '↑' : '↓') : ''}
              </button>
              <button
                type="button"
                onClick={() => setCautare('')}
                className="rounded-lg border border-slate-200 bg-white px-3 py-2 hover:bg-slate-50"
              >
                Reset
              </button>
            </div>
          </div>

          {comenziFiltrate.length === 0 ? (
            <EmptyState
              title={comenziGata.length === 0 ? 'Nu există comenzi facturabile' : 'Nu există rezultate'}
              description={
                comenziGata.length === 0
                  ? 'Comenzile livrate sau gata de livrare vor apărea aici pentru emiterea facturii.'
                  : 'Încearcă să relaxezi căutarea sau să resetezi filtrele de sortare și căutare.'
              }
              actionLabel={comenziGata.length === 0 ? undefined : 'Resetează căutarea'}
              onAction={comenziGata.length === 0 ? undefined : () => setCautare('')}
            />
          ) : (
            <div className="overflow-hidden rounded-xl border border-slate-200">
              <table className="min-w-full bg-white text-left text-sm">
                <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="py-4 px-6">Nr. Comandă</th>
                    <th className="py-4 px-6">Data Pregătire</th>
                    <th className="py-4 px-6">Client / Vehicul</th>
                    <th className="py-4 px-6 text-right">Deviz Estimat</th>
                    <th className="py-4 px-6 text-center">Acțiune</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {comenziFiltrate.map((comanda, index) => (
                    <tr key={comanda.idComanda} className="hover:bg-indigo-50/50 transition-colors group">
                      <td className="py-4 px-6 font-bold text-slate-800">{comanda.nrComanda}</td>
                      <td className="py-4 px-6 text-slate-500">{comanda.dataComanda}</td>
                      <td className="py-4 px-6 text-slate-600">
                        <div className="font-semibold text-slate-700">{comanda.client}</div>
                        <div className="text-xs text-slate-500">{comanda.vehicul}</div>
                      </td>
                      <td className="py-4 px-6 text-right font-semibold text-slate-700">
                        {comanda.totalEstimat.toFixed(2)} RON
                      </td>
                      <td className="py-4 px-6 text-center">
                        <button
                          id={`btn-open-factura-${index}`}
                          onClick={() => setComandaSelectata(comanda)}
                          className="text-indigo-600 hover:text-indigo-800 font-bold text-sm tracking-wide hover:underline"
                        >
                          Deschide Factura ➔
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      ) : (
        <div className="space-y-8 animate-fade-in">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 bg-slate-50 p-6 rounded-xl border border-slate-200">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Seria</label>
              <input
                id="input-serie-factura"
                type="text"
                value={serieFactura}
                onChange={(e) => setSerieFactura(e.target.value.toUpperCase())}
                className="w-full border border-slate-300 p-2.5 rounded-lg focus:ring-2 focus:ring-indigo-500 uppercase font-medium"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Număr Factură</label>
              <input
                id="input-numar-factura"
                type="text"
                value={numarFactura}
                onChange={(e) => setNumarFactura(e.target.value)}
                placeholder="ex: 00124"
                className="w-full border border-slate-300 p-2.5 rounded-lg focus:ring-2 focus:ring-indigo-500 font-medium"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Termen Plată</label>
              <select
                id="select-termen-plata-factura"
                value={termenPlata}
                onChange={(e) => setTermenPlata(Number(e.target.value))}
                className="w-full border border-slate-300 p-2.5 rounded-lg focus:ring-2 focus:ring-indigo-500"
              >
                <option value={0}>Pe loc (Cash/Card)</option>
                <option value={15}>OP la 15 zile</option>
                <option value={30}>OP la 30 zile</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Data Scadentă</label>
              <input
                type="date"
                value={dataScadenta}
                readOnly
                className="w-full border border-slate-200 bg-slate-100 text-slate-600 p-2.5 rounded-lg font-medium cursor-not-allowed"
              />
            </div>
          </div>

          <div>
            <h3 className="text-lg font-bold text-slate-800 mb-3">Linii Factură (Extrase din Deviz)</h3>
            <div className="overflow-hidden rounded-xl border border-slate-200">
              <table className="min-w-full bg-white text-left text-sm">
                <thead className="bg-slate-800 text-white font-medium">
                  <tr>
                    <th className="py-3 px-4">Tip</th>
                    <th className="py-3 px-4">Denumire Articol / Serviciu</th>
                    <th className="py-3 px-4 text-center">Cantitate</th>
                    <th className="py-3 px-4 text-right">Preț Unitar (fără TVA)</th>
                    <th className="py-3 px-4 text-right">Valoare</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {liniiFactura.map((linie) => (
                    <tr key={linie.idLinie}>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-1 rounded text-xs font-bold ${
                            linie.tip === 'Manopera'
                              ? 'bg-orange-100 text-orange-800'
                              : 'bg-blue-100 text-blue-800'
                          }`}
                        >
                          {linie.tip}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-medium text-slate-700">{linie.denumire}</td>
                      <td className="py-3 px-4 text-center">{linie.cantitate}</td>
                      <td className="py-3 px-4 text-right">{linie.pretUnitar.toFixed(2)} RON</td>
                      <td className="py-3 px-4 text-right font-semibold text-slate-800">
                        {(linie.cantitate * linie.pretUnitar).toFixed(2)} RON
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="flex flex-col md:flex-row justify-between items-end gap-6 pt-4 border-t border-slate-100">
            <div className="w-full md:w-1/2 flex flex-wrap gap-8">
              <div className="w-full md:w-fit">
                <label className="block text-sm font-semibold text-slate-700 mb-1 uppercase tracking-wide text-[10px]">
                  Discount Comercial (%)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    id="input-discount-factura"
                    type="number"
                    min="0"
                    max="100"
                    value={discountProcent}
                    onChange={(e) => setDiscountProcent(Number(e.target.value))}
                    className="w-20 border border-slate-300 p-2.5 rounded-lg focus:ring-2 focus:ring-indigo-500 text-center font-bold"
                  />
                  {discountProcent > 0 && (
                    <button
                      onClick={() => setDiscountProcent(0)}
                      className="text-[10px] font-bold text-rose-500 hover:underline uppercase"
                    >
                      Anulează
                    </button>
                  )}
                </div>
              </div>

              <div className="w-full md:w-fit">
                <label className="block text-sm font-semibold text-slate-700 mb-1 uppercase tracking-wide text-[10px]">
                  Penalizare Întârziere (%)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    id="input-penalizare-factura"
                    type="number"
                    min="0"
                    max="100"
                    value={penalizareProcent}
                    onChange={(e) => setPenalizareProcent(Number(e.target.value))}
                    className="w-20 border border-slate-300 p-2.5 rounded-lg focus:ring-2 focus:ring-indigo-500 text-center font-bold"
                  />
                  {penalizareProcent > 0 && (
                    <button
                      onClick={() => setPenalizareProcent(0)}
                      className="text-[10px] font-bold text-rose-500 hover:underline uppercase"
                    >
                      Anulează
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div className="w-full md:w-1/3 bg-slate-900 p-6 rounded-2xl shadow-2xl text-white space-y-3 border border-white/5">
              <div className="flex justify-between text-xs font-bold text-slate-400 uppercase tracking-widest">
                <span>Subtotal</span>
                <span>{subtotal.toFixed(2)} RON</span>
              </div>
              
              {discountProcent > 0 && (
                <div className="flex justify-between text-sm font-bold text-emerald-400">
                  <span>Discount ({discountProcent}%)</span>
                  <span>- {valoareDiscount.toFixed(2)} RON</span>
                </div>
              )}

              {penalizareProcent > 0 && (
                <div className="flex justify-between text-sm font-bold text-rose-400">
                  <span>Penalizare ({penalizareProcent}%)</span>
                  <span>+ {valoarePenalizare.toFixed(2)} RON</span>
                </div>
              )}

              <div className="flex justify-between text-xs font-bold text-slate-400 uppercase tracking-widest">
                <span>TVA (19%)</span>
                <span>{valoareTVA.toFixed(2)} RON</span>
              </div>
              
              <div className="flex justify-between text-xl font-black pt-4 border-t border-white/10 mt-2">
                <span className="text-indigo-200">TOTAL</span>
                <span className="text-white">{totalPlata.toFixed(2)} RON</span>
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-6">
            <button
              id="btn-save-factura"
              onClick={handleEmitereFactura}
              className="group relative overflow-hidden rounded-2xl bg-indigo-600 px-10 py-4 text-sm font-black uppercase tracking-[0.2em] text-white shadow-2xl shadow-indigo-200 transition-all hover:bg-indigo-700 hover:-translate-y-1 active:translate-y-0"
            >
              <span className="relative z-10">✔ Emite și Salvează Factura</span>
              <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-1000 group-hover:translate-x-full" />
            </button>
          </div>
        </div>
      )}
      </div>
    </div>
  );
}
