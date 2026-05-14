// src/modules/00catalog/piese/Piesa.tsx
import { PenLine, Trash2, ArrowUpDown, History, X, Loader2, ClipboardList } from 'lucide-react';
import { useState } from 'react';
import { Button } from '../../../componente/ui/Button';
import { ConfirmDialog } from '../../../componente/ui/ConfirmDialog';
import { Field } from '../../../componente/ui/Field';
import { PageHeader } from '../../../componente/ui/PageHeader';
import { SelectField } from '../../../componente/ui/SelectField';
import { StatCard } from '../../../componente/ui/StatCard';
import { 
  type TipPiesaCatalog,
  type CategoriePiesa,
} from '../../../types/catalog';
import { usePiesa, type SortFieldPiesa } from './usePiesa';

const CATEGORII_PIESA: { label: string; value: CategoriePiesa }[] = [
  { label: 'Filtre', value: 'Filtre' },
  { label: 'Frânare', value: 'Frânare' },
  { label: 'Motor & Distribuție', value: 'Motor & Distribuție' },
  { label: 'Electrice', value: 'Electrice' },
  { label: 'Suspensie & Direcție', value: 'Suspensie & Direcție' },
  { label: 'Climatizare', value: 'Climatizare' },
  { label: 'Altele', value: 'Altele' },
];

function SortIndicator({
  field,
  activeField,
  dir,
}: {
  field: SortFieldPiesa;
  activeField: SortFieldPiesa;
  dir: 'asc' | 'desc';
}) {
  if (field !== activeField)
    return <ArrowUpDown className="inline ml-1 h-3 w-3 opacity-30" />;
  return (
    <span className="inline ml-1 text-indigo-600 font-bold text-xs">
      {dir === 'asc' ? '↑' : '↓'}
    </span>
  );
}

function StocBadge({ stoc }: { stoc: number }) {
  if (stoc === 0)
    return (
      <span className="bg-rose-50 text-rose-700 px-2.5 py-1 rounded-md text-xs font-bold border border-rose-200">
        Epuizat
      </span>
    );
  if (stoc < 5)
    return (
      <span className="bg-amber-50 text-amber-700 px-2.5 py-1 rounded-md text-xs font-bold border border-amber-200">
        {stoc} buc (Critic)
      </span>
    );
  return (
    <span className="bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-md text-xs font-bold border border-emerald-200">
      {stoc} buc
    </span>
  );
}

export default function Piesa() {
  const {
    piese,
    pieseFiltrate,
    loading,
    valoareStoc,
    stocEpuizat,
    stocCritic,
    form,
    setForm,
    editareId,
    arataFormular,
    termenCautare,
    setTermenCautare,
    filtruTip,
    setFiltruTip,
    filtruCategorie,
    setFiltruCategorie,
    sortField,
    sortDir,
    handleSort,
    handleSalvare,
    handleEditeaza,
    handleSterge,
    handleDeschideAdaugare,
    handleInchideFormular,
    istoricCurent,
    setIstoricCurent,
    handleVeziIstoric
  } = usePiesa();

  const [confirmSterge, setConfirmSterge] = useState<number | null>(null);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-slate-400 gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
        <p>Se încarcă nomenclatorul...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-10">
      {/* ── HEADER ─────────────────────────────────────────────────────────── */}
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
          <svg xmlns="http://www.w3.org/2000/svg" width="256" height="256" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-indigo-900"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
        </div>
        <div className="relative z-10">
        <PageHeader
          title="Nomenclator Produse și Stoc"
          description="Gestionează inventarul. Piesele utilizate în reparații nu pot fi șterse pentru a păstra istoricul."
          actions={
            <Button
              variant="primary"
              onClick={arataFormular ? handleInchideFormular : handleDeschideAdaugare}
            >
              {arataFormular ? 'Închide Formularul' : '+ Adaugă Piesă'}
            </Button>
          }
        />
        <div className="flex flex-wrap gap-3 mt-2">
          <StatCard label="Total Piese" value={piese.length} />
          <StatCard
            label="Valoare Stoc"
            value={`${valoareStoc.toLocaleString('ro-RO')} RON`}
            tone="info"
          />
          {stocCritic > 0 && (
            <StatCard label="Stoc Critic (<5)" value={stocCritic} tone="warning" />
          )}
          <StatCard label="Stoc Epuizat" value={stocEpuizat} tone="danger" />

        </div>
        </div>
      </div>

      {/* ── TOOLBAR ─────────────────────────────────────────────────────────── */}
      <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 flex flex-col md:flex-row gap-4 items-end">
        <Field
          label="Caută piesă"
          placeholder="Cod, denumire sau producător..."
          value={termenCautare}
          onChange={(e) => setTermenCautare(e.target.value)}
          wrapperClassName="flex-1 min-w-[200px]"
        />
        <SelectField
          label="Categorie"
          value={filtruCategorie}
          onChange={(e) =>
            setFiltruCategorie(e.target.value as CategoriePiesa | 'TOATE')
          }
          options={[
            { label: 'Toate Categoriile', value: 'TOATE' },
            ...CATEGORII_PIESA,
          ]}
          wrapperClassName="min-w-[180px]"
        />
        <SelectField
          label="Stare"
          value={filtruTip}
          onChange={(e) =>
            setFiltruTip(e.target.value as TipPiesaCatalog | 'TOATE')
          }
          options={[
            { label: 'Toate Stările', value: 'TOATE' },
            { label: 'Nouă', value: 'NOUA' },
            { label: 'Second Hand', value: 'SH' },
          ]}
          wrapperClassName="min-w-[150px]"
        />
      </div>

      {/* ── FORMULAR ADĂUGARE / EDITARE ──────────────────────────────────────── */}
      {arataFormular && (
        <form
          id="form-piesa"
          onSubmit={handleSalvare}
          className="bg-white p-6 rounded-2xl shadow-xl shadow-slate-200/50 border border-indigo-100 animate-in fade-in slide-in-from-top-4"
        >
          <h4 className="text-lg font-bold text-slate-800 mb-4 border-b border-slate-100 pb-3">
            {editareId !== null ? 'Editare Articol' : 'Adăugare Articol Nou'}
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
            <Field
              id="input-cod-piesa"
              label="Cod Piesă *"
              value={form.codPiesa ?? ''}
              onChange={(e) => setForm({ ...form, codPiesa: e.target.value })}
              placeholder="ex: FIL-UL-BOSCH"
              required
            />
            <Field
              id="input-denumire-piesa"
              label="Denumire Piesă *"
              value={form.denumire ?? ''}
              onChange={(e) => setForm({ ...form, denumire: e.target.value })}
              placeholder="ex: Filtru Ulei"
              wrapperClassName="md:col-span-2"
              required
            />
            <Field
              id="input-producator-piesa"
              label="Producător *"
              value={form.producator ?? ''}
              onChange={(e) => setForm({ ...form, producator: e.target.value })}
              placeholder="ex: Bosch"
              required
            />
            <SelectField
              label="Categorie"
              value={form.categorie ?? 'Altele'}
              onChange={(e) =>
                setForm({ ...form, categorie: e.target.value as CategoriePiesa })
              }
              options={CATEGORII_PIESA}
            />
            <Field
              id="input-pret-baza"
              label="Preț Bază (RON) *"
              type="number"
              step="0.01"
              value={form.pretBaza ?? ''}
              onChange={(e) => setForm({ ...form, pretBaza: Number(e.target.value) })}
              required
            />
            <Field
              id="input-stoc"
              label="Stoc"
              type="number"
              value={form.stoc ?? 0}
              onChange={(e) => setForm({ ...form, stoc: Number(e.target.value) })}
            />
            <SelectField
              label="Tip Piesă *"
              value={form.tip ?? 'NOUA'}
              onChange={(e) => setForm({ ...form, tip: e.target.value as any })}
              options={[{ label: 'Nouă', value: 'NOUA' }, { label: 'SH', value: 'SH' }]}
            />
          </div>

          {form.tip === 'NOUA' && (
            <div className="mt-5 pt-5 border-t border-slate-100">
              <Field
                label="Garanție (Luni) *"
                type="number"
                value={form.luniGarantie ?? ''}
                onChange={(e) => setForm({ ...form, luniGarantie: Number(e.target.value) })}
                required
              />
            </div>
          )}

          {form.tip === 'SH' && (
            <div className="mt-5 pt-5 border-t border-slate-100">
              <Field
                label="Grad Uzură *"
                value={form.gradUzura ?? ''}
                onChange={(e) => setForm({ ...form, gradUzura: e.target.value })}
                required
              />
            </div>
          )}

          <div className="mt-6 flex justify-end gap-3">
            <Button variant="outline" type="button" onClick={handleInchideFormular}>Anulează</Button>
            <Button variant="primary" type="submit">{editareId !== null ? 'Salvează' : 'Adaugă'}</Button>
          </div>
        </form>
      )}

      {/* ── TABEL ───────────────────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-slate-50 text-[10px] font-bold uppercase text-slate-400 border-b">
            <tr>
              <th className="px-6 py-4" onClick={() => handleSort('codPiesa')}>Cod / Categorie <SortIndicator field="codPiesa" activeField={sortField} dir={sortDir} /></th>
              <th className="px-6 py-4" onClick={() => handleSort('denumire')}>Denumire <SortIndicator field="denumire" activeField={sortField} dir={sortDir} /></th>
              <th className="px-6 py-4 text-center">Stoc</th>
              <th className="px-6 py-4 text-right" onClick={() => handleSort('pretBaza')}>Preț <SortIndicator field="pretBaza" activeField={sortField} dir={sortDir} /></th>
              <th className="px-6 py-4 text-center w-40">Acțiuni</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {pieseFiltrate.map((piesa) => (
              <tr key={piesa.idPiesa} className="hover:bg-slate-50 transition-colors group">
                <td className="px-6 py-4">
                  <p className="font-mono text-xs font-bold bg-slate-100 px-2 py-1 rounded inline-block">{piesa.codPiesa}</p>
                  <p className="text-[10px] text-slate-400 mt-1 uppercase font-semibold">{piesa.categorie}</p>
                </td>
                <td className="px-6 py-4">
                  <p className="font-bold text-slate-800">{piesa.denumire}</p>
                  <p className="text-xs text-slate-500">{piesa.producator}</p>
                </td>
                <td className="px-6 py-4 text-center"><StocBadge stoc={piesa.stoc} /></td>
                <td className="px-6 py-4 text-right font-bold text-indigo-700">{piesa.pretBaza.toFixed(2)} RON</td>
                <td className="px-6 py-4">
                  <div className="flex justify-center gap-1">
                    <Button variant="ghost" size="sm" onClick={() => handleVeziIstoric(piesa.idPiesa)} title="Vezi Consum">
                      <History className={`h-4 w-4 ${istoricCurent && istoricCurent[0]?.idPiesa === piesa.idPiesa ? 'text-indigo-600' : ''}`} />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleEditeaza(piesa)}><PenLine className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="sm" className="text-rose-500" onClick={() => setConfirmSterge(piesa.idPiesa)}><Trash2 className="h-4 w-4" /></Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ── MODAL ISTORIC CONSUM ─────────────────────────────────────────── */}
      {istoricCurent && (
        <div className="global-overlay animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="bg-indigo-600 px-8 py-6 text-white flex justify-between items-center">
              <div className="flex items-center gap-3">
                <History className="h-6 w-6" />
                <div>
                  <h5 className="text-lg font-black tracking-tight uppercase">Istoric Consum Articol</h5>
                  <p className="text-xs text-indigo-100 font-bold opacity-80">{piese.find(p => p.idPiesa === (istoricCurent[0]?.idPiesa || istoricCurent[0]?.catalogId))?.denumire || "Articol"}</p>
                </div>
              </div>
              <button 
                onClick={() => setIstoricCurent(null)} 
                className="h-10 w-10 flex items-center justify-center rounded-xl bg-white/10 hover:bg-white/20 transition-all"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="p-8 max-h-[60vh] overflow-y-auto custom-scrollbar bg-slate-50">
              {istoricCurent.length === 0 ? (
                <div className="py-20 text-center space-y-4">
                  <div className="h-16 w-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-300">
                    <History className="h-8 w-8" />
                  </div>
                  <p className="text-slate-500 font-bold text-sm">Această piesă nu a fost utilizată încă în nicio reparație.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4">
                  {istoricCurent.map((it: any) => (
                    <div key={it.id} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between group hover:border-indigo-200 transition-all">
                      <div className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-xl bg-slate-50 text-slate-400 flex items-center justify-center group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                          <ClipboardList className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="text-xs font-black text-indigo-600 uppercase tracking-wider">Comanda #{it.idComanda}</p>
                          <p className="text-sm font-bold text-slate-700 mt-0.5">{it.numeAngajat || "Tehnician Alocat"}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-black text-slate-900">{it.cantitate} buc</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase mt-0.5">{new Date(it.dataComanda).toLocaleDateString('ro-RO')}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="bg-white px-8 py-6 border-t border-slate-100 flex justify-end">
              <Button variant="primary" onClick={() => setIstoricCurent(null)} className="px-8 rounded-xl">Închide</Button>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog
        isOpen={confirmSterge !== null}
        title="Ștergi piesa definitiv?"
        description="Atenție: Dacă piesa a fost deja facturată sau adăugată pe o comandă, sistemul va bloca ștergerea pentru a evita erori contabile."
        onConfirm={() => { if (confirmSterge) handleSterge(confirmSterge); setConfirmSterge(null); }}
        onCancel={() => setConfirmSterge(null)}
      />
    </div>
  );
}

