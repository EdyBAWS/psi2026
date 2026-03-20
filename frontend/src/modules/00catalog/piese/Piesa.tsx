import { useState } from 'react';

type TipPiesa = 'NOUA' | 'SH';

interface PiesaAuto {
  idPiesa: number;
  codPiesa: string;
  producator: string;
  pretBaza: number;
  tip: TipPiesa;
  // Detalii specifice
  luniGarantie?: number;
  gradUzura?: string;
}

export default function Piesa() {
  const [piese, setPiese] = useState<PiesaAuto[]>([
    { idPiesa: 1, codPiesa: 'FIL-UL-BOSCH', producator: 'Bosch', pretBaza: 45.50, tip: 'NOUA', luniGarantie: 12 },
    { idPiesa: 2, codPiesa: 'ALT-VW-GOLF', producator: 'Valeo', pretBaza: 350.00, tip: 'SH', gradUzura: 'Ușor uzat' },
    { idPiesa: 3, codPiesa: 'PL-FR-BREMBO', producator: 'Brembo', pretBaza: 180.00, tip: 'NOUA', luniGarantie: 24 },
  ]);

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Nomenclator Piese Auto</h2>
          <p className="text-slate-500 mt-1 text-sm">Gestiunea pieselor noi, SH și a prețurilor de bază</p>
        </div>
        <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-lg shadow-md font-medium transition-all">
          + Adaugă Piesă
        </button>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
            <tr>
              <th className="py-3 px-4">Cod Piesă</th>
              <th className="py-3 px-4">Producător</th>
              <th className="py-3 px-4 text-center">Stare</th>
              <th className="py-3 px-4">Detalii</th>
              <th className="py-3 px-4 text-right">Preț Bază</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {piese.map((piesa) => (
              <tr key={piesa.idPiesa} className="hover:bg-slate-50 transition-colors">
                <td className="py-3 px-4 font-medium text-slate-800">{piesa.codPiesa}</td>
                <td className="py-3 px-4 text-slate-600">{piesa.producator}</td>
                <td className="py-3 px-4 text-center">
                  <span className={`px-2.5 py-1 rounded-md text-xs font-bold ${
                    piesa.tip === 'NOUA' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                  }`}>
                    {piesa.tip}
                  </span>
                </td>
                <td className="py-3 px-4 text-slate-500 text-xs">
                  {piesa.tip === 'NOUA' ? `Garanție: ${piesa.luniGarantie} luni` : `Uzura: ${piesa.gradUzura}`}
                </td>
                <td className="py-3 px-4 text-right font-bold text-slate-700">
                  {piesa.pretBaza.toFixed(2)} RON
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}