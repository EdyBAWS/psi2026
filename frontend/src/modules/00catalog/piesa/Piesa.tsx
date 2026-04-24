// src/modules/00catalog/piese/Piesa.tsx
//
// Componentă de prezentare pură — toată logica se află în usePiesa.ts.
// Aliniată la schema DB (Single Table cu discriminant tipPiesa).
// Câmpurile condiționale luniGarantie / gradUzura se afișează doar
// în funcție de tipul piesei selectat.

import { Package, PenLine, Trash2, ArrowUpDown } from 'lucide-react';
import { useState } from 'react';
import { Button } from '../../../componente/ui/Button';
import { ConfirmDialog } from '../../../componente/ui/ConfirmDialog';
import { EmptyState } from '../../../componente/ui/EmptyState';
import { Field } from '../../../componente/ui/Field';
import { PageHeader } from '../../../componente/ui/PageHeader';
import { SelectField } from '../../../componente/ui/SelectField';
import { StatCard } from '../../../componente/ui/StatCard';
import { type CategoriePiesa, type TipPiesaCatalogMock } from '../../../mock/catalog';
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

// Badge stoc cu praguri vizuale (epuizat / critic / normal).
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
    editId,
    arataFormular,
    cautare,
    setCautare,
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
  } = usePiesa();

  const [confirmSterge, setConfirmSterge] = useState<number | null>(null);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24 text-slate-400">
        Se încarcă nomenclatorul de piese...
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-10">
      {/* ── HEADER ─────────────────────────────────────────────────────────── */}
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
        <PageHeader
          title="Nomenclator Produse și Stoc"
          description="Gestionează inventarul de piese noi și SH, prețurile de bază și cantitățile disponibile."
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
          <StatCard label="Stoc Epuizat" value={stocEpuizat} tone="danger" />
          {stocCritic > 0 && (
            <StatCard label="Stoc Critic (<5)" value={stocCritic} tone="warning" />
          )}
        </div>
      </div>

      {/* ── TOOLBAR ─────────────────────────────────────────────────────────── */}
      <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 flex flex-col md:flex-row gap-4 items-end">
        <Field
          label="Caută piesă"
          placeholder="Cod, denumire sau producător..."
          value={cautare}
          onChange={(e) => setCautare(e.target.value)}
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
            setFiltruTip(e.target.value as TipPiesaCatalogMock | 'TOATE')
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
          onSubmit={handleSalvare}
          className="bg-white p-6 rounded-2xl shadow-xl shadow-slate-200/50 border border-indigo-100 animate-in fade-in slide-in-from-top-4"
        >
          <h4 className="text-lg font-bold text-slate-800 mb-4 border-b border-slate-100 pb-3">
            {editId !== null ? 'Editare Articol' : 'Adăugare Articol Nou'}
          </h4>

          {/* Câmpuri comune (întotdeauna vizibile) */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
            <Field
              label="Cod Piesă *"
              value={form.codPiesa ?? ''}
              onChange={(e) => setForm({ ...form, codPiesa: e.target.value })}
              placeholder="ex: FIL-UL-BOSCH"
              required
            />
            <Field
              label="Denumire Piesă *"
              value={form.denumire ?? ''}
              onChange={(e) => setForm({ ...form, denumire: e.target.value })}
              placeholder="ex: Filtru Ulei"
              wrapperClassName="md:col-span-2"
              required
            />
            <Field
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
              label="Preț Bază (RON) *"
              type="number"
              step="0.01"
              min="0"
              value={form.pretBaza ?? ''}
              onChange={(e) =>
                setForm({ ...form, pretBaza: Number(e.target.value) })
              }
              placeholder="ex: 145.00"
              required
            />
            <Field
              label="Stoc Inițial (Buc)"
              type="number"
              min="0"
              value={form.stoc ?? 0}
              onChange={(e) =>
                setForm({ ...form, stoc: Number(e.target.value) })
              }
            />

            {/* Discriminant tipPiesa — aliniat cu Single Table din schema DB */}
            <SelectField
              label="Tip Piesă (discriminant) *"
              value={form.tip ?? 'NOUA'}
              onChange={(e) => {
                const tip = e.target.value as TipPiesaCatalogMock;
                // Curățăm câmpul care nu mai e relevant la schimbare de tip.
                setForm({
                  ...form,
                  tip,
                  luniGarantie: tip === 'NOUA' ? form.luniGarantie : undefined,
                  gradUzura: tip === 'SH' ? form.gradUzura : undefined,
                });
              }}
              options={[
                { label: 'Nouă', value: 'NOUA' },
                { label: 'Second Hand (SH)', value: 'SH' },
              ]}
            />
          </div>

          {/* Câmpuri condiționale — afișate în funcție de tipPiesa */}
          {form.tip === 'NOUA' && (
            <div className="mt-5 pt-5 border-t border-slate-100">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-3">
                Atribute specifice — Piesă Nouă
              </p>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
                <Field
                  label="Garanție (Luni) *"
                  type="number"
                  min="1"
                  value={form.luniGarantie ?? ''}
                  onChange={(e) =>
                    setForm({ ...form, luniGarantie: Number(e.target.value) })
                  }
                  placeholder="ex: 12"
                  hint="Obligatoriu pentru piese noi (schema DB)"
                  required
                />
              </div>
            </div>
          )}
          {form.tip === 'SH' && (
            <div className="mt-5 pt-5 border-t border-slate-100">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-3">
                Atribute specifice — Piesă Second Hand
              </p>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
                <Field
                  label="Grad Uzură *"
                  value={form.gradUzura ?? ''}
                  onChange={(e) =>
                    setForm({ ...form, gradUzura: e.target.value })
                  }
                  placeholder="ex: Ușor uzat, testat"
                  hint="Obligatoriu pentru piese SH (schema DB)"
                  wrapperClassName="md:col-span-2"
                  required
                />
              </div>
            </div>
          )}

          <div className="mt-6 flex justify-end gap-3">
            <Button variant="outline" type="button" onClick={handleInchideFormular}>
              Anulează
            </Button>
            <Button variant="primary" type="submit">
              {editId !== null ? 'Salvează Modificările' : 'Adaugă Articolul'}
            </Button>
          </div>
        </form>
      )}

      {/* ── TABEL ───────────────────────────────────────────────────────────── */}
      {pieseFiltrate.length === 0 ? (
        <EmptyState
          icon={<Package className="h-5 w-5" />}
          title="Nu au fost găsite piese"
          description="Modifică filtrele sau adaugă o piesă nouă în nomenclator."
          actionLabel="+ Adaugă Piesă"
          onAction={handleDeschideAdaugare}
        />
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-slate-50 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-200">
                <tr>
                  <th
                    className="px-6 py-4 cursor-pointer hover:bg-slate-100 transition-colors"
                    onClick={() => handleSort('codPiesa')}
                  >
                    Cod / Categorie{' '}
                    <SortIndicator field="codPiesa" activeField={sortField} dir={sortDir} />
                  </th>
                  <th
                    className="px-6 py-4 cursor-pointer hover:bg-slate-100 transition-colors"
                    onClick={() => handleSort('denumire')}
                  >
                    Denumire / Producător{' '}
                    <SortIndicator field="denumire" activeField={sortField} dir={sortDir} />
                  </th>
                  <th className="px-6 py-4 text-center">Tip</th>
                  <th
                    className="px-6 py-4 cursor-pointer hover:bg-slate-100 transition-colors text-center"
                    onClick={() => handleSort('stoc')}
                  >
                    Stoc{' '}
                    <SortIndicator field="stoc" activeField={sortField} dir={sortDir} />
                  </th>
                  <th
                    className="px-6 py-4 cursor-pointer hover:bg-slate-100 transition-colors text-right"
                    onClick={() => handleSort('pretBaza')}
                  >
                    Preț Vânzare{' '}
                    <SortIndicator field="pretBaza" activeField={sortField} dir={sortDir} />
                  </th>
                  <th className="px-6 py-4 text-center w-28">Acțiuni</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {pieseFiltrate.map((piesa) => (
                  <tr
                    key={piesa.idPiesa}
                    className="hover:bg-slate-50/80 transition-colors group"
                  >
                    <td className="px-6 py-4">
                      <p className="font-bold text-slate-800 font-mono text-xs bg-slate-100 inline-block px-2 py-1 rounded">
                        {piesa.codPiesa}
                      </p>
                      <p className="text-xs text-slate-500 mt-1.5 font-medium">
                        {piesa.categorie}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-bold text-slate-800 text-[13px]">{piesa.denumire}</p>
                      <p className="text-xs text-slate-500 mt-1">{piesa.producator}</p>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span
                        className={`px-2 py-1 rounded text-[10px] font-bold tracking-wider ${
                          piesa.tip === 'NOUA'
                            ? 'bg-indigo-50 text-indigo-700'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {piesa.tip === 'NOUA'
                          ? `NOUĂ ${piesa.luniGarantie ? `(${piesa.luniGarantie}L)` : ''}`
                          : 'SH'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <StocBadge stoc={piesa.stoc} />
                    </td>
                    <td className="px-6 py-4 text-right">
                      <p className="font-bold text-slate-800 text-base">
                        {piesa.pretBaza.toFixed(2)}
                      </p>
                      <p className="text-[10px] font-semibold text-slate-400 uppercase">
                        RON / buc
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditeaza(piesa)}
                          title="Editează"
                        >
                          <PenLine className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setConfirmSterge(piesa.idPiesa)}
                          title="Șterge"
                          className="text-rose-500 hover:text-rose-700 hover:bg-rose-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="px-6 py-3 border-t border-slate-100 text-xs text-slate-400">
            {pieseFiltrate.length} din {piese.length} piese afișate
          </div>
        </div>
      )}

      {/* ── CONFIRMARE ȘTERGERE ─────────────────────────────────────────────── */}
      <ConfirmDialog
        isOpen={confirmSterge !== null}
        title="Ștergi piesa din nomenclator?"
        description="Această acțiune este ireversibilă. Piesa va fi eliminată și nu va mai putea fi selectată pe comenzile noi."
        confirmLabel="Da, șterge"
        onConfirm={() => {
          if (confirmSterge !== null) handleSterge(confirmSterge);
          setConfirmSterge(null);
        }}
        onCancel={() => setConfirmSterge(null)}
      />
    </div>
  );
}