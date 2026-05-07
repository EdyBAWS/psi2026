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
    defaultValues: { 
      status: 'Activ', 
      termenPlataZile: 30,
      denumire: '',
      CUI: '',
      telefon: '',
      nrRegCom: '',
      adresa: '',
      emailDaune: '',
      IBAN: ''
    }
  });

  const deschideAdaugare = () => { 
    reset({ 
      status: 'Activ', 
      termenPlataZile: 30, 
      denumire: '', 
      CUI: '',
      telefon: '',
      nrRegCom: '',
      adresa: '',
      emailDaune: '',
      IBAN: ''
    }); 
    setEditId(null); 
    setIsFormOpen(true); 
  };

  const deschideEditare = (asig: AsiguratorEntity) => { 
    reset({
      ...asig,
      emailDaune: asig.emailDaune || '',
      nrRegCom: asig.nrRegCom || '',
      adresa: asig.adresa || '',
      IBAN: asig.IBAN || '',
      telefon: asig.telefon || ''
    }); 
    setEditId(asig.idAsigurator); 
    setIsFormOpen(true); 
  };
  
  const onSubmit = async (data: AsiguratorFormValues) => {
    await salveaza(data, editId ?? undefined);
    setIsFormOpen(false);
  };

  if (loading) return <div className="py-12 text-center text-slate-500">Se încarcă partenerii...</div>;

  return (
    <div className="space-y-6 pb-10">
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
        <PageHeader 
          title="Societăți Asigurare" 
          description="Gestionează datele de contact și facturare pentru asigurători."
          actions={
            <Button variant={isFormOpen ? "outline" : "primary"} onClick={isFormOpen ? () => setIsFormOpen(false) : deschideAdaugare}>
              {isFormOpen ? 'Închide Formularul' : '+ Adaugă Asigurator'}
            </Button>
          }
        />
        <div className="flex gap-4 mt-6">
          <StatCard label="Asiguratori Activi" value={stats.totalActivi} icon={<ShieldCheck />} />
        </div>
      </div>

      <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:max-w-md">
          <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
          <input 
            type="text" placeholder="Caută după denumire, CUI sau Email..." 
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
          <h4 className="mb-6 text-lg font-bold text-slate-800 border-b border-slate-100 pb-3">{editId ? 'Editare Asigurator' : 'Înregistrare Asigurator Nou'}</h4>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <div className="md:col-span-2">
                <Field label="Denumire Societate *" {...register('denumire')} error={errors.denumire?.message} />
              </div>
              <Field label="CUI *" placeholder="RO..." {...register('CUI')} error={errors.CUI?.message} />
              
              <Field label="Nr. Reg. Comerțului" placeholder="J.../..." {...register('nrRegCom')} error={errors.nrRegCom?.message} />
              <Field label="Email Daune" placeholder="daune@..." {...register('emailDaune')} error={errors.emailDaune?.message} />
              <Field label="Telefon" {...register('telefon')} error={errors.telefon?.message} />
              
              <div className="md:col-span-2">
                <Field label="Cont IBAN" placeholder="RO..." {...register('IBAN')} error={errors.IBAN?.message} />
              </div>
              <Field label="Termen Plată (Zile)" type="number" {...register('termenPlataZile', { valueAsNumber: true })} error={errors.termenPlataZile?.message} />

              <div className="md:col-span-3">
                <Field label="Adresă Sediu" placeholder="Strada, Oraș, Județ..." {...register('adresa')} error={errors.adresa?.message} />
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-4 border-t border-slate-50">
              <Button type="button" variant="outline" onClick={() => setIsFormOpen(false)}>Anulează</Button>
              <Button type="submit" variant="primary">Salvează Asigurator</Button>
            </div>
          </form>
        </div>
      )}

      <Card className="overflow-hidden border-slate-100 shadow-sm">
        <CardContent className="p-0">
          {listaFiltrata.length === 0 ? (
             <div className="py-12"><EmptyState icon={<Building2 />} title="Niciun asigurator găsit" description="Nu ai introdus încă niciun partener de asigurare." actionLabel="+ Adaugă" onAction={deschideAdaugare} /></div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead className="bg-slate-50 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-200">
                  <tr><th className="px-6 py-4">Denumire & CUI</th><th className="px-6 py-4">Contact (Telefon/Email)</th><th className="px-6 py-4">Termen Plată</th><th className="px-6 py-4">Status</th><th className="px-6 py-4 text-center">Acțiuni</th></tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {listaFiltrata.map(asig => (
                    <tr key={asig.idAsigurator} className={`hover:bg-slate-50 transition-colors group ${asig.status === 'Inactiv' ? 'opacity-60' : ''}`}>
                      <td className="px-6 py-4 font-bold text-slate-800">
                        {asig.denumire} <br/>
                        <span className="text-[10px] font-mono text-slate-500">CUI: {asig.CUI} {asig.nrRegCom && ` | ${asig.nrRegCom}`}</span>
                      </td>
                      <td className="px-6 py-4 text-slate-600">
                        {asig.telefon || '-'}<br/>
                        <span className="text-xs text-slate-400">{asig.emailDaune || 'Fără email'}</span>
                      </td>
                      <td className="px-6 py-4 text-slate-600 font-medium">
                        {asig.termenPlataZile} zile
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${asig.status === 'Activ' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>{asig.status}</span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button variant="ghost" size="sm" onClick={() => deschideEditare(asig)}><PenLine className="h-4 w-4" /></Button>
                          {asig.status === 'Activ' ? (
                            <Button variant="ghost" size="sm" className="text-rose-500" onClick={() => setConfirmStatus({ id: asig.idAsigurator, action: 'Inactiv' })}><Ban className="h-4 w-4" /></Button>
                          ) : (
                            <Button variant="ghost" size="sm" className="text-emerald-500" onClick={() => setConfirmStatus({ id: asig.idAsigurator, action: 'Activ' })}><CheckCircle2 className="h-4 w-4" /></Button>
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
        title={confirmStatus?.action === 'Inactiv' ? 'Dezactivare Asigurator' : 'Reactivare Asigurator'}
        description={confirmStatus?.action === 'Inactiv' ? 'Asiguratorul nu va mai putea fi selectat pe viitoarele dosare de daună.' : 'Asiguratorul va fi din nou disponibil.'}
        confirmLabel="Confirmă"
        onConfirm={() => { schimbaStatus(confirmStatus!.id, confirmStatus!.action); setConfirmStatus(null); }}
        onCancel={() => setConfirmStatus(null)}
      />
    </div>
  );
}