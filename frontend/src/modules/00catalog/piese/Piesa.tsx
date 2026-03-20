import { useState } from 'react';

type TipPiesa = 'NOUA' | 'SH';

interface PiesaAuto {
  idPiesa: number;
  codPiesa: string;
  producator: string;
  pretBaza: number;
  tip: TipPiesa;
  luniGarantie?: number;
  gradUzura?: string;
}

export default function Piesa() {
  const [piese, setPiese] = useState<PiesaAuto[]>([
    { idPiesa: 1, codPiesa: 'FIL-UL-BOSCH', producator: 'Bosch', pretBaza: 45.50, tip: 'NOUA', luniGarantie: 12 },
    { idPiesa: 2, codPiesa: 'ALT-VW-GOLF', producator: 'Valeo', pretBaza: 350.00, tip: 'SH', gradUzura: 'Ușor uzat' },
  ]);

  const [arataFormular, setArataFormular] = useState(false);
  
  // State pentru form
  const [codPiesa, setCodPiesa] = useState('');
  const [producator, setProducator] = useState('');
  const [pretBaza, setPretBaza] = useState('');
  const [tipPiesa, setTipPiesa] = useState<TipPiesa>('NOUA');
  const [luniGarantie, setLuniGarantie] = useState('');
  const [gradUzura, setGradUzura] = useState('');

  const handleSalvare = (e: React.FormEvent) => {
    e.preventDefault();
    if (!codPiesa || !producator || !pretBaza) {
      alert("Te rog completează câmpurile obligatorii (Cod, Producător, Preț)!");
      return;
    }

    const nouaPiesa: PiesaAuto = {
      idPiesa: Date.now(),
      codPiesa: codPiesa.toUpperCase(),
      producator,
      pretBaza: Number(pretBaza),
      tip: tipPiesa,
      ...(tipPiesa === 'NOUA' ? { luniGarantie: Number(luniGarantie) } : { gradUzura })
    };

    setPiese([nouaPiesa, ...piese]);
    
    // Reset form
    setCodPiesa(''); setProducator(''); setPretBaza(''); setLuniGarantie(''); setGradUzura('');
    setArataFormular(false);
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Nomenclator Piese Auto</h2>
          <p className="text-slate-500 mt-1 text-sm">Gestiunea pieselor noi, SH și a prețurilor de bază</p>
        </div>
        <button 
          onClick={() => setArataFormular(!arataFormular)}
          className={`${arataFormular ? 'bg-slate-200 text-slate-700' : 'bg-indigo-600 text-white'} hover:opacity-90 px-5 py-2.5 rounded-lg shadow-sm font-medium transition-all`}
        >
          {arataFormular ? 'Anulează' : '+ Adaugă Piesă'}
        </button>
      </div>

      {/* Formularul de Adăugare */}
      {arataFormular && (
        <form onSubmit={handleSalvare} className="mb-8 p-6 bg-slate-50 border border-slate-200 rounded-xl space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Cod Piesă *</label>
              <input type="text" value={codPiesa} onChange={(e) => setCodPiesa(e.target.value)} className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 focus:ring-indigo-500 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Producător *</label>
              <input type="text" value={producator} onChange={(e) => setProducator(e.target.value)} className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 focus:ring-indigo-500 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Preț Bază (RON) *</label>
              <input type="number" step="0.01" value={pretBaza} onChange={(e) => setPretBaza(e.target.value)} className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 focus:ring-indigo-500 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Tip Piesă</label>
              <select value={tipPiesa} onChange={(e) => setTipPiesa(e.target.value as TipPiesa)} className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 focus:ring-indigo-500 outline-none">
                <option value="NOUA">Nouă</option>
                <option value="SH">Second Hand (SH)</option>
              </select>
            </div>
          </div>

          {/* Câmpuri Condiționale */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            {tipPiesa === 'NOUA' ? (
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Luni Garanție</label>
                <input type="number" value={luniGarantie} onChange={(e) => setLuniGarantie(e.target.value)} placeholder="ex: 24" className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 focus:ring-indigo-500 outline-none" />
              </div>
            ) : (
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Grad Uzură</label>
                <input type="text" value={gradUzura} onChange={(e) => setGradUzura(e.target.value)} placeholder="ex: Uzură medie" className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 focus:ring-indigo-500 outline-none" />
              </div>
            )}
            
            <div className="md:col-span-3 flex justify-end">
              <button type="submit" className="bg-green-600 hover:bg-green-700 text-white px-8 py-2.5 rounded-lg font-semibold shadow-sm transition-colors">
                Salvează Piesa
              </button>
            </div>
          </div>
        </form>
      )}

      {/* Tabelul */}
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
                  {piesa.tip === 'NOUA' ? `Garanție: ${piesa.luniGarantie} luni` : `Uzură: ${piesa.gradUzura}`}
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