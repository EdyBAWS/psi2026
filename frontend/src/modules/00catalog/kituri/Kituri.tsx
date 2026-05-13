import { PenLine, Trash2, PackagePlus, Plus, Minus, PackageX, Sparkles } from 'lucide-react';
import { useState } from 'react';
import { Button } from '../../../componente/ui/Button';
import { ConfirmDialog } from '../../../componente/ui/ConfirmDialog';
import { Field } from '../../../componente/ui/Field';
import { PageHeader } from '../../../componente/ui/PageHeader';
import { StatCard } from '../../../componente/ui/StatCard';
import { useKituri } from './useKituri';
import { SelectField } from '../../../componente/ui/SelectField';

export default function Kituri() {
  const {
    kituriFiltrate,
    pieseInventar,
    loading,
    form,
    setForm,
    editId,
    arataFormular,
    cautare,
    setCautare,
    handleSalvare,
    handleEditeaza,
    handleSterge,
    handleDeschideAdaugare,
    handleInchideFormular,
    totalKituri,
    reducereMaxima,
    valoareMedieKit
  } = useKituri();

  const [confirmSterge, setConfirmSterge] = useState<number | null>(null);

  const pretBazaCalculat = form.piese.reduce((sum: number, p: any) => {
    const piesaObj = pieseInventar.find(pi => pi.idPiesa === p.idPiesa);
    return sum + ((piesaObj?.pretBaza || 0) * p.cantitate);
  }, 0);
  const pretFinalCalculat = pretBazaCalculat * (1 - (form.reducere || 0) / 100);
  const economieCalculata = pretBazaCalculat - pretFinalCalculat;

  if (loading) {
    return <div className="flex justify-center py-24 text-slate-400">Se încarcă kiturile...</div>;
  }

  const addPiesaToKit = () => {
    setForm({
      ...form,
      piese: [...form.piese, { idPiesa: pieseInventar[0]?.idPiesa || 0, cantitate: 1 }]
    });
  };

  const updatePiesaInKit = (index: number, field: string, value: any) => {
    const newPiese = [...form.piese];
    newPiese[index] = { ...newPiese[index], [field]: value };
    setForm({ ...form, piese: newPiese });
  };

  const removePiesaFromKit = (index: number) => {
    const newPiese = [...form.piese];
    newPiese.splice(index, 1);
    setForm({ ...form, piese: newPiese });
  };

  return (
    <div className="space-y-6 pb-10">
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
          <PackagePlus className="w-64 h-64 text-indigo-900" />
        </div>
        <PageHeader
          title="Nomenclator Kit-uri Piese"
          description="Un kit este un pachet predefinit de piese. Configurează kit-uri pentru revizii sau reparații comune pentru a lucra mai rapid la recepție."
          actions={
            <Button variant="primary" onClick={arataFormular ? handleInchideFormular : handleDeschideAdaugare}>
              {arataFormular ? 'Închide Formularul' : '+ Adaugă Kit'}
            </Button>
          }
        />
        <div className="flex flex-wrap gap-3 mt-4 relative z-10">
          <StatCard label="Total Kituri" value={totalKituri} />
          <StatCard
            label="Reducere Maximă"
            value={`${reducereMaxima}%`}
            tone={reducereMaxima > 0 ? "success" : "default"}
          />
          <StatCard 
            label="Valoare Medie Kit" 
            value={`${valoareMedieKit.toFixed(2)} RON`} 
            tone="info" 
          />
        </div>
      </div>

      <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 flex gap-4">
        <Field
          label="Caută kit"
          placeholder="Cod sau denumire..."
          value={cautare}
          onChange={(e) => setCautare(e.target.value)}
          wrapperClassName="flex-1 max-w-md"
        />
      </div>

      {arataFormular && (
        <form onSubmit={handleSalvare} className="bg-white p-6 rounded-2xl shadow-xl shadow-slate-200/50 border border-indigo-100">
          <h4 className="text-lg font-bold text-slate-800 mb-4 border-b border-slate-100 pb-3">
            {editId !== null ? 'Editare Kit' : 'Creare Kit Nou'}
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-5 mb-6">
            <Field
              label="Cod Kit *"
              value={form.codKit}
              onChange={(e) => setForm({ ...form, codKit: e.target.value })}
              placeholder="ex: KIT-REVIZIE-01"
              required
            />
            <Field
              label="Denumire Kit *"
              value={form.denumire}
              onChange={(e) => setForm({ ...form, denumire: e.target.value })}
              placeholder="ex: Kit Revizie Ulei"
              wrapperClassName="md:col-span-2"
              required
            />
            <Field
              label="Reducere Aplicată (%)"
              type="number"
              min="0"
              max="100"
              value={form.reducere}
              onChange={(e) => setForm({ ...form, reducere: Number(e.target.value) })}
            />
          </div>

          <div className="bg-slate-50 p-5 rounded-xl border border-slate-200">
            <div className="flex justify-between items-center mb-4">
              <h5 className="font-bold text-slate-700 flex items-center gap-2">
                <PackagePlus className="w-5 h-5" /> Componente Kit ({form.piese.length} adăugate)
              </h5>
              <Button type="button" size="sm" variant="outline" onClick={addPiesaToKit}>
                <Plus className="w-4 h-4 mr-1" /> Adaugă Piesă
              </Button>
            </div>

            <div className="space-y-3">
              {form.piese.map((p: any, index: number) => (
                <div key={index} className="flex gap-3 items-end p-2 -mx-2 hover:bg-white rounded-lg transition-colors border border-transparent hover:border-slate-100 hover:shadow-xs">
                  <div className="flex-1">
                    <SelectField
                      label={`Componenta #${index + 1}`}
                      value={p.idPiesa.toString()}
                      onChange={(e) => updatePiesaInKit(index, 'idPiesa', Number(e.target.value))}
                      options={pieseInventar.map(pi => ({
                        label: `${pi.codPiesa} - ${pi.denumire} (${pi.pretBaza} RON)`,
                        value: pi.idPiesa.toString()
                      }))}
                    />
                  </div>
                  <div className="w-32">
                    <Field
                      label="Cantitate"
                      type="number"
                      min="1"
                      value={p.cantitate}
                      onChange={(e) => updatePiesaInKit(index, 'cantitate', Number(e.target.value))}
                      required
                    />
                  </div>
                  <Button type="button" variant="ghost" className="text-rose-500 mb-1 hover:bg-rose-50 hover:text-rose-600 border border-transparent hover:border-rose-100" onClick={() => removePiesaFromKit(index)}>
                    <Minus className="w-5 h-5" />
                  </Button>
                </div>
              ))}
              {form.piese.length === 0 && (
                <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50/50">
                  <PackageX className="w-8 h-8 text-slate-300 mb-2" />
                  <p className="text-sm text-slate-500 font-medium">Nu ai adăugat componente.</p>
                  <p className="text-xs text-slate-400 mt-1">Un kit necesită minim 2 componente.</p>
                </div>
              )}
            </div>
          </div>

          <div className="mt-6 flex flex-col md:flex-row justify-between items-center gap-4 bg-indigo-50/50 p-4 rounded-xl border border-indigo-100">
            <div className="flex items-center gap-6">
              <div>
                <p className="text-xs text-slate-500 font-bold uppercase">Valoare Bază</p>
                <p className="text-sm font-semibold text-slate-700">{pretBazaCalculat.toFixed(2)} RON</p>
              </div>
              <div className="h-8 w-px bg-indigo-200"></div>
              <div>
                <p className="text-xs text-emerald-600 font-bold uppercase flex items-center gap-1">
                  <Sparkles className="w-3 h-3" /> Economie Client
                </p>
                <p className="text-sm font-bold text-emerald-600">{economieCalculata.toFixed(2)} RON ({form.reducere || 0}%)</p>
              </div>
              <div className="h-8 w-px bg-indigo-200"></div>
              <div>
                <p className="text-xs text-indigo-600 font-bold uppercase">Preț Kit</p>
                <p className="text-xl font-black text-indigo-700">{pretFinalCalculat.toFixed(2)} RON</p>
              </div>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" type="button" onClick={handleInchideFormular}>Anulează</Button>
              <Button variant="primary" type="submit">{editId !== null ? 'Salvează Modificări' : 'Creează Kit'}</Button>
            </div>
          </div>
        </form>
      )}

      {kituriFiltrate.length === 0 && !loading && !arataFormular && (
        <div className="flex flex-col items-center justify-center bg-white p-16 rounded-2xl border border-slate-200 border-dashed text-center">
          <PackagePlus className="w-16 h-16 text-slate-200 mb-4" />
          <h3 className="text-lg font-bold text-slate-700 mb-2">Niciun kit găsit</h3>
          <p className="text-slate-500 text-sm max-w-md">
            Nu s-au găsit kit-uri care să corespundă căutării sau nu ai definit încă niciunul. 
          </p>
          <Button variant="primary" className="mt-6" onClick={handleDeschideAdaugare}>
            + Creează Primul Kit
          </Button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-5">
        {kituriFiltrate.map((kit) => (
          <div key={kit.idKit} className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 hover:border-indigo-300 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 relative group overflow-hidden">
            {kit.reducere > 0 && (
              <div className="absolute top-0 right-0 bg-linear-to-r from-emerald-400 to-emerald-500 text-white text-[10px] font-bold px-3 py-1 rounded-bl-xl shadow-xs">
                -{kit.reducere}% DISCOUNT
              </div>
            )}
            
            <div className="flex justify-between items-start mb-4">
              <div className="pr-12">
                <span className="font-mono text-xs font-bold bg-indigo-50 text-indigo-700 px-2 py-1 rounded-md inline-block mb-2 border border-indigo-100">{kit.codKit}</span>
                <h3 className="font-bold text-lg text-slate-800 leading-tight">{kit.denumire}</h3>
              </div>
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button variant="ghost" size="sm" onClick={() => handleEditeaza(kit)} className="h-8 w-8 p-0 text-slate-400 hover:text-indigo-600 bg-slate-50 hover:bg-indigo-50 border border-slate-100"><PenLine className="h-4 w-4" /></Button>
                <Button variant="ghost" size="sm" onClick={() => setConfirmSterge(kit.idKit)} className="h-8 w-8 p-0 text-slate-400 hover:text-rose-600 bg-slate-50 hover:bg-rose-50 border border-slate-100"><Trash2 className="h-4 w-4" /></Button>
              </div>
            </div>
            
            <div className="space-y-2 mt-4 bg-slate-50/80 p-3 rounded-xl border border-slate-100">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex justify-between items-center mb-3">
                <span>{kit.piese.length} Componente</span>
                <span className="bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full text-[9px]">Pachet</span>
              </p>
              
              <div className="flex flex-wrap gap-2">
                {kit.piese.map((p: any) => (
                  <div key={p.idItem} className="flex items-center gap-1.5 bg-white border border-slate-200 px-2.5 py-1.5 rounded-lg text-xs shadow-xs hover:border-indigo-200 transition-colors">
                    <span className="font-black text-indigo-600 bg-indigo-50 px-1.5 rounded text-[10px]">{p.cantitate}x</span>
                    <span className="text-slate-700 font-medium truncate max-w-[140px]" title={p.piesa.denumire}>{p.piesa.denumire}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
      <ConfirmDialog
        isOpen={confirmSterge !== null}
        title="Ștergi acest kit?"
        description="Atenție: Kitul va fi șters, dar documentele unde a fost deja adăugat își vor păstra piesele componente."
        onConfirm={() => { if (confirmSterge) handleSterge(confirmSterge); setConfirmSterge(null); }}
        onCancel={() => setConfirmSterge(null)}
      />
    </div>
  );
}
