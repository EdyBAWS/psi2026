import { useState } from 'react';

// Tipul de date conform diagramei ERD
interface ManoperaItem {
  idManopera: number;
  codManopera: string;
  durataStd: number;
}

export default function Manopera() {
  const [listaManopera, setListaManopera] = useState<ManoperaItem[]>([
    { idManopera: 1, codManopera: 'MAN-SCHIMB-ULEI', durataStd: 0.5 },
    { idManopera: 2, codManopera: 'MAN-DISTRIBUTIE', durataStd: 4.0 },
    { idManopera: 3, codManopera: 'MAN-DIAGNOZA', durataStd: 1.0 },
  ]);

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Catalog Manoperă</h2>
          <p className="text-slate-500 mt-1 text-sm">Gestionarea timpilor standard de reparație</p>
        </div>
        <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-lg shadow-md font-medium transition-all">
          + Adaugă Operațiune
        </button>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
            <tr>
              <th className="py-3 px-4">Cod Manoperă</th>
              <th className="py-3 px-4 text-right">Durată Standard (Ore)</th>
              <th className="py-3 px-4 text-center w-24">Acțiuni</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {listaManopera.map((item) => (
              <tr key={item.idManopera} className="hover:bg-slate-50 transition-colors">
                <td className="py-3 px-4 font-medium text-slate-800">{item.codManopera}</td>
                <td className="py-3 px-4 text-right text-indigo-600 font-bold">{item.durataStd.toFixed(2)}h</td>
                <td className="py-3 px-4 text-center">
                  <button className="text-slate-400 hover:text-indigo-600 transition-colors">Edit</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}