import { PenLine, Trash2, PackagePlus, Plus, Minus } from 'lucide-react';
import { useState } from 'react';
import { Button } from '../../../componente/ui/Button';
import { ConfirmDialog } from '../../../componente/ui/ConfirmDialog';
import { Field } from '../../../componente/ui/Field';
import { PageHeader } from '../../../componente/ui/PageHeader';
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
    handleInchideFormular
  } = useKituri();

  const [confirmSterge, setConfirmSterge] = useState<number | null>(null);

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
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
        <PageHeader
          title="Nomenclator Kit-uri Piese"
          description="Un kit este un pachet de cel puțin 2 piese ce vor fi adăugate împreună pe comandă."
          actions={
            <Button variant="primary" onClick={arataFormular ? handleInchideFormular : handleDeschideAdaugare}>
              {arataFormular ? 'Închide Formularul' : '+ Adaugă Kit'}
            </Button>
          }
        />
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

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-6">
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
                <div key={index} className="flex gap-3 items-end">
                  <div className="flex-1">
                    <SelectField
                      label={`Piesa #${index + 1}`}
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
                  <Button type="button" variant="ghost" className="text-rose-500 mb-1" onClick={() => removePiesaFromKit(index)}>
                    <Minus className="w-5 h-5" />
                  </Button>
                </div>
              ))}
              {form.piese.length === 0 && (
                <p className="text-sm text-slate-500 italic">Nu ați adăugat nicio piesă în kit.</p>
              )}
            </div>
          </div>

          <div className="mt-6 flex justify-end gap-3">
            <Button variant="outline" type="button" onClick={handleInchideFormular}>Anulează</Button>
            <Button variant="primary" type="submit">{editId !== null ? 'Salvează' : 'Creează Kit'}</Button>
          </div>
        </form>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {kituriFiltrate.map((kit) => (
          <div key={kit.idKit} className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 hover:border-indigo-200 transition-colors">
            <div className="flex justify-between items-start mb-4">
              <div>
                <span className="font-mono text-xs font-bold bg-indigo-50 text-indigo-700 px-2 py-1 rounded inline-block mb-2">{kit.codKit}</span>
                <h3 className="font-bold text-lg text-slate-800">{kit.denumire}</h3>
              </div>
              <div className="flex gap-1">
                <Button variant="ghost" size="sm" onClick={() => handleEditeaza(kit)}><PenLine className="h-4 w-4" /></Button>
                <Button variant="ghost" size="sm" className="text-rose-500" onClick={() => setConfirmSterge(kit.idKit)}><Trash2 className="h-4 w-4" /></Button>
              </div>
            </div>
            <div className="space-y-2 mt-4 bg-slate-50 p-3 rounded-lg border border-slate-100">
              <p className="text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider">Piese Componente</p>
              {kit.piese.map((p: any) => (
                <div key={p.idItem} className="flex justify-between text-sm">
                  <span className="text-slate-700 font-medium">{p.cantitate}x {p.piesa.denumire}</span>
                  <span className="text-slate-500 text-xs">{p.piesa.codPiesa}</span>
                </div>
              ))}
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
