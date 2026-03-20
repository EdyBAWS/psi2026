import { useState } from 'react';

export default function Client() {
  const [clienti] = useState([
    { id: 1, nume: 'Ion Popescu', tip: 'Fizica', telefon: '0711222333', email: 'ion@email.com', sold: 0 },
    { id: 2, nume: 'SC Auto Fleet SRL', tip: 'Juridica', telefon: '0744555666', email: 'contact@autofleet.ro', sold: 1500 },
  ]);

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-slate-800">Clienți</h2>
        <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded shadow transition-colors text-sm font-semibold">
          + Adaugă Client
        </button>
      </div>

      <div className="overflow-x-auto rounded-xl border border-slate-200">
        <table className="min-w-full bg-white text-left text-sm">
          <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
            <tr>
              <th className="py-3 px-4">Nume / Denumire</th>
              <th className="py-3 px-4">Tip</th>
              <th className="py-3 px-4">Contact</th>
              <th className="py-3 px-4 text-right">Sold Debitor</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {clienti.map(c => (
              <tr key={c.id} className="hover:bg-slate-50">
                <td className="py-3 px-4 font-medium">{c.nume}</td>
                <td className="py-3 px-4 text-slate-500">{c.tip}</td>
                <td className="py-3 px-4 text-slate-500">{c.telefon}</td>
                <td className="py-3 px-4 text-right font-bold text-red-600">{c.sold} RON</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}