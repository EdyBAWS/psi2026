import { useState } from 'react';
import type { Angajat as AngajatType } from '../../../types/entitati';

export default function Angajat() {
  const [angajati, setAngajati] = useState<AngajatType[]>([]);
  const [modLucru, setModLucru] = useState<'vizualizare' | 'adaugare' | 'modificare'>('vizualizare');
  const [angajatCurent, setAngajatCurent] = useState<Partial<AngajatType>>({});

  const handleSalvare = () => {
    if (angajatCurent.idAngajat) {
      setAngajati(angajati.map(a => a.idAngajat === angajatCurent.idAngajat ? (angajatCurent as AngajatType) : a));
    } else {
      setAngajati([...angajati, { ...angajatCurent, idAngajat: Date.now() } as AngajatType]);
    }
    setModLucru('vizualizare');
    setAngajatCurent({});
  };

  const handleStergere = (id: number) => {
    if (window.confirm('Ștergi acest angajat?')) {
      setAngajati(angajati.filter(a => a.idAngajat !== id));
    }
  };

  return (
    <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Gestiune Angajați</h1>
        {modLucru === 'vizualizare' && (
          <button onClick={() => { setModLucru('adaugare'); setAngajatCurent({ tipAngajat: 'Mecanic' }); }} className="bg-indigo-600 text-white px-4 py-2 rounded-xl shadow-sm hover:bg-indigo-700 transition-colors">
            + Adaugă Angajat
          </button>
        )}
      </div>

      {modLucru === 'vizualizare' ? (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-sm">
                <th className="p-4 font-semibold">Nume și Prenume</th>
                <th className="p-4 font-semibold">Rol (Funcție)</th>
                <th className="p-4 font-semibold">Telefon</th>
                <th className="p-4 font-semibold">Email</th>
                <th className="p-4 font-semibold text-center">Acțiuni</th>
              </tr>
            </thead>
            <tbody>
              {angajati.length === 0 ? (
                <tr><td colSpan={5} className="p-8 text-center text-slate-400">Nu există angajați înregistrați.</td></tr>
              ) : (
                angajati.map(a => (
                  <tr key={a.idAngajat} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                    <td className="p-4 font-medium text-slate-700">{a.nume} {a.prenume}</td>
                    <td className="p-4"><span className="bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full text-xs font-bold">{a.tipAngajat}</span></td>
                    <td className="p-4 text-slate-600">{a.telefon}</td>
                    <td className="p-4 text-slate-600">{a.email}</td>
                    <td className="p-4 flex justify-center gap-2">
                      <button onClick={() => { setModLucru('modificare'); setAngajatCurent(a); }} className="text-indigo-600 hover:bg-indigo-50 px-3 py-1 rounded transition-colors text-sm font-medium">Editează</button>
                      <button onClick={() => handleStergere(a.idAngajat)} className="text-red-600 hover:bg-red-50 px-3 py-1 rounded transition-colors text-sm font-medium">Șterge</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="bg-slate-50 p-6 rounded-xl border border-slate-200">
          <h2 className="text-xl font-semibold mb-4 text-slate-800">{modLucru === 'adaugare' ? 'Adăugare Angajat' : 'Modificare Angajat'}</h2>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium text-slate-700 mb-1">Nume</label><input type="text" value={angajatCurent.nume || ''} onChange={e => setAngajatCurent({...angajatCurent, nume: e.target.value})} className="w-full border border-slate-300 p-2.5 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" /></div>
            <div><label className="block text-sm font-medium text-slate-700 mb-1">Prenume</label><input type="text" value={angajatCurent.prenume || ''} onChange={e => setAngajatCurent({...angajatCurent, prenume: e.target.value})} className="w-full border border-slate-300 p-2.5 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" /></div>
            <div><label className="block text-sm font-medium text-slate-700 mb-1">CNP</label><input type="text" value={angajatCurent.CNP || ''} onChange={e => setAngajatCurent({...angajatCurent, CNP: e.target.value})} className="w-full border border-slate-300 p-2.5 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" /></div>
            <div><label className="block text-sm font-medium text-slate-700 mb-1">Telefon</label><input type="text" value={angajatCurent.telefon || ''} onChange={e => setAngajatCurent({...angajatCurent, telefon: e.target.value})} className="w-full border border-slate-300 p-2.5 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" /></div>
            <div><label className="block text-sm font-medium text-slate-700 mb-1">Email</label><input type="email" value={angajatCurent.email || ''} onChange={e => setAngajatCurent({...angajatCurent, email: e.target.value})} className="w-full border border-slate-300 p-2.5 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" /></div>
            
            <div className="col-span-2 mt-2"><hr className="border-slate-200" /></div>

            <div>
              <label className="block text-sm font-bold text-indigo-700 mb-1">Rol Angajat</label>
              <select value={angajatCurent.tipAngajat} onChange={e => setAngajatCurent({...angajatCurent, tipAngajat: e.target.value as 'Manager' | 'Mecanic' | 'Receptioner'})} className="w-full border border-indigo-300 bg-indigo-50 p-2.5 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none">
                <option value="Manager">Manager</option>
                <option value="Mecanic">Mecanic</option>
                <option value="Receptioner">Recepționer</option>
              </select>
            </div>

            {angajatCurent.tipAngajat === 'Manager' && (
              <>
                <div><label className="block text-sm font-medium text-slate-700 mb-1">Departament</label><input type="text" value={angajatCurent.departament || ''} onChange={e => setAngajatCurent({...angajatCurent, departament: e.target.value})} className="w-full border border-slate-300 p-2.5 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" /></div>
                <div><label className="block text-sm font-medium text-slate-700 mb-1">Spor Conducere (RON)</label><input type="number" value={angajatCurent.sporConducere || 0} onChange={e => setAngajatCurent({...angajatCurent, sporConducere: Number(e.target.value)})} className="w-full border border-slate-300 p-2.5 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" /></div>
              </>
            )}
            {angajatCurent.tipAngajat === 'Mecanic' && (
              <>
                <div><label className="block text-sm font-medium text-slate-700 mb-1">Specializare</label><input type="text" value={angajatCurent.specializare || ''} onChange={e => setAngajatCurent({...angajatCurent, specializare: e.target.value})} className="w-full border border-slate-300 p-2.5 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" /></div>
                <div><label className="block text-sm font-medium text-slate-700 mb-1">Cost Orar (RON)</label><input type="number" value={angajatCurent.costOrar || 0} onChange={e => setAngajatCurent({...angajatCurent, costOrar: Number(e.target.value)})} className="w-full border border-slate-300 p-2.5 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" /></div>
              </>
            )}
            {angajatCurent.tipAngajat === 'Receptioner' && (
              <>
                <div><label className="block text-sm font-medium text-slate-700 mb-1">Nr. Birou</label><input type="text" value={angajatCurent.nrBirou || ''} onChange={e => setAngajatCurent({...angajatCurent, nrBirou: e.target.value})} className="w-full border border-slate-300 p-2.5 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" /></div>
                <div><label className="block text-sm font-medium text-slate-700 mb-1">Tura</label><input type="text" value={angajatCurent.tura || ''} onChange={e => setAngajatCurent({...angajatCurent, tura: e.target.value})} className="w-full border border-slate-300 p-2.5 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" /></div>
              </>
            )}
          </div>
          <div className="mt-6 flex gap-3">
            <button onClick={handleSalvare} className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition-colors font-medium">Salvează</button>
            <button onClick={() => setModLucru('vizualizare')} className="bg-white border border-slate-300 text-slate-700 px-6 py-2 rounded-lg hover:bg-slate-50 transition-colors font-medium">Renunță</button>
          </div>
        </div>
      )}
    </div>
  );
}