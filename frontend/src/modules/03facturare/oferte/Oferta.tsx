import { useState } from 'react';

export default function Oferta() {
  // Pentru moment, simulăm câteva facturi deja emise anterior de modulul de facturare
  const facturiEmise = [
    { id: 101, numar: 'F-2026-001', dataEmitere: '2026-03-01', total: 1500, client: 'SC Auto Fleet SRL' },
    { id: 102, numar: 'F-2026-002', dataEmitere: '2026-03-05', total: 850, client: 'Ion Popescu' },
    { id: 103, numar: 'F-2026-005', dataEmitere: '2026-03-10', total: 3200, client: 'Vasile Dorel' },
  ];

  const [facturaSelectata, setFacturaSelectata] = useState('');
  const [tipOperatiune, setTipOperatiune] = useState('discount');

  const handleSalvare = (e: React.FormEvent) => {
    e.preventDefault();
    if (!facturaSelectata) {
      alert("Te rog selectează o factură din listă!");
      return;
    }
    
    if (tipOperatiune === 'discount') {
      alert(`S-a aplicat Discount / Ofertă pentru factura ID: ${facturaSelectata}. Se va ajusta restul de plată.`);
    } else {
      alert(`S-a generat o Factură Storno Promoțională pentru factura ID: ${facturaSelectata}.`);
    }
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-2 text-slate-800">Gestiune Campanii & Oferte</h2>
      <p className="text-slate-500 mb-6 text-sm">
        Selectează o factură deja emisă pentru a aplica un discount extra sau pentru a emite o factură storno aferentă unei promoții.
      </p>

      <form onSubmit={handleSalvare} className="space-y-6">
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">Factura de Bază</label>
          <select 
            className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 outline-none"
            value={facturaSelectata}
            onChange={(e) => setFacturaSelectata(e.target.value)}
          >
            <option value="">-- Caută factură emisă --</option>
            {facturiEmise.map(f => (
              <option key={f.id} value={f.id}>
                {f.numar} - {f.client} ({f.total} RON)
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">Tipul Operațiunii</label>
          <div className="flex space-x-4">
            <label className="flex items-center space-x-2 cursor-pointer p-3 border border-slate-200 rounded-lg flex-1 hover:bg-slate-50">
              <input 
                type="radio" 
                name="tipOp" 
                value="discount" 
                checked={tipOperatiune === 'discount'}
                onChange={(e) => setTipOperatiune(e.target.value)}
                className="text-indigo-600 focus:ring-indigo-500"
              />
              <span className="text-sm font-medium text-slate-700">Aplicare Discount Extra</span>
            </label>
            <label className="flex items-center space-x-2 cursor-pointer p-3 border border-slate-200 rounded-lg flex-1 hover:bg-slate-50">
              <input 
                type="radio" 
                name="tipOp" 
                value="storno" 
                checked={tipOperatiune === 'storno'}
                onChange={(e) => setTipOperatiune(e.target.value)}
                className="text-indigo-600 focus:ring-indigo-500"
              />
              <span className="text-sm font-medium text-slate-700">Emitere Factură Storno</span>
            </label>
          </div>
        </div>

        <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-xl shadow-md font-semibold transition-colors mt-4">
          Procesează Operațiunea
        </button>
      </form>
    </div>
  );
}