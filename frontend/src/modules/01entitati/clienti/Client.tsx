import { useState } from 'react';
import type { Client as ClientType } from '../../../types/entitati';

export default function Client() {
  const [clienti, setClienti] = useState<ClientType[]>([]);
  const [modLucru, setModLucru] = useState<'vizualizare' | 'adaugare' | 'modificare'>('vizualizare');
  const [clientCurent, setClientCurent] = useState<Partial<ClientType>>({});

  const handleSalvare = () => {
    if (clientCurent.idClient) {
      setClienti(clienti.map(c => c.idClient === clientCurent.idClient ? (clientCurent as ClientType) : c));
    } else {
      setClienti([...clienti, { ...clientCurent, idClient: Date.now() } as ClientType]);
    }
    setModLucru('vizualizare');
    setClientCurent({});
  };

  const handleStergere = (id: number) => {
    if (window.confirm('Sigur dorești să ștergi acest client?')) {
      setClienti(clienti.filter(c => c.idClient !== id));
    }
  };

  return (
    <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Gestiune Clienți</h1>
        {modLucru === 'vizualizare' && (
          <button 
            onClick={() => { setModLucru('adaugare'); setClientCurent({ tipClient: 'PF', soldDebitor: 0 }); }}
            className="bg-indigo-600 text-white px-4 py-2 rounded-xl shadow-sm hover:bg-indigo-700 transition-colors"
          >
            + Adaugă Client
          </button>
        )}
      </div>

      {modLucru === 'vizualizare' ? (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-sm">
                <th className="p-4 font-semibold">Nume / CUI</th>
                <th className="p-4 font-semibold">Tip</th>
                <th className="p-4 font-semibold">Telefon</th>
                <th className="p-4 font-semibold">Email</th>
                <th className="p-4 font-semibold">Sold Debitor</th>
                <th className="p-4 font-semibold text-center">Acțiuni</th>
              </tr>
            </thead>
            <tbody>
              {clienti.length === 0 ? (
                <tr><td colSpan={6} className="p-8 text-center text-slate-400">Nu există clienți înregistrați.</td></tr>
              ) : (
                clienti.map(c => (
                  <tr key={c.idClient} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                    <td className="p-4 font-medium text-slate-700">{c.tipClient === 'PF' ? c.CNP : c.CUI}</td>
                    <td className="p-4"><span className="bg-slate-200 text-slate-700 px-2 py-1 rounded text-xs font-bold">{c.tipClient}</span></td>
                    <td className="p-4 text-slate-600">{c.telefon}</td>
                    <td className="p-4 text-slate-600">{c.email}</td>
                    <td className="p-4 font-semibold text-slate-700">{c.soldDebitor} RON</td>
                    <td className="p-4 flex justify-center gap-2">
                      <button onClick={() => { setModLucru('modificare'); setClientCurent(c); }} className="text-indigo-600 hover:bg-indigo-50 px-3 py-1 rounded transition-colors text-sm font-medium">Editează</button>
                      <button onClick={() => handleStergere(c.idClient)} className="text-red-600 hover:bg-red-50 px-3 py-1 rounded transition-colors text-sm font-medium">Șterge</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="bg-slate-50 p-6 rounded-xl border border-slate-200">
          <h2 className="text-xl font-semibold mb-4 text-slate-800">{modLucru === 'adaugare' ? 'Adăugare Client Nou' : 'Modificare Client'}</h2>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Tip Client</label>
              <select value={clientCurent.tipClient} onChange={e => setClientCurent({...clientCurent, tipClient: e.target.value as 'PF'|'PJ'})} className="w-full border border-slate-300 p-2.5 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none">
                <option value="PF">Persoană Fizică (PF)</option>
                <option value="PJ">Persoană Juridică (PJ)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Telefon</label>
              <input type="text" value={clientCurent.telefon || ''} onChange={e => setClientCurent({...clientCurent, telefon: e.target.value})} className="w-full border border-slate-300 p-2.5 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
              <input type="email" value={clientCurent.email || ''} onChange={e => setClientCurent({...clientCurent, email: e.target.value})} className="w-full border border-slate-300 p-2.5 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Adresă</label>
              <input type="text" value={clientCurent.adresa || ''} onChange={e => setClientCurent({...clientCurent, adresa: e.target.value})} className="w-full border border-slate-300 p-2.5 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" />
            </div>

            {clientCurent.tipClient === 'PF' ? (
              <>
                <div><label className="block text-sm font-medium text-slate-700 mb-1">CNP</label><input type="text" value={clientCurent.CNP || ''} onChange={e => setClientCurent({...clientCurent, CNP: e.target.value})} className="w-full border border-slate-300 p-2.5 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" /></div>
                <div><label className="block text-sm font-medium text-slate-700 mb-1">Serie CI</label><input type="text" value={clientCurent.serieCI || ''} onChange={e => setClientCurent({...clientCurent, serieCI: e.target.value})} className="w-full border border-slate-300 p-2.5 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" /></div>
              </>
            ) : (
              <>
                <div><label className="block text-sm font-medium text-slate-700 mb-1">CUI</label><input type="text" value={clientCurent.CUI || ''} onChange={e => setClientCurent({...clientCurent, CUI: e.target.value})} className="w-full border border-slate-300 p-2.5 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" /></div>
                <div><label className="block text-sm font-medium text-slate-700 mb-1">Nr. Reg. Comerțului</label><input type="text" value={clientCurent.nrRegCom || ''} onChange={e => setClientCurent({...clientCurent, nrRegCom: e.target.value})} className="w-full border border-slate-300 p-2.5 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" /></div>
                <div><label className="block text-sm font-medium text-slate-700 mb-1">IBAN</label><input type="text" value={clientCurent.IBAN || ''} onChange={e => setClientCurent({...clientCurent, IBAN: e.target.value})} className="w-full border border-slate-300 p-2.5 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" /></div>
              </>
            )}
            
            <div><label className="block text-sm font-medium text-slate-700 mb-1">Sold Debitor (RON)</label><input type="number" value={clientCurent.soldDebitor || 0} onChange={e => setClientCurent({...clientCurent, soldDebitor: Number(e.target.value)})} className="w-full border border-slate-300 p-2.5 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" /></div>
          </div>

          <div className="mt-6 flex gap-3">
            <button onClick={handleSalvare} className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition-colors font-medium">Salvează Datele</button>
            <button onClick={() => setModLucru('vizualizare')} className="bg-white border border-slate-300 text-slate-700 px-6 py-2 rounded-lg hover:bg-slate-50 transition-colors font-medium">Renunță</button>
          </div>
        </div>
      )}
    </div>
  );
}