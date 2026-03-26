import { useState } from 'react';

const istoricMock = [
  { id: 1, data: '2026-03-25 09:15', nrDoc: 'F-SAG-00124', client: 'SC Auto Fleet SRL', tipOp: 'Facturare Comandă', valoare: 1550.00, detalii: 'Facturare comandă CMD-2026-088' },
  { id: 2, data: '2026-03-25 10:30', nrDoc: 'PEN-0045', client: 'SC Transport SRL', tipOp: 'Penalizare', valoare: 126.00, detalii: 'Întârziere 3 zile la factura F-SAG-042' },
  { id: 3, data: '2026-03-25 11:45', nrDoc: 'F-SAG-050', client: 'Ion Popescu', tipOp: 'Discount Extra', valoare: -150.00, detalii: 'Campanie PROMO_PRIMAVARA' },
  { id: 4, data: '2026-03-25 13:20', nrDoc: 'RET-0012', client: 'Vasile Dorel', tipOp: 'Storno', valoare: -500.00, detalii: 'Retur Pompă Apă (defect)' },
];

export default function IstoricFacturare() {
  const [searchTerm, setSearchTerm] = useState('');
  const [tipFiltru, setTipFiltru] = useState('Toate');

  const dateFiltrate = istoricMock.filter((item) => {
    const matchText = item.client.toLowerCase().includes(searchTerm.toLowerCase()) || 
                      item.nrDoc.toLowerCase().includes(searchTerm.toLowerCase());
    const matchTip = tipFiltru === 'Toate' || item.tipOp === tipFiltru;
    return matchText && matchTip;
  });

  return (
    <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
      <div className="flex justify-between items-end mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Istoric Facturare</h1>
          <p className="text-slate-500 mt-1">Monitorizarea documentelor emise în modulul de facturare.</p>
        </div>
        <div className="text-right">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Documente Emise</p>
          <p className="text-3xl font-extrabold text-indigo-700">{dateFiltrate.length}</p>
        </div>
      </div>

      <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 mb-6 flex gap-4 items-center">
        <div className="flex-1 relative">
          <svg className="w-5 h-5 absolute left-3 top-3 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input 
            type="text" 
            placeholder="Caută după client sau număr document..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full border border-slate-200 pl-10 p-2.5 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
          />
        </div>
        <div className="w-64">
          <select 
            value={tipFiltru}
            onChange={(e) => setTipFiltru(e.target.value)}
            className="w-full border-2 border-indigo-200 text-indigo-800 font-medium p-2.5 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-indigo-50/50"
          >
            <option value="Toate">Toate Operațiunile</option>
            <option value="Facturare Comandă">Facturare Comandă</option>
            <option value="Storno">Storno</option>
            <option value="Discount Extra">Discount Extra</option>
            <option value="Penalizare">Penalizare</option>
          </select>
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl border border-slate-200">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-800 text-white">
            <tr>
              <th className="p-4 font-semibold">Dată & Oră</th>
              <th className="p-4 font-semibold">Tip Operațiune</th>
              <th className="p-4 font-semibold">Document</th>
              <th className="p-4 font-semibold">Client</th>
              <th className="p-4 font-semibold text-right">Valoare (RON)</th>
              <th className="p-4 font-semibold">Detalii / Motiv</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {dateFiltrate.length === 0 ? (
              <tr><td colSpan={6} className="p-8 text-center text-slate-400 font-medium">Nu există înregistrări pentru aceste filtre.</td></tr>
            ) : (
              dateFiltrate.map((rand) => (
                <tr key={rand.id} className="hover:bg-slate-50 transition-colors">
                  <td className="p-4 text-slate-600 font-medium">{rand.data}</td>
                  <td className="p-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                      rand.tipOp === 'Storno' || rand.tipOp === 'Discount Extra' ? 'bg-amber-100 text-amber-800' :
                      rand.tipOp === 'Penalizare' ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700'
                    }`}>
                      {rand.tipOp}
                    </span>
                  </td>
                  <td className="p-4 font-bold text-slate-800">{rand.nrDoc}</td>
                  <td className="p-4 text-slate-700">{rand.client}</td>
                  <td className={`p-4 text-right font-bold ${rand.valoare < 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                    {rand.valoare > 0 ? '+' : ''}{rand.valoare.toFixed(2)}
                  </td>
                  <td className="p-4 text-slate-500 text-xs">{rand.detalii}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}