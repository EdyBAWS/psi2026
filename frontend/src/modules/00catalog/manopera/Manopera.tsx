import { useState } from 'react';
import { toast } from 'sonner';
import { manoperaCatalogMock, type ManoperaCatalogMock, type CategorieManopera } from '../../../mock/catalog';

type SortField = 'codManopera' | 'denumire' | 'durataStd';
type SortDir = 'asc' | 'desc';

export default function Manopera() {
  const [listaManopera, setListaManopera] = useState<ManoperaCatalogMock[]>(manoperaCatalogMock);
  const [arataFormular, setArataFormular] = useState(false);
  
  // Filtre și Sortare
  const [cautare, setCautare] = useState('');
  const [filtruCategorie, setFiltruCategorie] = useState<CategorieManopera | 'TOATE'>('TOATE');
  const [sortField, setSortField] = useState<SortField>('denumire');
  const [sortDir, setSortDir] = useState<SortDir>('asc');

  // Form State
  const [form, setForm] = useState<Partial<ManoperaCatalogMock>>({ categorie: 'Mecanică Ușoară' });

  const handleSort = (field: SortField) => {
    if (sortField === field) setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    else { setSortField(field); setSortDir('asc'); }
  };

  const listaFiltrata = listaManopera
    .filter(m => 
      (filtruCategorie === 'TOATE' || m.categorie === filtruCategorie) &&
      (m.codManopera.toLowerCase().includes(cautare.toLowerCase()) || 
       m.denumire.toLowerCase().includes(cautare.toLowerCase()))
    )
    .sort((a, b) => {
      let comparison = 0;
      if (sortField === 'codManopera') comparison = a.codManopera.localeCompare(b.codManopera);
      if (sortField === 'denumire') comparison = a.denumire.localeCompare(b.denumire);
      if (sortField === 'durataStd') comparison = a.durataStd - b.durataStd;
      return sortDir === 'asc' ? comparison : -comparison;
    });

  const handleSalvare = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.codManopera || !form.denumire || !form.durataStd) {
      toast.error('Completează toate câmpurile obligatorii.');
      return;
    }

    const nouaOp = { ...form, idManopera: Date.now() } as ManoperaCatalogMock;
    setListaManopera([nouaOp, ...listaManopera]);
    toast.success('Operațiunea a fost salvată în nomenclator.');
    setForm({ categorie: 'Mecanică Ușoară' });
    setArataFormular(false);
  };

  return (
    <div className="space-y-6 pb-10">
      {/* HEADER */}
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-2">
          <span className="inline-flex rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold uppercase tracking-[0.2em] text-emerald-700">Tarife și Timpi</span>
          <h2 className="text-3xl font-bold tracking-tight text-slate-800">Nomenclator Manoperă</h2>
          <p className="max-w-2xl text-sm text-slate-500">Administrează timpii tehnologici de reparație, structurați pe categorii de reparații.</p>
        </div>
        <div className="flex gap-4">
          <div className="flex flex-col px-4 border-r border-slate-200">
             <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Operațiuni</span>
             <span className="text-xl font-black text-slate-700">{listaManopera.length}</span>
          </div>
          <div className="flex flex-col pl-4">
             <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Medie Normă</span>
             <span className="text-xl font-black text-emerald-600">
                {(listaManopera.reduce((acc, i) => acc + i.durataStd, 0) / (listaManopera.length || 1)).toFixed(1)} ore
             </span>
          </div>
        </div>
      </div>

      {/* TOOLBAR */}
      <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="flex flex-1 flex-wrap gap-3 w-full">
          <input 
            type="text" placeholder="Caută operațiune sau cod..." value={cautare} onChange={e => setCautare(e.target.value)}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm w-full md:w-72 focus:ring-2 focus:ring-emerald-500 outline-none"
          />
          <select value={filtruCategorie} onChange={e => setFiltruCategorie(e.target.value as CategorieManopera | 'TOATE')} className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm focus:ring-2 focus:ring-emerald-500 outline-none">
            <option value="TOATE">Toate Categoriile</option>
            <option value="Mecanică Ușoară">Mecanică Ușoară</option>
            <option value="Mecanică Grea">Mecanică Grea</option>
            <option value="Diagnoză">Diagnoză</option>
            <option value="Electrică">Electrică</option>
            <option value="Tinichigerie">Tinichigerie</option>
          </select>
        </div>
        <button onClick={() => setArataFormular(!arataFormular)} className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2.5 rounded-xl font-bold shadow-md shadow-emerald-600/20 transition-all shrink-0">
          {arataFormular ? 'Închide Formularul' : '+ Adaugă Operațiune'}
        </button>
      </div>

      {/* FORMULAR ADĂUGARE */}
      {arataFormular && (
        <form onSubmit={handleSalvare} className="bg-white p-6 rounded-2xl shadow-xl shadow-slate-200/50 border border-emerald-100 animate-in fade-in slide-in-from-top-4">
          <h4 className="text-lg font-bold text-slate-800 mb-4 border-b border-slate-100 pb-3">Definire Normă de Lucru</h4>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">Cod Oper. *</label>
              <input type="text" required value={form.codManopera || ''} onChange={e => setForm({...form, codManopera: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 outline-none" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">Denumire Operațiune *</label>
              <input type="text" required value={form.denumire || ''} onChange={e => setForm({...form, denumire: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 outline-none" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">Categorie *</label>
              <select value={form.categorie} onChange={e => setForm({...form, categorie: e.target.value as CategorieManopera})} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 outline-none">
                <option value="Mecanică Ușoară">Mecanică Ușoară</option><option value="Mecanică Grea">Mecanică Grea</option><option value="Diagnoză">Diagnoză</option><option value="Electrică">Electrică</option><option value="Tinichigerie">Tinichigerie</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">Normă de Timp (Ore) *</label>
              <input type="number" step="0.1" required value={form.durataStd || ''} onChange={e => setForm({...form, durataStd: Number(e.target.value)})} placeholder="ex: 1.5" className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 outline-none" />
            </div>
          </div>
          <div className="mt-6 flex justify-end">
            <button type="submit" className="bg-slate-800 hover:bg-slate-900 text-white px-8 py-2.5 rounded-xl font-bold shadow-md transition-all">
              Salvează Tariful
            </button>
          </div>
        </form>
      )}

      {/* TABEL */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-slate-50 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-200">
            <tr>
              <th className="px-6 py-4 cursor-pointer hover:bg-slate-100 transition-colors w-48" onClick={() => handleSort('codManopera')}>Cod Normă</th>
              <th className="px-6 py-4 cursor-pointer hover:bg-slate-100 transition-colors" onClick={() => handleSort('denumire')}>Descriere Operațiune / Categorie</th>
              <th className="px-6 py-4 cursor-pointer hover:bg-slate-100 transition-colors text-right w-40" onClick={() => handleSort('durataStd')}>Durată Standard</th>
              <th className="px-6 py-4 text-center w-24">Acțiuni</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {listaFiltrata.map((item) => (
              <tr key={item.idManopera} className="hover:bg-slate-50/80 transition-colors group">
                <td className="px-6 py-4">
                  <span className="font-mono text-xs bg-slate-100 text-slate-700 px-2 py-1 rounded font-bold border border-slate-200">{item.codManopera}</span>
                </td>
                <td className="px-6 py-4">
                  <p className="font-bold text-slate-800 text-[13px]">{item.denumire}</p>
                  <p className="text-xs text-slate-500 mt-1">{item.categorie}</p>
                </td>
                <td className="px-6 py-4 text-right">
                  <p className="font-bold text-emerald-700 text-base">{item.durataStd.toFixed(1)} h</p>
                </td>
                <td className="px-6 py-4 text-center">
                  <button className="text-emerald-600 hover:text-emerald-800 text-sm font-semibold opacity-0 group-hover:opacity-100 transition-opacity">Editează</button>
                </td>
              </tr>
            ))}
            {listaFiltrata.length === 0 && (
               <tr><td colSpan={4} className="px-6 py-12 text-center text-slate-500 bg-slate-50 border-dashed border-2 border-slate-200">Nu am găsit operațiuni conform căutării.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}