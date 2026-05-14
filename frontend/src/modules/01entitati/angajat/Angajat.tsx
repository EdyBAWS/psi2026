// src/modules/01entitati/angajat/Angajat.tsx
import { useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Search, Users, Wrench, Briefcase, PenLine, Ban, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import { PageHeader } from '../../../componente/ui/PageHeader';
import { StatCard } from '../../../componente/ui/StatCard';
import { Card, CardContent } from '../../../componente/ui/Card';
import { Field } from '../../../componente/ui/Field';
import { SelectField } from '../../../componente/ui/SelectField';
import { Button } from '../../../componente/ui/Button';
import { ConfirmDialog } from '../../../componente/ui/ConfirmDialog';
import { EmptyState } from '../../../componente/ui/EmptyState';
import { angajatSchema, type AngajatFormValues } from '../schemas';
import { useAngajat } from './useAngajat';
import type { AngajatEntity } from '../entitati.service';

export function Angajat() {
  const { listaFiltrata, loading, cautare, setCautare, arataInactivi, setArataInactivi, salveaza, schimbaStatus, stats } = useAngajat();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [confirmStatus, setConfirmStatus] = useState<{ id: number, action: 'Activ' | 'Inactiv' } | null>(null);

  const { register, control, handleSubmit, formState: { errors }, reset } = useForm<AngajatFormValues>({
    resolver: zodResolver(angajatSchema) as any,
    shouldUnregister: true,
    defaultValues: { tipAngajat: 'Mecanic', status: 'Activ', costOrar: 0, sporConducere: 0 }
  });

  const tipAngajat = useWatch({ control, name: 'tipAngajat' });

  const deschideAdaugare = () => { reset({ tipAngajat: 'Mecanic', status: 'Activ' }); setEditId(null); setIsFormOpen(true); };
  const deschideEditare = (angajat: AngajatEntity) => { reset(angajat); setEditId(angajat.idAngajat); setIsFormOpen(true); };
  
  const onSubmit = async (data: AngajatFormValues) => {
    try {
      await salveaza(data, editId ?? undefined);
      toast.success(editId ? 'Angajat actualizat cu succes!' : 'Angajat adăugat cu succes!');
      setIsFormOpen(false);
    } catch (error) {
      console.error('Erroare la salvare angajat:', error);
      toast.error('A apărut o eroare la salvarea datelor. Te rugăm să încerci din nou.');
    }
  };

  const onInvalid = (errors: any) => {
    console.log('Validare eșuată:', errors);
    toast.error('Te rugăm să verifici câmpurile obligatorii și formatele introduse.');
  };

  if (loading) return <div className="py-12 text-center text-slate-500">Se încarcă datele...</div>;

  return (
    <div className="space-y-6 pb-10">
      {/* HEADER UNITAR STIL CATALOG */}
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
        <PageHeader 
          title="Gestiune Angajați" 
          description="Administrează personalul și rolurile operaționale ale service-ului."
          actions={
            <Button variant={isFormOpen ? "outline" : "primary"} onClick={isFormOpen ? () => setIsFormOpen(false) : deschideAdaugare}>
              {isFormOpen ? 'Închide Formularul' : '+ Adaugă Angajat'}
            </Button>
          }
        />
        <div className="flex flex-wrap gap-4 mt-6">
          <StatCard label="Total Angajați Activi" value={stats.totalActivi} icon={<Users />} />
          <StatCard label="Mecanici Activi" value={stats.totalMecanici} tone="info" icon={<Wrench />} />
          <StatCard label="Manageri Activi" value={stats.totalManageri} tone="warning" icon={<Briefcase />} />
          <StatCard label="Inspectori Activi" value={stats.totalInspectori} tone="success" icon={<Briefcase />} />
        </div>
      </div>

      {/* TOOLBAR RAFIANT */}
      <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:max-w-md">
          <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
          <input 
            type="text" placeholder="Caută nume, telefon, CNP..." 
            className="w-full rounded-xl border border-slate-200 py-2.5 pl-10 pr-4 outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
            value={cautare} onChange={(e) => setCautare(e.target.value)}
          />
        </div>
        <label className="flex items-center gap-2 text-sm font-medium text-slate-600 cursor-pointer bg-white px-4 py-2.5 rounded-xl border border-slate-200">
          <input type="checkbox" checked={arataInactivi} onChange={e => setArataInactivi(e.target.checked)} className="rounded border-slate-300 text-indigo-600" />
          Afișează și inactivi
        </label>
      </div>

      {isFormOpen && (
        <div className="rounded-2xl border border-indigo-100 bg-white p-6 shadow-xl animate-in fade-in slide-in-from-top-4">
          <h4 className="mb-6 text-lg font-bold text-slate-800 border-b border-slate-100 pb-3">{editId ? 'Editare Angajat' : 'Definire Angajat Nou'}</h4>
          <form onSubmit={handleSubmit(onSubmit as any, onInvalid)} className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <Field label="Nume *" {...register('nume')} error={errors.nume?.message} />
              <Field label="Prenume *" {...register('prenume')} error={errors.prenume?.message} />
              <Field label="CNP *" {...register('CNP')} error={errors.CNP?.message} />
              <Field label="Telefon *" {...register('telefon')} error={errors.telefon?.message} />
              <Field label="Email" type="email" {...register('email')} error={errors.email?.message} />
              <SelectField 
                id="select-rol-angajat"
                label="Rol Angajat *" 
                options={[
                  { label: 'Mecanic', value: 'Mecanic' },
                  { label: 'Manager', value: 'Manager' },
                  { label: 'Recepționer', value: 'Receptioner' },
                  { label: 'Inspector Daune', value: 'Inspector' },
                  { label: 'Contabil', value: 'Contabil' }
                ]}
                {...register('tipAngajat')} error={errors.tipAngajat?.message} 
              />
              {tipAngajat === 'Mecanic' && (
                <>
                  <div className="flex items-center gap-3 bg-indigo-50/50 p-3 rounded-xl border border-indigo-100 col-span-1 md:col-span-2">
                    <input 
                      type="checkbox" 
                      id="esteInspector" 
                      {...register('esteInspector')} 
                      className="h-5 w-5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500" 
                    />
                    <label htmlFor="esteInspector" className="text-sm font-semibold text-slate-700 cursor-pointer">
                      Acest mecanic este și Inspector Daune (permite alocarea pe dosare)
                    </label>
                  </div>
                  <Field label="Specializare *" placeholder="ex: Mecanică Ușoară" {...register('specializare')} error={errors.specializare?.message} />
                  <Field label="Cost Orar (RON)" type="number" step="0.01" min="0" placeholder="0" {...register('costOrar', { valueAsNumber: true })} error={errors.costOrar?.message} />
                </>
              )}
              {tipAngajat === 'Manager' && (
                <>
                  <Field label="Departament *" {...register('departament')} error={errors.departament?.message} />
                  <Field label="Spor Conducere (%)" type="number" step="0.01" min="0" placeholder="0" {...register('sporConducere', { valueAsNumber: true })} />
                  <Field label="Cost Orar (RON)" type="number" step="0.01" min="0" placeholder="0" {...register('costOrar', { valueAsNumber: true })} error={errors.costOrar?.message} />
                </>
              )}
              {tipAngajat === 'Receptioner' && (
                <>
                  <Field label="Număr Birou *" {...register('nrBirou')} error={errors.nrBirou?.message} />
                  <Field label="Tură" placeholder="ex: Dimineața / După-amiaza" {...register('tura')} />
                  <Field label="Cost Orar (RON)" type="number" step="0.01" min="0" placeholder="0" {...register('costOrar', { valueAsNumber: true })} error={errors.costOrar?.message} />
                </>
              )}
              {tipAngajat === 'Inspector' && (
                <>
                  <Field label="Specializare" placeholder="ex: Evaluări Daune" {...register('specializare')} error={errors.specializare?.message} />
                  <Field label="Departament" {...register('departament')} error={errors.departament?.message} />
                  <Field label="Număr Birou" {...register('nrBirou')} error={errors.nrBirou?.message} />
                  <Field label="Cost Orar (RON)" type="number" step="0.01" min="0" placeholder="0" {...register('costOrar', { valueAsNumber: true })} error={errors.costOrar?.message} />
                </>
              )}
              {tipAngajat === 'Contabil' && (
                <>
                  <Field label="Departament *" {...register('departament')} error={errors.departament?.message} />
                  <Field label="Cost Orar (RON)" type="number" step="0.01" min="0" placeholder="0" {...register('costOrar', { valueAsNumber: true })} error={errors.costOrar?.message} />
                </>
              )}
            </div>
            <div className="flex justify-end gap-3 pt-4 border-t border-slate-50">
              <Button type="button" variant="outline" onClick={() => setIsFormOpen(false)}>Anulează</Button>
              <Button type="submit" variant="primary">Salvează Angajat</Button>
            </div>
          </form>
        </div>
      )}

      <Card className="overflow-hidden border-slate-100 shadow-sm">
        <CardContent className="p-0">
          {listaFiltrata.length === 0 ? (
             <div className="py-12"><EmptyState icon={<Users />} title="Niciun angajat găsit" description="Modifică filtrele sau adaugă un angajat nou." actionLabel="+ Adaugă Angajat" onAction={deschideAdaugare} /></div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead className="bg-slate-50 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-200">
                  <tr><th className="px-6 py-4">Nume Angajat</th><th className="px-6 py-4">Contact</th><th className="px-6 py-4">Rol / Detalii</th><th className="px-6 py-4">Status</th><th className="px-6 py-4 text-center">Acțiuni</th></tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {listaFiltrata.map(angajat => (
                    <tr key={angajat.idAngajat} className={`hover:bg-slate-50/80 transition-colors group ${angajat.status === 'Inactiv' ? 'opacity-60' : ''}`}>
                      <td className="px-6 py-4 font-bold text-slate-800">
                        {angajat.nume} {angajat.prenume} <br/>
                        <span className="text-[10px] font-mono text-slate-500">CNP: {angajat.CNP}</span>
                      </td>
                      <td className="px-6 py-4 text-slate-600">{angajat.telefon}<br/><span className="text-xs text-slate-400">{angajat.email}</span></td>
                      <td className="px-6 py-4">
                        <p className="font-bold text-slate-800">{angajat.tipAngajat}</p>
                        <p className="text-xs text-slate-500">
                          {angajat.tipAngajat === 'Mecanic' ? angajat.specializare : 
                           angajat.tipAngajat === 'Manager' ? angajat.departament : 
                           angajat.tipAngajat === 'Receptioner' ? `Birou: ${angajat.nrBirou}` : 
                           `Dept: ${angajat.departament || 'N/A'}`}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wide ${angajat.status === 'Activ' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-rose-50 text-rose-700 border border-rose-100'}`}>{angajat.status}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button variant="ghost" size="sm" onClick={() => deschideEditare(angajat)}><PenLine className="h-4 w-4" /></Button>
                          {angajat.status === 'Activ' ? (
                            <Button variant="ghost" size="sm" className="text-rose-500 hover:text-rose-700 hover:bg-rose-50" onClick={() => setConfirmStatus({ id: angajat.idAngajat, action: 'Inactiv' })}><Ban className="h-4 w-4" /></Button>
                          ) : (
                            <Button variant="ghost" size="sm" className="text-emerald-500 hover:text-emerald-700 hover:bg-emerald-50" onClick={() => setConfirmStatus({ id: angajat.idAngajat, action: 'Activ' })}><CheckCircle2 className="h-4 w-4" /></Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <ConfirmDialog 
        isOpen={!!confirmStatus}
        title={confirmStatus?.action === 'Inactiv' ? 'Dezactivare Angajat' : 'Reactivare Angajat'}
        description={confirmStatus?.action === 'Inactiv' ? 'Angajatul va fi marcat ca inactiv. Istoricul intervențiilor va fi păstrat.' : 'Angajatul va fi din nou disponibil pentru alocare.'}
        confirmLabel="Confirmă"
        onConfirm={() => { schimbaStatus(confirmStatus!.id, confirmStatus!.action); setConfirmStatus(null); }}
        onCancel={() => setConfirmStatus(null)}
      />
    </div>
  );
}
