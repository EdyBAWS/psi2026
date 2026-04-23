// src/modules/01entitati/Asigurator.tsx
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Search, Building2, ShieldCheck, PenLine, Ban, CheckCircle2 } from 'lucide-react';
import { PageHeader } from '../../../componente/ui/PageHeader';
import { StatCard } from '../../../componente/ui/StatCard';
import { Card, CardContent } from '../../../componente/ui/Card';
import { Field } from '../../../componente/ui/Field';
import { Button } from '../../../componente/ui/Button';
import { ConfirmDialog } from '../../../componente/ui/ConfirmDialog';
import { EmptyState } from '../../../componente/ui/EmptyState';
import { asiguratorSchema, type AsiguratorFormValues } from '../schemas';
import { useAsigurator } from './useAsigurator';
import type { AsiguratorEntity } from '../entitati.service';

export function Asigurator() {
  const { listaFiltrata, loading, cautare, setCautare, arataInactivi, setArataInactivi, salveaza, schimbaStatus, stats } = useAsigurator();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [confirmStatus, setConfirmStatus] = useState<{ id: number, action: 'Activ' | 'Inactiv' } | null>(null);

  const { register, handleSubmit, formState: { errors }, reset } = useForm<AsiguratorFormValues>({
    resolver: zodResolver(asiguratorSchema),
    defaultValues: { status: 'Activ' }
  });

  const deschideAdaugare = () => { reset({ status: 'Activ' }); setEditId(null); setIsFormOpen(true); };
  const deschideEditare = (asig: AsiguratorEntity) => { reset(asig); setEditId(asig.idAsigurator); setIsFormOpen(true); };
  
  const onSubmit = async (data: AsiguratorFormValues) => {
    await salveaza(data, editId ?? undefined);
    setIsFormOpen(false);
  };

  if (loading) return <div className="py-12 text-center text-slate-500">Se încarcă datele...</div>;

  return (
    <div className="space-y-6 pb-10">
      <PageHeader 
        title="Societăți Asigurare" 
        description="Gestionează asiguratorii folosiți pentru decontare directă pe dosarele de daună."
        actions={
          <Button variant={isFormOpen ? "outline" : "primary"} onClick={isFormOpen ? () => setIsFormOpen(false) : deschideAdaugare}>
            {isFormOpen ? 'Închide Formularul' : '+ Adaugă Asigurator'}
          </Button>
        }
      />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <StatCard label="Total Asiguratori Activi" value={stats.totalActivi} icon={<ShieldCheck />} />
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
            <div className="relative w-full md:max-w-md">
              <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
              <input 
                type="text" placeholder="Caută după denumire sau CUI..." 
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
              <h3 className="mb-4 text-lg font-bold text-slate-800">{editId ? 'Editare Asigurator' : 'Adăugare Asigurator'}</h3>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <Field label="Denumire Societate *" {...register('denumire')} error={errors.denumire?.message} />
                  <Field label="CUI *" placeholder="RO..." {...register('CUI')} error={errors.CUI?.message} />
                  <Field label="Telefon" {...register('telefon')} error={errors.telefon?.message} />
                </div>
                <div className="flex justify-end gap-3 pt-4">
                  <Button type="button" variant="ghost" onClick={() => setIsFormOpen(false)}>Renunță</Button>
                  <Button type="submit" variant="primary">Salvează</Button>
                </div>
              </form>
            </div>
          )}

          {listaFiltrata.length === 0 ? (
             <EmptyState icon={<Building2 />} title="Niciun asigurator găsit" description="Nu ai introdus încă niciun partener de asigurare." actionLabel="+ Adaugă" onAction={deschideAdaugare} />
          ) : (
            <div className="overflow-x-auto rounded-xl border border-slate-200">
              <table className="min-w-full text-left text-sm">
                <thead className="bg-slate-50 text-xs uppercase text-slate-500 border-b border-slate-200">
                  <tr><th className="px-6 py-4">Denumire & CUI</th><th className="px-6 py-4">Telefon</th><th className="px-6 py-4">Status</th><th className="px-6 py-4 text-right">Acțiuni</th></tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {listaFiltrata.map(asig => (
                    <tr key={asig.idAsigurator} className={`hover:bg-slate-50 ${asig.status === 'Inactiv' ? 'opacity-60' : ''}`}>
                      <td className="px-6 py-4 font-medium text-slate-800">
                        {asig.denumire} <br/>
                        <span className="text-xs text-slate-500 font-normal">CUI: {asig.CUI}</span>
                      </td>
                      <td className="px-6 py-4 text-slate-600">{asig.telefon || '-'}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded text-xs font-bold ${asig.status === 'Activ' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>{asig.status}</span>
                      </td>
                      <td className="px-6 py-4 text-right space-x-2">
                        <Button variant="ghost" size="sm" onClick={() => deschideEditare(asig)}><PenLine className="h-4 w-4" /></Button>
                        {asig.status === 'Activ' ? (
                          <Button variant="ghost" size="sm" className="text-rose-600" onClick={() => setConfirmStatus({ id: asig.idAsigurator, action: 'Inactiv' })}><Ban className="h-4 w-4" /></Button>
                        ) : (
                          <Button variant="ghost" size="sm" className="text-emerald-600" onClick={() => setConfirmStatus({ id: asig.idAsigurator, action: 'Activ' })}><CheckCircle2 className="h-4 w-4" /></Button>
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
        title={confirmStatus?.action === 'Inactiv' ? 'Dezactivare Asigurator' : 'Reactivare Asigurator'}
        description={confirmStatus?.action === 'Inactiv' ? 'Asiguratorul nu va mai putea fi selectat pe viitoarele dosare de daună.' : 'Asiguratorul va fi din nou disponibil pentru selecție.'}
        confirmLabel="Confirmă"
        onConfirm={() => { schimbaStatus(confirmStatus!.id, confirmStatus!.action); setConfirmStatus(null); }}
        onCancel={() => setConfirmStatus(null)}
      />
    </div>
  );
}