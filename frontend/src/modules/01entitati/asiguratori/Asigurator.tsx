import { useState } from 'react';

export default function Asigurator() {
  const [asiguratori] = useState([
    { id: 1, denumire: 'Allianz-Țiriac', contact: 'daune@allianz.ro' },
    { id: 2, denumire: 'Groupama', contact: 'contact@groupama.ro' },
  ]);

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-slate-800">Asigurători</h2>
        <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded shadow text-sm font-semibold">
          + Adaugă Asigurător
        </button>
      </div>

      <div className="overflow-x-auto rounded-xl border border-slate-200">
        <table className="min-w-full bg-white text-left text-sm">
          <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
            <tr>
              <th className="py-3 px-4">Denumire</th>
              <th className="py-3 px-4">Contact</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {asiguratori.map(a => (
              <tr key={a.id} className="hover:bg-slate-50">
                <td className="py-3 px-4 font-medium">{a.denumire}</td>
                <td className="py-3 px-4 text-slate-500">{a.contact}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}