// src/modules/01entitati/client/Client.tsx
import { useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Search, Users, Building, Wallet, PenLine, Ban, CheckCircle2, ArrowUpDown } from 'lucide-react';
import { PageHeader } from '../../../componente/ui/PageHeader';
import { StatCard } from '../../../componente/ui/StatCard';
import { Card, CardContent } from '../../../componente/ui/Card';
import { Field } from '../../../componente/ui/Field';
import { SelectField } from '../../../componente/ui/SelectField';
import { Button } from '../../../componente/ui/Button';
import { ConfirmDialog } from '../../../componente/ui/ConfirmDialog';
import { EmptyState } from '../../../componente/ui/EmptyState';
import { clientSchema, type ClientFormValues } from '../schemas';
import { useClient, type SortFieldClient } from './useClient';
import type { ClientEntity } from '../entitati.service';

export function Client() {
  const { listaFiltrata, loading, cautare, setCautare, arataInactivi, setArataInactivi, sortField, sortDir, toggleSort, salveaza, schimbaStatus, stats } = useClient();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [confirmStatus, setConfirmStatus] = useState<{ id: number, action: 'Activ' | 'Inactiv' } | null>(null);

  const { register, control, handleSubmit, formState: { errors }, reset } = useForm<ClientFormValues>({
    resolver: zodResolver(clientSchema),
    defaultValues: { tipClient: 'PF', soldDebitor: 0, status: 'Activ' }
  });

  const tipClient = useWatch({ control, name: 'tipClient' });

  const deschideAdaugare = () => { reset({ tipClient: 'PF', soldDebitor: 0, status: 'Activ' }); setEditId(null); setIsFormOpen(true); };
  const deschideEditare = (client: ClientEntity) => { reset(client); setEditId(client.idClient); setIsFormOpen(true); };
  
  const onSubmit = async (data: ClientFormValues) => {
    await salveaza(data, editId ?? undefined);
    setIsFormOpen(false);
  };

  const renderSortIcon = (field: SortFieldClient) => {
    if (sortField !== field) return <ArrowUpDown className="h-3 w-3 opacity-30" />;
    return <span className="text-indigo-600 font-bold text-xs">{sortDir === 'asc' ? '↑' : '↓'}</span>;
  };

  if (loading) return <div className="py-12 text-center text-slate-500">Se încarcă baza de date...</div>;

  return (
    <div className="space-y-6 pb-10">
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
          <Users className="w-64 h-64 text-indigo-900" />
        </div>
        <div className="relative z-10">
        <PageHeader 
          title="Gestiune Clienți" 
          description="Administrează clienții și datele necesare pentru facturare și relația comercială."
          actions={
            <Button variant={isFormOpen ? "outline" : "primary"} onClick={isFormOpen ? () => setIsFormOpen(false) : deschideAdaugare}>
              {isFormOpen ? 'Închide Formularul' : '+ Adaugă Client'}
            </Button>
          }
        />
        <div className="flex flex-wrap gap-4 mt-6">
          <StatCard label="Clienți Activi" value={stats.totalActivi} icon={<Users />} />
          <StatCard label="Persoane Juridice" value={stats.totalPJ} tone="info" icon={<Building />} />
          <StatCard label="Sold Total Debitor" value={`${stats.soldTotal.toLocaleString()} RON`} tone="warning" icon={<Wallet />} />
        </div>
        </div>
      </div>

      <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:max-w-md">
          <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
          <input 
            type="text" placeholder="Caută nume, CUI, CNP..." 
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
          <h4 className="mb-6 text-lg font-bold text-slate-800 border-b border-slate-100 pb-3">{editId ? 'Editare Profil Client' : 'Adăugare Client Nou'}</h4>
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
            <div className="flex justify-end gap-3 pt-4 border-t border-slate-50">
              <Button type="button" variant="outline" onClick={() => setIsFormOpen(false)}>Anulează</Button>
              <Button type="submit" variant="primary">Salvează Datele</Button>
            </div>
          </form>
        </div>
      )}

      <Card className="overflow-hidden border-slate-100 shadow-sm">
        <CardContent className="p-0">
          {listaFiltrata.length === 0 ? (
             <div className="py-12"><EmptyState icon={<Users />} title="Niciun client găsit" description="Modifică filtrele sau adaugă un client nou." actionLabel="+ Adaugă Client" onAction={deschideAdaugare} /></div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead className="bg-slate-50 text-[10px] font-bold uppercase text-slate-400 border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-4 cursor-pointer hover:bg-slate-100 transition-colors" onClick={() => toggleSort('nume')}>
                      Nume / Companie {renderSortIcon('nume')}
                    </th>
                    <th className="px-6 py-4 cursor-pointer hover:bg-slate-100 transition-colors" onClick={() => toggleSort('telefon')}>
                      Contact {renderSortIcon('telefon')}
                    </th>
                    <th className="px-6 py-4 cursor-pointer hover:bg-slate-100 transition-colors" onClick={() => toggleSort('soldDebitor')}>
                      Sold Debitor {renderSortIcon('soldDebitor')}
                    </th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-center">Acțiuni</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {listaFiltrata.map(client => (
                    <tr key={client.idClient} className={`hover:bg-slate-50 transition-colors group ${client.status === 'Inactiv' ? 'opacity-60' : ''}`}>
                      <td className="px-6 py-4 font-bold text-slate-800">
                        {client.nume} {client.prenume} <br/>
                        <span className="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded mt-1 inline-block font-mono">{client.tipClient === 'PJ' ? `CUI: ${client.CUI}` : `CNP: ${client.CNP}`}</span>
                      </td>
                      <td className="px-6 py-4 text-slate-600">{client.telefon}<br/><span className="text-xs text-slate-400">{client.email}</span></td>
                      <td className={`px-6 py-4 font-bold ${client.soldDebitor > 0 ? 'text-amber-600' : 'text-slate-800'}`}>{client.soldDebitor.toLocaleString()} RON</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${client.status === 'Activ' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>{client.status}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button variant="ghost" size="sm" onClick={() => deschideEditare(client)}><PenLine className="h-4 w-4" /></Button>
                          {client.status === 'Activ' ? (
                            <Button variant="ghost" size="sm" className="text-rose-500" onClick={() => setConfirmStatus({ id: client.idClient, action: 'Inactiv' })}><Ban className="h-4 w-4" /></Button>
                          ) : (
                            <Button variant="ghost" size="sm" className="text-emerald-500" onClick={() => setConfirmStatus({ id: client.idClient, action: 'Activ' })}><CheckCircle2 className="h-4 w-4" /></Button>
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
        title={confirmStatus?.action === 'Inactiv' ? 'Dezactivare Client' : 'Reactivare Client'}
        description={confirmStatus?.action === 'Inactiv' ? 'Clientul va fi arhivat și nu va mai putea plasa noi comenzi.' : 'Clientul va redeveni activ în sistem.'}
        confirmLabel="Confirmă"
        onConfirm={() => { schimbaStatus(confirmStatus!.id, confirmStatus!.action); setConfirmStatus(null); }}
        onCancel={() => setConfirmStatus(null)}
      />
    </div>
  );
}