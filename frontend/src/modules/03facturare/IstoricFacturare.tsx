import { useMemo, useState } from 'react';
import { istoricFacturareMock } from '../../mock/facturare';

export default function IstoricFacturare() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filtruTip, setFiltruTip] = useState<string>('Toate');

  const getBadgeColor = (tip: string) => {
    switch (tip) {
      case 'Facturare Comandă':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'Penalizare':
        return 'bg-rose-100 text-rose-800 border-rose-200';
      case 'Storno':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'Discount Extra':
        return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  const tranzactiiFiltrate = useMemo(() => {
    return istoricFacturareMock.filter((trx) => {
      const matchSearch =
        trx.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
        trx.numarDocument.toLowerCase().includes(searchTerm.toLowerCase());
      const matchTip = filtruTip === 'Toate' || trx.tipOperatiune === filtruTip;
      return matchSearch && matchTip;
    });
  }, [searchTerm, filtruTip]);

  return (
    <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
      <div className="flex justify-between items-end mb-8 border-b border-slate-100 pb-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Istoric Facturare</h2>
          <p className="text-slate-500 mt-1 text-sm">
            Monitorizarea documentelor emise în modulul de facturare.
          </p>
        </div>
        <div className="text-right">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
            Documente Emise
          </p>
          <p className="text-2xl font-bold text-indigo-600">{tranzactiiFiltrate.length}</p>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-6 bg-slate-50 p-4 rounded-xl border border-slate-200">
        <div className="flex-1 relative">
          <svg
            className="w-5 h-5 absolute left-3 top-3 text-slate-400"
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
          <input
            type="text"
            placeholder="Caută după client sau număr document..."
            className="w-full bg-white border border-slate-300 rounded-lg pl-10 pr-4 py-2.5 focus:ring-2 focus:ring-indigo-500 outline-none shadow-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="w-full md:w-64">
          <select
            className="w-full bg-white border border-slate-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 outline-none shadow-sm font-medium text-slate-700"
            value={filtruTip}
            onChange={(e) => setFiltruTip(e.target.value)}
          >
            <option value="Toate">Toate Operațiunile</option>
            <option value="Facturare Comandă">Doar Facturări</option>
            <option value="Penalizare">Doar Penalizări</option>
            <option value="Storno">Doar Stornări</option>
            <option value="Discount Extra">Doar Discounturi</option>
          </select>
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl border border-slate-200 shadow-sm">
        <table className="min-w-full bg-white text-left text-sm whitespace-nowrap">
          <thead className="bg-slate-800 text-white font-medium">
            <tr>
              <th className="py-4 px-6">Dată & Oră</th>
              <th className="py-4 px-6">Tip Operațiune</th>
              <th className="py-4 px-6">Document</th>
              <th className="py-4 px-6">Client</th>
              <th className="py-4 px-6 text-right">Valoare (RON)</th>
              <th className="py-4 px-6">Detalii / Motiv</th>
              <th className="py-4 px-6">Utilizator</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {tranzactiiFiltrate.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-8 text-center text-slate-500">
                  Nu a fost găsită nicio înregistrare.
                </td>
              </tr>
            ) : (
              tranzactiiFiltrate.map((trx) => (
                <tr key={trx.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-4 px-6 text-slate-500 font-medium">{trx.dataOra}</td>
                  <td className="py-4 px-6">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold border ${getBadgeColor(trx.tipOperatiune)}`}
                    >
                      {trx.tipOperatiune}
                    </span>
                  </td>
                  <td className="py-4 px-6 font-bold text-slate-800">{trx.numarDocument}</td>
                  <td className="py-4 px-6 font-semibold text-slate-700">{trx.client}</td>
                  <td
                    className={`py-4 px-6 text-right font-bold ${
                      trx.valoare < 0 ? 'text-rose-600' : 'text-emerald-600'
                    }`}
                  >
                    {trx.valoare > 0 ? '+' : ''}
                    {trx.valoare.toFixed(2)}
                  </td>
                  <td className="py-4 px-6 text-slate-500 truncate max-w-xs">{trx.detalii}</td>
                  <td className="py-4 px-6 text-slate-500">{trx.utilizator}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
