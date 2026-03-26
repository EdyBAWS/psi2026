import { useState, useMemo } from 'react';

// Am definit tipul exact în loc de 'any'
interface ComandaAsteptare {
  idComanda: number;
  nrComanda: string;
  dataComanda: string;
  idVehicul: number;
  status: string;
  totalEstimat: number;
}

interface LinieFactura {
  id: number;
  tip: 'Piesă' | 'Manoperă';
  denumire: string;
  cantitate: number;
  pretUnitar: number;
}

export default function Facturare() {
  const [comenziGata, setComenziGata] = useState<ComandaAsteptare[]>([
    { idComanda: 991, nrComanda: 'CMD-2026-088', dataComanda: '2026-03-24', idVehicul: 12, status: 'Finalizat', totalEstimat: 1550 },
    { idComanda: 992, nrComanda: 'CMD-2026-089', dataComanda: '2026-03-25', idVehicul: 5, status: 'Finalizat', totalEstimat: 840 }
  ]);
  
  const [comandaSelectata, setComandaSelectata] = useState<ComandaAsteptare | null>(null);
  
  const [serieFactura, setSerieFactura] = useState('F-SAG');
  const [numarFactura, setNumarFactura] = useState('');
  const [termenPlata, setTermenPlata] = useState<number>(0); 
  const [discountProcent, setDiscountProcent] = useState<number>(0);

  const liniiFactura: LinieFactura[] = useMemo(() => {
    if (!comandaSelectata) return [];
    return [
      { id: 1, tip: 'Piesă', denumire: 'Ulei Motor 5W30 Castrol (Litri)', cantitate: 5, pretUnitar: 65 },
      { id: 2, tip: 'Piesă', denumire: 'Filtru Ulei Bosch', cantitate: 1, pretUnitar: 45 },
      { id: 3, tip: 'Piesă', denumire: 'Filtru Aer MANN', cantitate: 1, pretUnitar: 80 },
      { id: 4, tip: 'Manoperă', denumire: 'Revizie standard (Ore)', cantitate: 1.5, pretUnitar: 150 },
    ];
  }, [comandaSelectata]);

  const { subtotal, valoareTVA, valoareDiscount, totalPlata, dataScadenta } = useMemo(() => {
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
      dataScadenta: dataAzi.toISOString().split('T')[0]
    };
  }, [liniiFactura, discountProcent, termenPlata]);

  const handleEmitereFactura = () => {
    if (!serieFactura || !numarFactura) {
      alert('Te rog completează seria și numărul facturii!');
      return;
    }

    alert(`Tranzacție Finalizată!\nFactura ${serieFactura}-${numarFactura} emisă.\nTotal Creanță: ${totalPlata.toFixed(2)} RON.\nScadență: ${dataScadenta}`);
    setComenziGata(prev => prev.filter(c => c.idComanda !== comandaSelectata?.idComanda));
    setComandaSelectata(null);
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
              : 'Selectează o comandă finalizată din operațional pentru a genera creanța.'}
          </p>
        </div>
        {comandaSelectata && (
          <button onClick={() => setComandaSelectata(null)} className="text-slate-500 hover:text-slate-800 transition-colors font-medium bg-slate-100 hover:bg-slate-200 px-4 py-2 rounded-lg">
            ← Înapoi la listă
          </button>
        )}
      </div>

      {!comandaSelectata ? (
        <div className="overflow-hidden rounded-xl border border-slate-200">
          <table className="min-w-full bg-white text-left text-sm">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-4 px-6">Nr. Comandă</th>
                <th className="py-4 px-6">Data Finalizare</th>
                <th className="py-4 px-6">Vehicul (ID)</th>
                <th className="py-4 px-6 text-right">Deviz Estimat</th>
                <th className="py-4 px-6 text-center">Acțiune</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {comenziGata.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-500 font-medium">
                    Nicio comandă finalizată în așteptare de facturare.
                  </td>
                </tr>
              ) : (
                comenziGata.map((comanda) => (
                  <tr key={comanda.idComanda} className="hover:bg-indigo-50/50 transition-colors group">
                    <td className="py-4 px-6 font-bold text-slate-800">{comanda.nrComanda}</td>
                    <td className="py-4 px-6 text-slate-500">26 Mar 2026</td>
                    <td className="py-4 px-6 text-slate-600">Vehicul #{comanda.idVehicul}</td>
                    <td className="py-4 px-6 text-right font-semibold text-slate-700">{comanda.totalEstimat.toFixed(2)} RON</td>
                    <td className="py-4 px-6 text-center">
                      <button onClick={() => setComandaSelectata(comanda)} className="text-indigo-600 hover:text-indigo-800 font-bold text-sm tracking-wide hover:underline">
                        Deschide Factura ➔
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="space-y-8 animate-fade-in">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 bg-slate-50 p-6 rounded-xl border border-slate-200">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Seria</label>
              <input type="text" value={serieFactura} onChange={e => setSerieFactura(e.target.value.toUpperCase())} className="w-full border border-slate-300 p-2.5 rounded-lg focus:ring-2 focus:ring-indigo-500 uppercase font-medium" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Număr Factură</label>
              <input type="text" value={numarFactura} onChange={e => setNumarFactura(e.target.value)} placeholder="ex: 00124" className="w-full border border-slate-300 p-2.5 rounded-lg focus:ring-2 focus:ring-indigo-500 font-medium" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Termen Plată</label>
              <select value={termenPlata} onChange={e => setTermenPlata(Number(e.target.value))} className="w-full border border-slate-300 p-2.5 rounded-lg focus:ring-2 focus:ring-indigo-500">
                <option value={0}>Pe loc (Cash/Card)</option>
                <option value={15}>OP la 15 zile</option>
                <option value={30}>OP la 30 zile</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Data Scadentă</label>
              <input type="date" value={dataScadenta} readOnly className="w-full border border-slate-200 bg-slate-100 text-slate-600 p-2.5 rounded-lg font-medium cursor-not-allowed" />
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
                  {liniiFactura.map(linie => (
                    <tr key={linie.id}>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded text-xs font-bold ${linie.tip === 'Piesă' ? 'bg-blue-100 text-blue-800' : 'bg-orange-100 text-orange-800'}`}>
                          {linie.tip}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-medium text-slate-700">{linie.denumire}</td>
                      <td className="py-3 px-4 text-center">{linie.cantitate}</td>
                      <td className="py-3 px-4 text-right">{linie.pretUnitar.toFixed(2)} RON</td>
                      <td className="py-3 px-4 text-right font-semibold text-slate-800">{(linie.cantitate * linie.pretUnitar).toFixed(2)} RON</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="flex flex-col md:flex-row justify-between items-end gap-6 pt-4 border-t border-slate-100">
            <div className="w-full md:w-1/3">
              <label className="block text-sm font-semibold text-slate-700 mb-1">Aplică Discount Comercial (%)</label>
              <div className="flex gap-2">
                <input type="number" min="0" max="100" value={discountProcent} onChange={e => setDiscountProcent(Number(e.target.value))} className="w-24 border border-slate-300 p-2.5 rounded-lg focus:ring-2 focus:ring-indigo-500 text-center font-bold" />
                <button onClick={() => setDiscountProcent(0)} className="text-xs text-slate-500 hover:text-red-500 underline">Anulează Discount</button>
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
             <button onClick={handleEmitereFactura} className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3.5 rounded-xl shadow-md hover:shadow-lg transition-all font-bold text-lg tracking-wide">
               ✔ Emite și Salvează Factura
             </button>
          </div>
        </div>
      )}
    </div>
  );
}