// src/modules/01entitati/client/Client.tsx
import { useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Search, Users, Building, Wallet, PenLine, Ban, CheckCircle2 } from 'lucide-react';
import { PageHeader } from '../../../componente/ui/PageHeader';
import { StatCard } from '../../../componente/ui/StatCard';
import { Card, CardContent } from '../../../componente/ui/Card';
import { Field } from '../../../componente/ui/Field';
import { SelectField } from '../../../componente/ui/SelectField';
import { Button } from '../../../componente/ui/Button';
import { ConfirmDialog } from '../../../componente/ui/ConfirmDialog';
import { EmptyState } from '../../../componente/ui/EmptyState';
import { clientSchema, type ClientFormValues } from '../schemas';
import { useClient } from './useClient';
import type { ClientEntity } from '../entitati.service';

export function Client() {
  const { listaFiltrata, loading, cautare, setCautare, arataInactivi, setArataInactivi, salveaza, schimbaStatus, stats } = useClient();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [confirmStatus, setConfirmStatus] = useState<{ id: number, action: 'Activ' | 'Inactiv' } | null>(null);

  // Am scos `watch` de aici și am adus `control`
  const { register, control, handleSubmit, formState: { errors }, reset } = useForm<ClientFormValues>({
    resolver: zodResolver(clientSchema),
    defaultValues: { tipClient: 'PF', soldDebitor: 0, status: 'Activ' }
  });

  // Am folosit useWatch pentru a nu sparge memoizarea React Compiler-ului
  const tipClient = useWatch({
    control,
    name: 'tipClient',
  });

  const deschideAdaugare = () => { reset({ tipClient: 'PF', soldDebitor: 0, status: 'Activ' }); setEditId(null); setIsFormOpen(true); };
  const deschideEditare = (client: ClientEntity) => { reset(client); setEditId(client.idClient); setIsFormOpen(true); };
  
  const onSubmit = async (data: ClientFormValues) => {
    await salveaza(data, editId ?? undefined);
    setIsFormOpen(false);
  };

  if (loading) return <div className="py-12 text-center text-slate-500">Se încarcă datele...</div>;

  return (
    <div className="space-y-6 pb-10">
      <PageHeader 
        title="Gestiune Clienți" 
        description="Administrează clienții și datele necesare pentru facturare și relația comercială."
        actions={
          <Button variant={isFormOpen ? "outline" : "primary"} onClick={isFormOpen ? () => setIsFormOpen(false) : deschideAdaugare}>
            {isFormOpen ? 'Închide Formularul' : '+ Adaugă Client'}
          </Button>
        }
      />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <StatCard label="Clienți Activi" value={stats.totalActivi} icon={<Users />} />
        <StatCard label="Persoane Juridice (Activi)" value={stats.totalPJ} tone="info" icon={<Building />} />
        <StatCard label="Sold Total (Activi)" value={`${stats.soldTotal.toLocaleString()} RON`} tone="warning" icon={<Wallet />} />
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
            <div className="relative w-full md:max-w-md">
              <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
              <input 
                type="text" placeholder="Caută nume, CUI, CNP..." 
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
              <h3 className="mb-4 text-lg font-bold text-slate-800">{editId ? 'Editare Client' : 'Adăugare Client Nou'}</h3>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <SelectField 
                  label="Tip Client" options={[{ label: 'Persoană Fizică (PF)', value: 'PF' }, { label: 'Persoană Juridică (PJ)', value: 'PJ' }]}
                  {...register('tipClient')} error={errors.tipClient?.message} 
                />
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  {tipClient === 'PF' ? (
                    <>
                      <Field label="Nume *" {...register('nume')} error={errors.nume?.message} />
                      <Field label="Prenume *" {...register('prenume')} error={errors.prenume?.message} />
                      <Field label="CNP *" {...register('CNP')} error={errors.CNP?.message} />
                      <Field label="Serie și Nr. CI *" {...register('serieCI')} error={errors.serieCI?.message} />
                    </>
                  ) : (
                    <>
                      <Field label="Denumire Companie *" wrapperClassName="md:col-span-2" {...register('nume')} error={errors.nume?.message} />
                      <Field label="CUI *" placeholder="RO..." {...register('CUI')} error={errors.CUI?.message} />
                      <Field label="Nr. Reg. Comerțului *" {...register('nrRegCom')} error={errors.nrRegCom?.message} />
                      <Field label="Cont IBAN" wrapperClassName="md:col-span-2" {...register('IBAN')} />
                    </>
                  )}
                  <Field label="Telefon *" {...register('telefon')} error={errors.telefon?.message} />
                  <Field label="Email" type="email" {...register('email')} error={errors.email?.message} />
                  <Field label="Adresă *" wrapperClassName="md:col-span-2" {...register('adresa')} error={errors.adresa?.message} />
                  <Field label="Sold Debitor Inițial (RON)" type="number" step="0.01" {...register('soldDebitor', { valueAsNumber: true })} error={errors.soldDebitor?.message} />
                </div>
                <div className="flex justify-end gap-3 pt-4">
                  <Button type="button" variant="ghost" onClick={() => setIsFormOpen(false)}>Renunță</Button>
                  <Button type="submit" variant="primary">Salvează Datele</Button>
                </div>
              </form>
            </div>
          )}

          {listaFiltrata.length === 0 ? (
             <EmptyState icon={<Users />} title="Niciun client găsit" description="Modifică filtrele sau adaugă un client nou." actionLabel="+ Adaugă Client" onAction={deschideAdaugare} />
          ) : (
            <div className="overflow-x-auto rounded-xl border border-slate-200">
              <table className="min-w-full text-left text-sm">
                <thead className="bg-slate-50 text-xs uppercase text-slate-500 border-b border-slate-200">
                  <tr><th className="px-6 py-4">Nume / Companie</th><th className="px-6 py-4">Contact</th><th className="px-6 py-4">Sold</th><th className="px-6 py-4">Status</th><th className="px-6 py-4 text-right">Acțiuni</th></tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {listaFiltrata.map(client => (
                    <tr key={client.idClient} className={`hover:bg-slate-50 ${client.status === 'Inactiv' ? 'opacity-60' : ''}`}>
                      <td className="px-6 py-4 font-medium text-slate-800">
                        {client.nume} {client.prenume} <br/>
                        <span className="text-xs text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded mt-1 inline-block">{client.tipClient === 'PJ' ? `CUI: ${client.CUI}` : `CNP: ${client.CNP}`}</span>
                      </td>
                      <td className="px-6 py-4 text-slate-600">{client.telefon}<br/><span className="text-xs">{client.email}</span></td>
                      <td className="px-6 py-4 font-bold text-slate-800">{client.soldDebitor} RON</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded text-xs font-bold ${client.status === 'Activ' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>{client.status}</span>
                      </td>
                      <td className="px-6 py-4 text-right space-x-2">
                        <Button variant="ghost" size="sm" onClick={() => deschideEditare(client)}><PenLine className="h-4 w-4" /></Button>
                        {client.status === 'Activ' ? (
                          <Button variant="ghost" size="sm" className="text-rose-600" onClick={() => setConfirmStatus({ id: client.idClient, action: 'Inactiv' })}><Ban className="h-4 w-4" /></Button>
                        ) : (
                          <Button variant="ghost" size="sm" className="text-emerald-600" onClick={() => setConfirmStatus({ id: client.idClient, action: 'Activ' })}><CheckCircle2 className="h-4 w-4" /></Button>
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
        title={confirmStatus?.action === 'Inactiv' ? 'Dezactivare Client' : 'Reactivare Client'}
        description={confirmStatus?.action === 'Inactiv' ? 'Clientul va fi arhivat (Soft Delete) și nu va mai putea plasa noi comenzi.' : 'Clientul va redeveni activ în sistem.'}
        confirmLabel="Confirmă"
        onConfirm={() => { schimbaStatus(confirmStatus!.id, confirmStatus!.action); setConfirmStatus(null); }}
        onCancel={() => setConfirmStatus(null)}
      />
    </div>
  );
}