// src/modules/00catalog/manopera/Manopera.tsx
//
// Componentă de prezentare pură — toată logica se află în useManopera.ts.
// Folosește componentele UI standardizate (Field, SelectField, Button etc.)
// pentru consistență cu restul aplicației.

import { ArrowUpDown, Clock, PenLine, Trash2 } from 'lucide-react';
import { Button } from '../../../componente/ui/Button';
import { ConfirmDialog } from '../../../componente/ui/ConfirmDialog';
import { EmptyState } from '../../../componente/ui/EmptyState';
import { Field } from '../../../componente/ui/Field';
import { PageHeader } from '../../../componente/ui/PageHeader';
import { SelectField } from '../../../componente/ui/SelectField';
import { StatCard } from '../../../componente/ui/StatCard';
import { type CategorieManopera } from '../../../mock/catalog';
import { useManopera, type SortFieldManopera } from './useManopera';
import { useState } from 'react';

// Opțiunile de categorie centralizate — sincronizate cu enum-ul din catalog.ts
const CATEGORII_MANOPERA: { label: string; value: CategorieManopera }[] = [
  { label: 'Mecanică Ușoară', value: 'Mecanică Ușoară' },
  { label: 'Mecanică Grea', value: 'Mecanică Grea' },
  { label: 'Diagnoză', value: 'Diagnoză' },
  { label: 'Electrică', value: 'Electrică' },
  { label: 'Tinichigerie', value: 'Tinichigerie' },
];

// Indicator vizual pentru coloana sortată activ.
function SortIndicator({
  field,
  activeField,
  dir,
}: {
  field: SortFieldManopera;
  activeField: SortFieldManopera;
  dir: 'asc' | 'desc';
}) {
  if (field !== activeField)
    return <ArrowUpDown className="inline ml-1 h-3 w-3 opacity-30" />;
  return (
    <span className="inline ml-1 text-emerald-600 font-bold text-xs">
      {dir === 'asc' ? '↑' : '↓'}
    </span>
  );
}

export default function Manopera() {
  const {
    lista,
    listaFiltrata,
    loading,
    mediaNorma,
    form,
    setForm,
    editId,
    arataFormular,
    cautare,
    setCautare,
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
  } = useManopera();

  // Confirmarea ștergerii este gestionată local în componentă (UI concern).
  const [confirmSterge, setConfirmSterge] = useState<number | null>(null);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24 text-slate-400">
        Se încarcă nomenclatorul...
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-10">
      {/* ── HEADER ─────────────────────────────────────────────────────────── */}
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
        <PageHeader
          title="Nomenclator Manoperă"
          description="Administrează timpii tehnologici de reparație, structurați pe categorii de reparații."
          actions={
            <Button onClick={arataFormular ? handleInchideFormular : handleDeschideAdaugare}>
              {arataFormular ? 'Închide Formularul' : '+ Adaugă Operațiune'}
            </Button>
          }
        />
        <div className="flex gap-4 mt-2">
          <StatCard label="Total Operațiuni" value={lista.length} />
          <StatCard
            label="Medie Normă"
            value={`${mediaNorma.toFixed(1)} ore`}
            tone="success"
          />
        </div>
      </div>

      {/* ── TOOLBAR ─────────────────────────────────────────────────────────── */}
      <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 flex flex-col md:flex-row gap-4 items-end">
        <Field
          label="Caută operațiune"
          placeholder="Cod sau denumire..."
          value={cautare}
          onChange={(e) => setCautare(e.target.value)}
          wrapperClassName="flex-1 min-w-[200px]"
        />
        <SelectField
          label="Categorie"
          value={filtruCategorie}
          onChange={(e) =>
            setFiltruCategorie(e.target.value as CategorieManopera | 'TOATE')
          }
          options={[
            { label: 'Toate Categoriile', value: 'TOATE' },
            ...CATEGORII_MANOPERA,
          ]}
          wrapperClassName="min-w-[200px]"
        />
      </div>

      {/* ── FORMULAR ADĂUGARE / EDITARE ──────────────────────────────────────── */}
      {arataFormular && (
        <form
          onSubmit={handleSalvare}
          className="bg-white p-6 rounded-2xl shadow-xl shadow-slate-200/50 border border-emerald-100 animate-in fade-in slide-in-from-top-4"
        >
          <h4 className="text-lg font-bold text-slate-800 mb-4 border-b border-slate-100 pb-3">
            {editId !== null ? 'Editare Normă de Lucru' : 'Definire Normă de Lucru'}
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
            <Field
              label="Cod Operațiune *"
              value={form.codManopera ?? ''}
              onChange={(e) => setForm({ ...form, codManopera: e.target.value })}
              placeholder="ex: MAN-SCHIMB-ULEI"
              required
            />
            <Field
              label="Denumire Operațiune *"
              value={form.denumire ?? ''}
              onChange={(e) => setForm({ ...form, denumire: e.target.value })}
              placeholder="ex: Schimb Ulei și Filtre"
              wrapperClassName="md:col-span-2"
              required
            />
            <SelectField
              label="Categorie *"
              value={form.categorie ?? 'Mecanică Ușoară'}
              onChange={(e) =>
                setForm({ ...form, categorie: e.target.value as CategorieManopera })
              }
              options={CATEGORII_MANOPERA}
              required
            />
            <Field
              label="Normă de Timp (Ore) *"
              type="number"
              step="0.1"
              min="0.1"
              value={form.durataStd ?? ''}
              onChange={(e) =>
                setForm({ ...form, durataStd: Number(e.target.value) })
              }
              placeholder="ex: 1.5"
              hint="Durată standard în ore normate"
              required
            />
          </div>
          <div className="mt-6 flex justify-end gap-3">
            <Button variant="outline" type="button" onClick={handleInchideFormular}>
              Anulează
            </Button>
            <Button variant="secondary" type="submit">
              {editId !== null ? 'Salvează Modificările' : 'Adaugă în Nomenclator'}
            </Button>
          </div>
        </form>
      )}

      {/* ── TABEL ───────────────────────────────────────────────────────────── */}
      {listaFiltrata.length === 0 ? (
        <EmptyState
          icon={<Clock className="h-5 w-5" />}
          title="Nu au fost găsite operațiuni"
          description="Încearcă să modifici filtrele sau adaugă o operațiune nouă."
          actionLabel="+ Adaugă Operațiune"
          onAction={handleDeschideAdaugare}
        />
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-slate-50 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-200">
              <tr>
                <th
                  className="px-6 py-4 cursor-pointer hover:bg-slate-100 transition-colors w-48"
                  onClick={() => handleSort('codManopera')}
                >
                  Cod Normă{' '}
                  <SortIndicator field="codManopera" activeField={sortField} dir={sortDir} />
                </th>
                <th
                  className="px-6 py-4 cursor-pointer hover:bg-slate-100 transition-colors"
                  onClick={() => handleSort('denumire')}
                >
                  Descriere Operațiune / Categorie{' '}
                  <SortIndicator field="denumire" activeField={sortField} dir={sortDir} />
                </th>
                <th
                  className="px-6 py-4 cursor-pointer hover:bg-slate-100 transition-colors text-right w-40"
                  onClick={() => handleSort('durataStd')}
                >
                  Durată Standard{' '}
                  <SortIndicator field="durataStd" activeField={sortField} dir={sortDir} />
                </th>
                <th className="px-6 py-4 text-center w-28">Acțiuni</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {listaFiltrata.map((item) => (
                <tr
                  key={item.idManopera}
                  className="hover:bg-slate-50/80 transition-colors group"
                >
                  <td className="px-6 py-4">
                    <span className="font-mono text-xs bg-slate-100 text-slate-700 px-2 py-1 rounded font-bold border border-slate-200">
                      {item.codManopera}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-bold text-slate-800 text-[13px]">{item.denumire}</p>
                    <p className="text-xs text-slate-500 mt-1">{item.categorie}</p>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <p className="font-bold text-emerald-700 text-base">
                      {item.durataStd.toFixed(1)} h
                    </p>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditeaza(item)}
                        title="Editează"
                      >
                        <PenLine className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setConfirmSterge(item.idManopera)}
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
          <div className="px-6 py-3 border-t border-slate-100 text-xs text-slate-400">
            {listaFiltrata.length} din {lista.length} operațiuni afișate
          </div>
        </div>
      )}

      {/* ── CONFIRMARE ȘTERGERE ─────────────────────────────────────────────── */}
      <ConfirmDialog
        isOpen={confirmSterge !== null}
        title="Ștergi operațiunea?"
        description="Această acțiune este ireversibilă. Operațiunea va fi eliminată din nomenclator și nu va mai putea fi selectată pe comenzile noi."
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