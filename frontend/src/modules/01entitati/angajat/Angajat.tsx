// src/modules/01entitati/angajat/Angajat.tsx
import { useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Search, Users, Wrench, Briefcase, PenLine, Ban, CheckCircle2 } from 'lucide-react';
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

  // Am scos `watch` de aici și am adus `control`
  const { register, control, handleSubmit, formState: { errors }, reset } = useForm<AngajatFormValues>({
    resolver: zodResolver(angajatSchema),
    defaultValues: { tipAngajat: 'Mecanic', status: 'Activ' }
  });

  // Am folosit useWatch pentru a nu sparge memoizarea React Compiler-ului
  const tipAngajat = useWatch({
    control,
    name: 'tipAngajat',
  });

  const deschideAdaugare = () => { reset({ tipAngajat: 'Mecanic', status: 'Activ' }); setEditId(null); setIsFormOpen(true); };
  const deschideEditare = (angajat: AngajatEntity) => { reset(angajat); setEditId(angajat.idAngajat); setIsFormOpen(true); };
  
  const onSubmit = async (data: AngajatFormValues) => {
    await salveaza(data, editId ?? undefined);
    setIsFormOpen(false);
  };

  if (loading) return <div className="py-12 text-center text-slate-500">Se încarcă datele...</div>;

  return (
    <div className="space-y-6 pb-10">
      <PageHeader 
        title="Gestiune Angajați" 
        description="Administrează personalul și rolurile operaționale ale service-ului."
        actions={
          <Button variant={isFormOpen ? "outline" : "primary"} onClick={isFormOpen ? () => setIsFormOpen(false) : deschideAdaugare}>
            {isFormOpen ? 'Închide Formularul' : '+ Adaugă Angajat'}
          </Button>
        }
      />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <StatCard label="Total Angajați Activi" value={stats.totalActivi} icon={<Users />} />
        <StatCard label="Mecanici Activi" value={stats.totalMecanici} tone="info" icon={<Wrench />} />
        <StatCard label="Manageri Activi" value={stats.totalManageri} tone="warning" icon={<Briefcase />} />
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
            <div className="relative w-full md:max-w-md">
              <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
              <input 
                type="text" placeholder="Caută nume, telefon, CNP..." 
                className="w-full rounded-xl border border-slate-200 py-2.5 pl-10 pr-4 outline-none focus:ring-2 focus:ring-indigo-500"
                value={cautare} onChange={(e) => setCautare(e.target.value)}
              />
            </div>
            <label className="flex items-center gap-2 text-sm font-medium text-slate-600 cursor-pointer">
              <input type="checkbox" checked={arataInactivi} onChange={e => setArataInactivi(e.target.checked)} className="rounded border-slate-300 text-indigo-600" />
              Afișează și inactivi
            </label>
          </div>

          {isFormOpen && (
            <div className="mb-8 rounded-xl border border-slate-200 bg-slate-50 p-6 shadow-sm">
              <h3 className="mb-4 text-lg font-bold text-slate-800">{editId ? 'Editare Angajat' : 'Adăugare Angajat'}</h3>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <Field label="Nume *" {...register('nume')} error={errors.nume?.message} />
                  <Field label="Prenume *" {...register('prenume')} error={errors.prenume?.message} />
                  <Field label="CNP *" {...register('CNP')} error={errors.CNP?.message} />
                  <Field label="Telefon *" {...register('telefon')} error={errors.telefon?.message} />
                  <Field label="Email" type="email" {...register('email')} error={errors.email?.message} />
                  
                  <SelectField 
                    label="Rol Angajat *" 
                    options={[{ label: 'Mecanic', value: 'Mecanic' }, { label: 'Manager', value: 'Manager' }, { label: 'Recepționer', value: 'Receptioner' }]}
                    {...register('tipAngajat')} error={errors.tipAngajat?.message} 
                  />

                  {/* Rendering Condiționat pe baza rolului */}
                  {tipAngajat === 'Mecanic' && (
                    <>
                      <Field label="Specializare *" placeholder="ex: Mecanică Ușoară" {...register('specializare')} error={errors.specializare?.message} />
                      <Field label="Cost Orar (RON)" type="number" step="0.01" {...register('costOrar', { valueAsNumber: true })} error={errors.costOrar?.message} />
                    </>
                  )}
                  {tipAngajat === 'Manager' && (
                    <>
                      <Field label="Departament *" {...register('departament')} error={errors.departament?.message} />
                      <Field label="Spor Conducere (%)" type="number" step="0.01" {...register('sporConducere', { valueAsNumber: true })} />
                    </>
                  )}
                  {tipAngajat === 'Receptioner' && (
                    <>
                      <Field label="Număr Birou *" {...register('nrBirou')} error={errors.nrBirou?.message} />
                      <Field label="Tura" placeholder="ex: Dimineața / După-amiaza" {...register('tura')} />
                    </>
                  )}
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <Button type="button" variant="ghost" onClick={() => setIsFormOpen(false)}>Renunță</Button>
                  <Button type="submit" variant="primary">Salvează Datele</Button>
                </div>
              </form>
            </div>
          )}

          {listaFiltrata.length === 0 ? (
             <EmptyState icon={<Users />} title="Niciun angajat găsit" description="Modifică filtrele sau adaugă un angajat nou." actionLabel="+ Adaugă Angajat" onAction={deschideAdaugare} />
          ) : (
            <div className="overflow-x-auto rounded-xl border border-slate-200">
              <table className="min-w-full text-left text-sm">
                <thead className="bg-slate-50 text-xs uppercase text-slate-500 border-b border-slate-200">
                  <tr><th className="px-6 py-4">Nume Angajat</th><th className="px-6 py-4">Contact</th><th className="px-6 py-4">Rol / Detalii</th><th className="px-6 py-4">Status</th><th className="px-6 py-4 text-right">Acțiuni</th></tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {listaFiltrata.map(angajat => (
                    <tr key={angajat.idAngajat} className={`hover:bg-slate-50 ${angajat.status === 'Inactiv' ? 'opacity-60' : ''}`}>
                      <td className="px-6 py-4 font-medium text-slate-800">
                        {angajat.nume} {angajat.prenume} <br/>
                        <span className="text-xs text-slate-500">CNP: {angajat.CNP}</span>
                      </td>
                      <td className="px-6 py-4 text-slate-600">{angajat.telefon}<br/><span className="text-xs">{angajat.email}</span></td>
                      <td className="px-6 py-4 text-slate-800 font-medium">
                        {angajat.tipAngajat} <br/>
                        <span className="text-xs text-slate-500 font-normal">
                          {angajat.tipAngajat === 'Mecanic' ? angajat.specializare : angajat.tipAngajat === 'Manager' ? angajat.departament : `Birou: ${angajat.nrBirou}`}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded text-xs font-bold ${angajat.status === 'Activ' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>{angajat.status}</span>
                      </td>
                      <td className="px-6 py-4 text-right space-x-2">
                        <Button variant="ghost" size="sm" onClick={() => deschideEditare(angajat)}><PenLine className="h-4 w-4" /></Button>
                        {angajat.status === 'Activ' ? (
                          <Button variant="ghost" size="sm" className="text-rose-600" onClick={() => setConfirmStatus({ id: angajat.idAngajat, action: 'Inactiv' })}><Ban className="h-4 w-4" /></Button>
                        ) : (
                          <Button variant="ghost" size="sm" className="text-emerald-600" onClick={() => setConfirmStatus({ id: angajat.idAngajat, action: 'Activ' })}><CheckCircle2 className="h-4 w-4" /></Button>
                        )}
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