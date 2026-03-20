import { useState } from 'react';
import { mockComenzi } from '../02operational/mockData';
// 1. IMPORTĂM INTERFAȚA pentru a rezolva eroarea de tip 'any'
// 1. IMPORTĂM INTERFAȚA pentru a rezolva eroarea de tip 'any'
import type { ComandaService } from '../02operational/types'; 

export default function Facturare() {
  // Preluăm doar comenzile finalizate din operațional
  const comenziGata = mockComenzi.filter(c => c.status === 'Finalizat');
  
  // Stocăm ce comenzi primesc discount (ex: { 2: true } înseamnă comanda cu ID 2 are discount)
  const [discounturi, setDiscounturi] = useState<Record<number, boolean>>({});

  const toggleDiscount = (idComanda: number) => {
    setDiscounturi(prev => ({
      ...prev,
      [idComanda]: !prev[idComanda]
    }));
  };

  // 2. ÎNLOCUIM 'any' cu tipul corect 'ComandaService'
  const emiteFactura = (comanda: ComandaService) => {
    const areDiscount = discounturi[comanda.idComanda];
    const totalEstimat = comanda.totalEstimat;
    const totalFinal = areDiscount ? totalEstimat * 0.9 : totalEstimat; // Ex: 10% discount
    
    alert(`Factură generată pentru Comanda ${comanda.nrComanda}!\nTotal: ${totalFinal.toFixed(2)} RON ${areDiscount ? '(Discount 10% aplicat)' : ''}`);
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
      <h2 className="text-2xl font-bold mb-2 text-slate-800">Facturare Comenzi (Așteptare)</h2>
      <p className="text-slate-500 mb-6 text-sm">
        Aici apar automat comenzile de service care au primit statusul "Finalizat" în modulul Operațional.
      </p>

      <div className="overflow-hidden rounded-xl border border-slate-200">
        <table className="min-w-full bg-white text-left text-sm">
          <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
            <tr>
              <th className="py-3 px-4">Nr. Comandă</th>
              <th className="py-3 px-4">Vehicul (ID)</th>
              <th className="py-3 px-4 text-right">Total Estimat</th>
              <th className="py-3 px-4 text-center">Aplică Discount</th>
              <th className="py-3 px-4 text-center">Acțiuni</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {comenziGata.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-6 text-center text-slate-500">
                  Nicio comandă finalizată în așteptare.
                </td>
              </tr>
            ) : (
              comenziGata.map((comanda) => (
                <tr key={comanda.idComanda} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3 px-4 font-medium text-slate-800">{comanda.nrComanda}</td>
                  <td className="py-3 px-4 text-slate-500">{comanda.idVehicul}</td>
                  <td className="py-3 px-4 text-right font-bold text-slate-700">{comanda.totalEstimat.toFixed(2)} RON</td>
                  <td className="py-3 px-4 text-center">
                    <label className="inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 w-4 h-4"
                        checked={discounturi[comanda.idComanda] || false}
                        onChange={() => toggleDiscount(comanda.idComanda)}
                      />
                      <span className="ml-2 text-xs text-slate-500">Da</span>
                    </label>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <button 
                      onClick={() => emiteFactura(comanda)}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-1.5 rounded shadow-sm text-xs font-semibold transition-colors"
                    >
                      Emite Factură
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}