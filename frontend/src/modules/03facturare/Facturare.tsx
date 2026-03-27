// Ecranul de facturare pornește din comenzi facturabile demo
// și simulează emiterea unei facturi fiscale pe baza lor.
import { useMemo, useState } from 'react';
import { FileClock, Receipt, Wallet } from 'lucide-react';
import { toast } from 'sonner';
import { EmptyState } from '../../componente/ui/EmptyState';
import { StatCard } from '../../componente/ui/StatCard';
import { usePageSessionState } from '../../lib/pageState';
import {
  obtineComenziFacturabileDinMock,
  obtineLiniiFacturaDinComandaMock,
} from '../../mock/facturare';
import type { ComandaFacturabilaMock, LinieFacturaMock } from '../../mock/types';

type FacturareSortField = 'data' | 'nrComanda' | 'valoare';
type FacturareSortDir = 'asc' | 'desc';

export default function Facturare() {
  // Lista inițială vine din stratul comun de mock-uri.
  // Componenta păstrează doar interacțiunile locale din sesiunea curentă.
  const [comenziGata, setComenziGata] = useState<ComandaFacturabilaMock[]>(
    () => obtineComenziFacturabileDinMock(),
  );
  const [comandaSelectata, setComandaSelectata] = useState<ComandaFacturabilaMock | null>(null);

  const [serieFactura, setSerieFactura] = useState('F-SAG');
  const [numarFactura, setNumarFactura] = useState('');
  const [termenPlata, setTermenPlata] = useState<number>(0);
  const [discountProcent, setDiscountProcent] = useState<number>(0);
  const [cautare, setCautare] = usePageSessionState('facturare-cautare', '');
  const [sortField, setSortField] = usePageSessionState<FacturareSortField>(
    'facturare-sort-field',
    'data',
  );
  const [sortDir, setSortDir] = usePageSessionState<FacturareSortDir>(
    'facturare-sort-dir',
    'desc',
  );

  const handleSort = (field: FacturareSortField) => {
    // Click repetat pe aceeași coloană = inversăm direcția sortării.
    if (sortField === field) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
      return;
    }

    setSortField(field);
    setSortDir(field === 'data' ? 'desc' : 'asc');
  };

  const comenziFiltrate = useMemo(() => {
    // Lista vizibilă este derivată din:
    // - comenzi încă nefacturate
    // - căutarea introdusă
    // - starea curentă a sortării
    const termen = cautare.trim().toLowerCase();

    return [...comenziGata]
      .filter((comanda) => {
        if (termen === '') return true;
        return [comanda.nrComanda, comanda.client, comanda.vehicul]
          .some((camp) => camp.toLowerCase().includes(termen));
      })
      .sort((a, b) => {
        let comparison = 0;
        if (sortField === 'data') {
          comparison = a.dataComanda.localeCompare(b.dataComanda);
        } else if (sortField === 'nrComanda') {
          comparison = a.nrComanda.localeCompare(b.nrComanda);
        } else {
          comparison = a.totalEstimat - b.totalEstimat;
        }

        return sortDir === 'asc' ? comparison : -comparison;
      });
  }, [cautare, comenziGata, sortDir, sortField]);

  const totalValoareFacturabila = comenziGata.reduce(
    (total, comanda) => total + comanda.totalEstimat,
    0,
  );

  const liniiFactura: LinieFacturaMock[] = useMemo(() => {
    // Liniile documentului depind direct de comanda selectată.
    if (!comandaSelectata) return [];
    return obtineLiniiFacturaDinComandaMock(comandaSelectata.idComanda);
  }, [comandaSelectata]);

  const { subtotal, valoareTVA, valoareDiscount, totalPlata, dataScadenta } = useMemo(() => {
    // Toate sumele documentului sunt calculate într-un singur loc,
    // ca să nu împrăștiem formulele financiare prin JSX.
    const sub = liniiFactura.reduce((acc, linie) => acc + (linie.cantitate * linie.pretUnitar), 0);
    const disc = sub * (discountProcent / 100);
    const subDupaDiscount = sub - disc;
    const tva = subDupaDiscount * 0.19;

    const dataAzi = new Date();
    dataAzi.setDate(dataAzi.getDate() + termenPlata);

    return {
      subtotal: sub,
      valoareDiscount: disc,
      valoareTVA: tva,
      totalPlata: subDupaDiscount + tva,
      dataScadenta: dataAzi.toISOString().split('T')[0],
    };
  }, [liniiFactura, discountProcent, termenPlata]);

  const handleEmitereFactura = () => {
    // În această aplicație demo "emiterea" actualizează doar starea locală
    // și afișează feedback prin toast.
    if (!comandaSelectata) {
      toast.error('Selectează o comandă înainte de emiterea facturii.');
      return;
    }

    if (!serieFactura || !numarFactura) {
      toast.error('Te rog completează seria și numărul facturii.');
      return;
    }

    toast.success(
      `Factura ${serieFactura}-${numarFactura} a fost emisă pentru ${totalPlata.toFixed(2)} RON.`,
    );

    setComenziGata((prev) => prev.filter((comanda) => comanda.idComanda !== comandaSelectata.idComanda));
    setComandaSelectata(null);
    setNumarFactura('');
    setDiscountProcent(0);
    setTermenPlata(0);
  };

  return (
    <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
      <div className="flex justify-between items-center mb-8 border-b border-slate-100 pb-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">
            {comandaSelectata ? 'Emitere Factură Fiscală' : 'Facturare Comenzi (În Așteptare)'}
          </h2>
          <p className="text-slate-500 mt-1 text-sm">
            {comandaSelectata
              ? `Generare documente fiscale pentru comanda #${comandaSelectata.nrComanda}`
              : 'Selectează o comandă din setul comun de mock-uri pentru a genera creanța demo.'}
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
              {comenziFiltrate.map((comanda) => (
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
                type="text"
                value={serieFactura}
                onChange={(e) => setSerieFactura(e.target.value.toUpperCase())}
                className="w-full border border-slate-300 p-2.5 rounded-lg focus:ring-2 focus:ring-indigo-500 uppercase font-medium"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Număr Factură</label>
              <input
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
                            linie.tip === 'Manoperă'
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
            <div className="w-full md:w-1/3">
              <label className="block text-sm font-semibold text-slate-700 mb-1">
                Aplică Discount Comercial (%)
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={discountProcent}
                  onChange={(e) => setDiscountProcent(Number(e.target.value))}
                  className="w-24 border border-slate-300 p-2.5 rounded-lg focus:ring-2 focus:ring-indigo-500 text-center font-bold"
                />
                <button
                  onClick={() => setDiscountProcent(0)}
                  className="text-xs text-slate-500 hover:text-red-500 underline"
                >
                  Anulează Discount
                </button>
              </div>
            </div>

            <div className="w-full md:w-1/3 bg-slate-800 p-6 rounded-xl shadow-lg text-white space-y-2">
              <div className="flex justify-between text-sm text-slate-300">
                <span>Subtotal (fără TVA):</span>
                <span>{subtotal.toFixed(2)} RON</span>
              </div>
              {discountProcent > 0 && (
                <div className="flex justify-between text-sm text-green-400">
                  <span>Discount ({discountProcent}%):</span>
                  <span>- {valoareDiscount.toFixed(2)} RON</span>
                </div>
              )}
              <div className="flex justify-between text-sm text-slate-300">
                <span>TVA (19%):</span>
                <span>{valoareTVA.toFixed(2)} RON</span>
              </div>
              <div className="flex justify-between text-xl font-bold pt-3 border-t border-slate-600">
                <span>TOTAL DE PLATĂ:</span>
                <span className="text-indigo-300">{totalPlata.toFixed(2)} RON</span>
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <button
              onClick={handleEmitereFactura}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3.5 rounded-xl shadow-md hover:shadow-lg transition-all font-bold text-lg tracking-wide"
            >
              ✔ Emite și Salvează Factura
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
