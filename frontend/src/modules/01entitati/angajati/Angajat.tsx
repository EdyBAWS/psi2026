import { useState } from 'react';

export default function Angajat() {
  const [angajati] = useState([
    { id: 1, nume: 'Vasile Dorel', functie: 'Mecanic', telefon: '0799888777' },
    { id: 2, nume: 'Elena Maria', functie: 'Recepționer', telefon: '0788111222' },
  ]);

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-slate-800">Angajați</h2>
        <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded shadow text-sm font-semibold">
          + Adaugă Angajat
        </button>
      </div>

      <div className="overflow-x-auto rounded-xl border border-slate-200">
        <table className="min-w-full bg-white text-left text-sm">
          <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
            <tr>
              <th className="py-3 px-4">Nume</th>
              <th className="py-3 px-4">Funcție</th>
              <th className="py-3 px-4">Telefon</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {angajati.map(a => (
              <tr key={a.id} className="hover:bg-slate-50">
                <td className="py-3 px-4 font-medium">{a.nume}</td>
                <td className="py-3 px-4 text-slate-500">{a.functie}</td>
                <td className="py-3 px-4 text-slate-500">{a.telefon}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}