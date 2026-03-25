import { useState } from 'react';
import type { Asigurator as AsiguratorType } from '../../../types/entitati';

export default function Asigurator() {
  const [asiguratori, setAsiguratori] = useState<AsiguratorType[]>([]);
  const [modLucru, setModLucru] = useState<'vizualizare' | 'adaugare' | 'modificare'>('vizualizare');
  const [asigCurent, setAsigCurent] = useState<Partial<AsiguratorType>>({});

  const handleSalvare = () => {
    if (asigCurent.idAsigurator) {
      setAsiguratori(asiguratori.map(a => a.idAsigurator === asigCurent.idAsigurator ? (asigCurent as AsiguratorType) : a));
    } else {
      setAsiguratori([...asiguratori, { ...asigCurent, idAsigurator: Date.now() } as AsiguratorType]);
    }
    setModLucru('vizualizare');
    setAsigCurent({});
  };

  const handleStergere = (id: number) => {
    if (window.confirm('Ștergi acest asigurător?')) {
      setAsiguratori(asiguratori.filter(a => a.idAsigurator !== id));
    }
  };

  return (
    <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Societăți Asigurare</h1>
        {modLucru === 'vizualizare' && (
          <button type="button" onClick={() => { setModLucru('adaugare'); setAsigCurent({}); }} className="bg-indigo-600 text-white px-4 py-2 rounded-xl shadow-sm hover:bg-indigo-700 transition-colors">
            + Adaugă Asigurător
          </button>
        )}
      </div>

      {modLucru === 'vizualizare' ? (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-sm">
                <th className="p-4 font-semibold">Denumire Societate</th>
                <th className="p-4 font-semibold">CUI</th>
                <th className="p-4 font-semibold">Telefon de contact</th>
                <th className="p-4 font-semibold text-center">Acțiuni</th>
              </tr>
            </thead>
            <tbody>
              {asiguratori.length === 0 ? (
                <tr><td colSpan={4} className="p-8 text-center text-slate-400">Nu există asigurători înregistrați.</td></tr>
              ) : (
                asiguratori.map(a => (
                  <tr key={a.idAsigurator} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                    <td className="p-4 font-medium text-slate-700">{a.denumire}</td>
                    <td className="p-4 text-slate-600">{a.CUI}</td>
                    <td className="p-4 text-slate-600">{a.telefon}</td>
                    <td className="p-4 flex justify-center gap-2">
                      <button type="button" onClick={() => { setModLucru('modificare'); setAsigCurent(a); }} className="text-indigo-600 hover:bg-indigo-50 px-3 py-1 rounded transition-colors text-sm font-medium">Editează</button>
                      <button type="button" onClick={() => handleStergere(a.idAsigurator)} className="text-red-600 hover:bg-red-50 px-3 py-1 rounded transition-colors text-sm font-medium">Șterge</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 max-w-2xl">
          <h2 className="text-xl font-semibold mb-4 text-slate-800">{modLucru === 'adaugare' ? 'Adăugare Asigurător' : 'Modificare Asigurător'}</h2>
          <div className="flex flex-col gap-4">
            <div><label className="block text-sm font-medium text-slate-700 mb-1">Denumire Societate</label><input type="text" value={asigCurent.denumire || ''} onChange={e => setAsigCurent({...asigCurent, denumire: e.target.value})} className="w-full border border-slate-300 p-2.5 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" /></div>
            <div><label className="block text-sm font-medium text-slate-700 mb-1">CUI</label><input type="text" value={asigCurent.CUI || ''} onChange={e => setAsigCurent({...asigCurent, CUI: e.target.value})} className="w-full border border-slate-300 p-2.5 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" /></div>
            <div><label className="block text-sm font-medium text-slate-700 mb-1">Telefon</label><input type="text" value={asigCurent.telefon || ''} onChange={e => setAsigCurent({...asigCurent, telefon: e.target.value})} className="w-full border border-slate-300 p-2.5 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" /></div>
          </div>
          <div className="mt-6 flex gap-3">
            <button type="button" onClick={handleSalvare} className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition-colors font-medium">Salvează</button>
            <button type="button" onClick={() => setModLucru('vizualizare')} className="bg-white border border-slate-300 text-slate-700 px-6 py-2 rounded-lg hover:bg-slate-50 transition-colors font-medium">Renunță</button>
          </div>
        </div>
      )}
    </div>
  );
}