import { useState } from 'react';
import { toast } from 'sonner';
import { pieseCatalogMock, type PiesaCatalogMock, type TipPiesaCatalogMock, type CategoriePiesa } from '../../../mock/catalog';

type SortField = 'codPiesa' | 'denumire' | 'pretBaza' | 'stoc';
type SortDir = 'asc' | 'desc';

export default function Piesa() {
  const [piese, setPiese] = useState<PiesaCatalogMock[]>(pieseCatalogMock);
  const [arataFormular, setArataFormular] = useState(false);
  
  // Filtre și Sortare
  const [cautare, setCautare] = useState('');
  const [filtruTip, setFiltruTip] = useState<TipPiesaCatalogMock | 'TOATE'>('TOATE');
  const [filtruCategorie, setFiltruCategorie] = useState<CategoriePiesa | 'TOATE'>('TOATE');
  const [sortField, setSortField] = useState<SortField>('denumire');
  const [sortDir, setSortDir] = useState<SortDir>('asc');

  // Form State
  const [form, setForm] = useState<Partial<PiesaCatalogMock>>({ tip: 'NOUA', categorie: 'Altele', stoc: 0 });

  const valoareStoc = piese.reduce((acc, p) => acc + (p.pretBaza * p.stoc), 0);
  const stocEpuizat = piese.filter(p => p.stoc === 0).length;

  const handleSort = (field: SortField) => {
    if (sortField === field) setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    else { setSortField(field); setSortDir('asc'); }
  };

  const pieseFiltrate = piese
    .filter(p => 
      (filtruTip === 'TOATE' || p.tip === filtruTip) &&
      (filtruCategorie === 'TOATE' || p.categorie === filtruCategorie) &&
      (p.codPiesa.toLowerCase().includes(cautare.toLowerCase()) || 
       p.denumire.toLowerCase().includes(cautare.toLowerCase()) ||
       p.producator.toLowerCase().includes(cautare.toLowerCase()))
    )
    .sort((a, b) => {
      let comparison = 0;
      if (sortField === 'codPiesa') comparison = a.codPiesa.localeCompare(b.codPiesa);
      if (sortField === 'denumire') comparison = a.denumire.localeCompare(b.denumire);
      if (sortField === 'pretBaza') comparison = a.pretBaza - b.pretBaza;
      if (sortField === 'stoc') comparison = a.stoc - b.stoc;
      return sortDir === 'asc' ? comparison : -comparison;
    });

  const handleSalvare = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.codPiesa || !form.denumire || !form.producator || form.pretBaza === undefined) {
      toast.error('Completează câmpurile obligatorii (Cod, Denumire, Producător, Preț).');
      return;
    }

    const nouaPiesa = { ...form, idPiesa: Date.now() } as PiesaCatalogMock;
    setPiese([nouaPiesa, ...piese]);
    toast.success('Piesa a fost adăugată în nomenclator.');
    setForm({ tip: 'NOUA', categorie: 'Altele', stoc: 0 });
    setArataFormular(false);
  };

  const renderStocBadge = (stoc: number) => {
    if (stoc === 0) return <span className="bg-rose-50 text-rose-700 px-2.5 py-1 rounded-md text-xs font-bold border border-rose-200">Epuizat</span>;
    if (stoc < 5) return <span className="bg-amber-50 text-amber-700 px-2.5 py-1 rounded-md text-xs font-bold border border-amber-200">{stoc} buc (Critic)</span>;
    return <span className="bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-md text-xs font-bold border border-emerald-200">{stoc} buc</span>;
  };

  return (
    <div className="space-y-6 pb-10">
      {/* HEADER */}
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-2">
          <span className="inline-flex rounded-full bg-indigo-50 px-3 py-1 text-xs font-bold uppercase tracking-[0.2em] text-indigo-700">Catalog Piese Auto</span>
          <h2 className="text-3xl font-bold tracking-tight text-slate-800">Nomenclator Produse și Stoc</h2>
          <p className="max-w-2xl text-sm text-slate-500">Gestionează inventarul de piese noi și SH, prețurile de bază și cantitățile disponibile.</p>
        </div>
        <div className="flex gap-4">
          <div className="flex flex-col px-4 border-r border-slate-200">
             <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Piese</span>
             <span className="text-xl font-black text-slate-700">{piese.length}</span>
          </div>
          <div className="flex flex-col px-4 border-r border-slate-200">
             <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Valoare Stoc</span>
             <span className="text-xl font-black text-indigo-600">{valoareStoc.toLocaleString('ro-RO')} RON</span>
          </div>
          <div className="flex flex-col pl-4">
             <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Stoc Epuizat</span>
             <span className="text-xl font-black text-rose-600">{stocEpuizat}</span>
          </div>
        </div>
      </div>

      {/* TOOLBAR (Filtre + Buton Adaugă) */}
      <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="flex flex-1 flex-wrap gap-3 w-full">
          <input 
            type="text" placeholder="Caută cod, denumire, producător..." value={cautare} onChange={e => setCautare(e.target.value)}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm w-full md:w-72 focus:ring-2 focus:ring-indigo-500 outline-none"
          />
          <select value={filtruCategorie} onChange={e => setFiltruCategorie(e.target.value as CategoriePiesa | 'TOATE')} className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 outline-none">
            <option value="TOATE">Toate Categoriile</option>
            <option value="Filtre">Filtre</option>
            <option value="Frânare">Frânare</option>
            <option value="Electrice">Electrice</option>
            <option value="Climatizare">Climatizare</option>
          </select>
          <select value={filtruTip} onChange={e => setFiltruTip(e.target.value as TipPiesaCatalogMock | 'TOATE')} className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 outline-none">
            <option value="TOATE">Stare: Toate</option>
            <option value="NOUA">Nouă</option>
            <option value="SH">Second Hand</option>
          </select>
        </div>
        <button onClick={() => setArataFormular(!arataFormular)} className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-xl font-bold shadow-md shadow-indigo-600/20 transition-all shrink-0">
          {arataFormular ? 'Închide Formularul' : '+ Adaugă Piesă'}
        </button>
      </div>

      {/* FORMULAR ADĂUGARE (Apare doar dacă arataFormular e true) */}
      {arataFormular && (
        <form onSubmit={handleSalvare} className="bg-white p-6 rounded-2xl shadow-xl shadow-slate-200/50 border border-indigo-100 animate-in fade-in slide-in-from-top-4">
          <h4 className="text-lg font-bold text-slate-800 mb-4 border-b border-slate-100 pb-3">Adăugare Articol Nou</h4>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">Cod Piesă *</label>
              <input type="text" required value={form.codPiesa || ''} onChange={e => setForm({...form, codPiesa: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">Denumire Piesă *</label>
              <input type="text" required value={form.denumire || ''} onChange={e => setForm({...form, denumire: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">Producător *</label>
              <input type="text" required value={form.producator || ''} onChange={e => setForm({...form, producator: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none" />
            </div>
            
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">Categorie</label>
              <select value={form.categorie} onChange={e => setForm({...form, categorie: e.target.value as CategoriePiesa})} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none">
                <option value="Filtre">Filtre</option><option value="Frânare">Frânare</option><option value="Electrice">Electrice</option><option value="Altele">Altele</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">Stoc Inițial (Buc)</label>
              <input type="number" required value={form.stoc || 0} onChange={e => setForm({...form, stoc: Number(e.target.value)})} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">Preț Bază (RON) *</label>
              <input type="number" step="0.01" required value={form.pretBaza || ''} onChange={e => setForm({...form, pretBaza: Number(e.target.value)})} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">Stare</label>
              <select value={form.tip} onChange={e => setForm({...form, tip: e.target.value as TipPiesaCatalogMock})} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none">
                <option value="NOUA">Nouă</option><option value="SH">Second Hand</option>
              </select>
            </div>
          </div>
          <div className="mt-6 flex justify-end">
            <button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-2.5 rounded-xl font-bold shadow-md shadow-emerald-600/20 transition-all">
              Salvează Articolul
            </button>
          </div>
        </form>
      )}

      {/* TABEL */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-slate-50 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 cursor-pointer hover:bg-slate-100 transition-colors" onClick={() => handleSort('codPiesa')}>Cod / Categorie</th>
                <th className="px-6 py-4 cursor-pointer hover:bg-slate-100 transition-colors" onClick={() => handleSort('denumire')}>Denumire / Producător</th>
                <th className="px-6 py-4 text-center">Stare</th>
                <th className="px-6 py-4 cursor-pointer hover:bg-slate-100 transition-colors text-center" onClick={() => handleSort('stoc')}>Stoc Disponibil</th>
                <th className="px-6 py-4 cursor-pointer hover:bg-slate-100 transition-colors text-right" onClick={() => handleSort('pretBaza')}>Preț Vânzare</th>
                <th className="px-6 py-4 text-center">Acțiuni</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {pieseFiltrate.map((piesa) => (
                <tr key={piesa.idPiesa} className="hover:bg-slate-50/80 transition-colors group">
                  <td className="px-6 py-4">
                    <p className="font-bold text-slate-800 font-mono text-xs bg-slate-100 inline-block px-2 py-1 rounded">{piesa.codPiesa}</p>
                    <p className="text-xs text-slate-500 mt-1.5 font-medium">{piesa.categorie}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-bold text-slate-800 text-[13px]">{piesa.denumire}</p>
                    <p className="text-xs text-slate-500 mt-1">{piesa.producator}</p>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={`px-2 py-1 rounded text-[10px] font-bold tracking-wider ${piesa.tip === 'NOUA' ? 'bg-indigo-50 text-indigo-700' : 'bg-slate-100 text-slate-600'}`}>
                      {piesa.tip === 'NOUA' ? `NOUĂ (${piesa.luniGarantie}L)` : 'SH'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    {renderStocBadge(piesa.stoc)}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <p className="font-bold text-slate-800 text-base">{piesa.pretBaza.toFixed(2)}</p>
                    <p className="text-[10px] font-semibold text-slate-400 uppercase">RON / buc</p>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <button className="text-indigo-600 hover:text-indigo-800 text-sm font-semibold opacity-0 group-hover:opacity-100 transition-opacity">Editează</button>
                  </td>
                </tr>
              ))}
              {pieseFiltrate.length === 0 && (
                 <tr><td colSpan={6} className="px-6 py-12 text-center text-slate-500 bg-slate-50 border-dashed border-2 border-slate-200">Nu a fost găsită nicio piesă conform filtrelor aplicate.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
