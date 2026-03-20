import { useState } from 'react';

interface AsigData {
  id: number;
  denumire: string;
  contact: string;
}

export default function Asigurator() {
  const [asiguratori, setAsiguratori] = useState<AsigData[]>([
    { id: 1, denumire: 'Allianz-Țiriac', contact: 'daune@allianz.ro' },
    { id: 2, denumire: 'Groupama', contact: 'contact@groupama.ro' },
  ]);

  const [arataFormular, setArataFormular] = useState(false);
  const [nouDenumire, setNouDenumire] = useState('');
  const [nouContact, setNouContact] = useState('');

  const [editId, setEditId] = useState<number | null>(null);
  const [editData, setEditData] = useState<Partial<AsigData>>({});

  const handleAdaugare = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nouDenumire) return;
    setAsiguratori([{ id: Date.now(), denumire: nouDenumire, contact: nouContact }, ...asiguratori]);
    setArataFormular(false);
    setNouDenumire(''); setNouContact('');
  };

  const startEditare = (asig: AsigData) => {
    setEditId(asig.id);
    setEditData(asig);
  };

  const salveazaEditare = () => {
    setAsiguratori(asiguratori.map(a => a.id === editId ? { ...a, ...editData } as AsigData : a));
    setEditId(null);
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-slate-800">Asigurători</h2>
        <button 
          onClick={() => setArataFormular(!arataFormular)}
          className={`${arataFormular ? 'bg-slate-200 text-slate-700' : 'bg-indigo-600 text-white'} px-4 py-2 rounded shadow text-sm font-semibold`}
        >
          {arataFormular ? 'Anulează' : '+ Adaugă Asigurător'}
        </button>
      </div>

      {arataFormular && (
        <form onSubmit={handleAdaugare} className="mb-6 p-4 bg-slate-50 border border-slate-200 rounded-xl grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Denumire Asigurător *</label>
            <input type="text" value={nouDenumire} onChange={e => setNouDenumire(e.target.value)} className="w-full border rounded-lg px-3 py-2 text-sm outline-none focus:border-indigo-500" required/>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Date Contact (Email/Tel)</label>
            <input type="text" value={nouContact} onChange={e => setNouContact(e.target.value)} className="w-full border rounded-lg px-3 py-2 text-sm outline-none focus:border-indigo-500"/>
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
              <th className="py-3 px-4">Denumire</th>
              <th className="py-3 px-4">Contact</th>
              <th className="py-3 px-4 text-center w-24">Acțiuni</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {asiguratori.map(a => (
              <tr key={a.id} className="hover:bg-slate-50">
                {editId === a.id ? (
                  <>
                    <td className="py-2 px-4"><input type="text" value={editData.denumire} onChange={e => setEditData({...editData, denumire: e.target.value})} className="w-full border rounded px-2 py-1 text-sm outline-none" /></td>
                    <td className="py-2 px-4"><input type="text" value={editData.contact} onChange={e => setEditData({...editData, contact: e.target.value})} className="w-full border rounded px-2 py-1 text-sm outline-none" /></td>
                    <td className="py-2 px-4 text-center space-x-2">
                      <button onClick={salveazaEditare} className="text-green-600 font-bold hover:underline">OK</button>
                    </td>
                  </>
                ) : (
                  <>
                    <td className="py-3 px-4 font-medium">{a.denumire}</td>
                    <td className="py-3 px-4 text-slate-500">{a.contact}</td>
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