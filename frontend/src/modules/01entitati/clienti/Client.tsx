import { useState } from 'react';

interface ClientData {
  id: number;
  nume: string;
  tip: 'Fizica' | 'Juridica';
  telefon: string;
  email: string;
  sold: number;
}

export default function Client() {
  const [clienti, setClienti] = useState<ClientData[]>([
    { id: 1, nume: 'Ion Popescu', tip: 'Fizica', telefon: '0711222333', email: 'ion@email.com', sold: 0 },
    { id: 2, nume: 'SC Auto Fleet SRL', tip: 'Juridica', telefon: '0744555666', email: 'contact@autofleet.ro', sold: 1500 },
  ]);

  const [arataFormular, setArataFormular] = useState(false);
  
  // State pentru adăugare
  const [nouNume, setNouNume] = useState('');
  const [nouTip, setNouTip] = useState<'Fizica' | 'Juridica'>('Fizica');
  const [nouTelefon, setNouTelefon] = useState('');
  const [nouEmail, setNouEmail] = useState('');

  // State pentru editare dinamică (inline)
  const [editId, setEditId] = useState<number | null>(null);
  const [editData, setEditData] = useState<Partial<ClientData>>({});

  const handleAdaugare = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nouNume || !nouTelefon) return alert('Numele și telefonul sunt obligatorii!');
    
    const clientNou: ClientData = {
      id: Date.now(),
      nume: nouNume,
      tip: nouTip,
      telefon: nouTelefon,
      email: nouEmail,
      sold: 0 // Un client nou pleacă cu sold 0
    };
    setClienti([clientNou, ...clienti]);
    setArataFormular(false);
    setNouNume(''); setNouTelefon(''); setNouEmail(''); setNouTip('Fizica');
  };

  const startEditare = (client: ClientData) => {
    setEditId(client.id);
    setEditData(client);
  };

  const salveazaEditare = () => {
    setClienti(clienti.map(c => c.id === editId ? { ...c, ...editData } as ClientData : c));
    setEditId(null);
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-slate-800">Clienți</h2>
        <button 
          onClick={() => setArataFormular(!arataFormular)}
          className={`${arataFormular ? 'bg-slate-200 text-slate-700' : 'bg-indigo-600 text-white'} hover:opacity-90 px-4 py-2 rounded shadow transition-colors text-sm font-semibold`}
        >
          {arataFormular ? 'Anulează' : '+ Adaugă Client'}
        </button>
      </div>

      {arataFormular && (
        <form onSubmit={handleAdaugare} className="mb-6 p-4 bg-slate-50 border border-slate-200 rounded-xl grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
          <div className="md:col-span-2">
            <label className="block text-xs font-semibold text-slate-700 mb-1">Nume / Denumire *</label>
            <input type="text" value={nouNume} onChange={e => setNouNume(e.target.value)} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-indigo-500" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Tip *</label>
            <select value={nouTip} onChange={e => setNouTip(e.target.value as 'Fizica' | 'Juridica')} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-indigo-500">
              <option value="Fizica">Fizică</option>
              <option value="Juridica">Juridică</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Telefon *</label>
            <input type="text" value={nouTelefon} onChange={e => setNouTelefon(e.target.value)} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-indigo-500" />
          </div>
          <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-green-700 transition-colors h-9.5">
            Salvează
          </button>
        </form>
      )}

      <div className="overflow-x-auto rounded-xl border border-slate-200">
        <table className="min-w-full bg-white text-left text-sm">
          <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
            <tr>
              <th className="py-3 px-4">Nume / Denumire</th>
              <th className="py-3 px-4 w-32">Tip</th>
              <th className="py-3 px-4 w-40">Contact</th>
              <th className="py-3 px-4 text-right w-32">Sold Debitor</th>
              <th className="py-3 px-4 text-center w-24">Acțiuni</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {clienti.map(c => (
              <tr key={c.id} className="hover:bg-slate-50">
                {editId === c.id ? (
                  // Modul EDITARE
                  <>
                    <td className="py-2 px-4"><input type="text" value={editData.nume} onChange={e => setEditData({...editData, nume: e.target.value})} className="w-full border rounded px-2 py-1 text-sm outline-none focus:border-indigo-500" /></td>
                    <td className="py-2 px-4">
                      <select value={editData.tip} onChange={e => setEditData({...editData, tip: e.target.value as 'Fizica'|'Juridica'})} className="w-full border rounded px-2 py-1 text-sm outline-none">
                        <option value="Fizica">Fizică</option><option value="Juridica">Juridică</option>
                      </select>
                    </td>
                    <td className="py-2 px-4"><input type="text" value={editData.telefon} onChange={e => setEditData({...editData, telefon: e.target.value})} className="w-full border rounded px-2 py-1 text-sm outline-none focus:border-indigo-500" /></td>
                    <td className="py-2 px-4 text-right font-bold text-slate-400">{c.sold} RON</td>
                    <td className="py-2 px-4 text-center space-x-2">
                      <button onClick={salveazaEditare} className="text-green-600 font-bold hover:underline">OK</button>
                      <button onClick={() => setEditId(null)} className="text-slate-500 hover:underline">X</button>
                    </td>
                  </>
                ) : (
                  // Modul VIZUALIZARE
                  <>
                    <td className="py-3 px-4 font-medium">{c.nume}</td>
                    <td className="py-3 px-4 text-slate-500">{c.tip}</td>
                    <td className="py-3 px-4 text-slate-500">{c.telefon}</td>
                    <td className="py-3 px-4 text-right font-bold text-red-600">{c.sold} RON</td>
                    <td className="py-3 px-4 text-center">
                      <button onClick={() => startEditare(c)} className="text-indigo-600 font-medium hover:underline">Edit</button>
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