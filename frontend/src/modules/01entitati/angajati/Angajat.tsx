import { useState } from 'react';

interface AngajatData {
  id: number;
  nume: string;
  functie: string;
  telefon: string;
}

export default function Angajat() {
  const [angajati, setAngajati] = useState<AngajatData[]>([
    { id: 1, nume: 'Vasile Dorel', functie: 'Mecanic', telefon: '0799888777' },
    { id: 2, nume: 'Elena Maria', functie: 'Recepționer', telefon: '0788111222' },
  ]);

  const [arataFormular, setArataFormular] = useState(false);
  const [nouNume, setNouNume] = useState('');
  const [nouFunctie, setNouFunctie] = useState('Mecanic');
  const [nouTelefon, setNouTelefon] = useState('');

  const [editId, setEditId] = useState<number | null>(null);
  const [editData, setEditData] = useState<Partial<AngajatData>>({});

  const handleAdaugare = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nouNume) return;
    setAngajati([{ id: Date.now(), nume: nouNume, functie: nouFunctie, telefon: nouTelefon }, ...angajati]);
    setArataFormular(false);
    setNouNume(''); setNouTelefon('');
  };

  const startEditare = (angajat: AngajatData) => {
    setEditId(angajat.id);
    setEditData(angajat);
  };

  const salveazaEditare = () => {
    setAngajati(angajati.map(a => a.id === editId ? { ...a, ...editData } as AngajatData : a));
    setEditId(null);
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-slate-800">Angajați</h2>
        <button 
          onClick={() => setArataFormular(!arataFormular)}
          className={`${arataFormular ? 'bg-slate-200 text-slate-700' : 'bg-indigo-600 text-white'} px-4 py-2 rounded shadow text-sm font-semibold`}
        >
          {arataFormular ? 'Anulează' : '+ Adaugă Angajat'}
        </button>
      </div>

      {arataFormular && (
        <form onSubmit={handleAdaugare} className="mb-6 p-4 bg-slate-50 border border-slate-200 rounded-xl grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          <div className="md:col-span-2">
            <label className="block text-xs font-semibold text-slate-700 mb-1">Nume Complet *</label>
            <input type="text" value={nouNume} onChange={e => setNouNume(e.target.value)} className="w-full border rounded-lg px-3 py-2 text-sm outline-none focus:border-indigo-500" required/>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Funcție</label>
            <input type="text" value={nouFunctie} onChange={e => setNouFunctie(e.target.value)} className="w-full border rounded-lg px-3 py-2 text-sm outline-none focus:border-indigo-500"/>
          </div>
          <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-green-700 h-9.5">
            Salvează
          </button>
        </form>
      )}

      <div className="overflow-x-auto rounded-xl border border-slate-200">
        <table className="min-w-full bg-white text-left text-sm">
          <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
            <tr>
              <th className="py-3 px-4">Nume</th>
              <th className="py-3 px-4">Funcție</th>
              <th className="py-3 px-4">Telefon</th>
              <th className="py-3 px-4 text-center w-24">Acțiuni</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {angajati.map(a => (
              <tr key={a.id} className="hover:bg-slate-50">
                {editId === a.id ? (
                  <>
                    <td className="py-2 px-4"><input type="text" value={editData.nume} onChange={e => setEditData({...editData, nume: e.target.value})} className="w-full border rounded px-2 py-1 text-sm outline-none" /></td>
                    <td className="py-2 px-4"><input type="text" value={editData.functie} onChange={e => setEditData({...editData, functie: e.target.value})} className="w-full border rounded px-2 py-1 text-sm outline-none" /></td>
                    <td className="py-2 px-4"><input type="text" value={editData.telefon} onChange={e => setEditData({...editData, telefon: e.target.value})} className="w-full border rounded px-2 py-1 text-sm outline-none" /></td>
                    <td className="py-2 px-4 text-center space-x-2">
                      <button onClick={salveazaEditare} className="text-green-600 font-bold hover:underline">OK</button>
                    </td>
                  </>
                ) : (
                  <>
                    <td className="py-3 px-4 font-medium">{a.nume}</td>
                    <td className="py-3 px-4 text-slate-500">{a.functie}</td>
                    <td className="py-3 px-4 text-slate-500">{a.telefon}</td>
                    <td className="py-3 px-4 text-center">
                      <button onClick={() => startEditare(a)} className="text-indigo-600 font-medium hover:underline">Edit</button>
                    </td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}