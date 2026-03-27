// Ecranul de clienți combină mai multe concepte utile pentru un junior:
// formular validat, filtrare, sortare, paginare și schimbarea statusului local.
import { useState, useMemo } from 'react';
import { Building2, Users } from 'lucide-react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { Button } from '../../../componente/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../componente/ui/Card';
import { ConfirmDialog } from '../../../componente/ui/ConfirmDialog';
import { EmptyState } from '../../../componente/ui/EmptyState';
import { Field } from '../../../componente/ui/Field';
import { PageHeader } from '../../../componente/ui/PageHeader';
import { SelectField } from '../../../componente/ui/SelectField';
import { StatCard } from '../../../componente/ui/StatCard';
import { clientiEntitateMock } from '../../../mock/entitati';
import type { Client as ClientType } from '../../../types/entitati';
import { clientSchema, type ClientFormValues } from '../schemas';

const valoriInitiale: ClientFormValues = {
  tipClient: 'PF',
  status: 'Activ',
  nume: '',
  prenume: '',
  telefon: '',
  email: '',
  adresa: '',
  soldDebitor: 0,
  CNP: '',
  serieCI: '',
  CUI: '',
  IBAN: '',
  nrRegCom: '',
};

const calculeazaUrmatorulIdClient = (clienti: ClientType[]) =>
  clienti.reduce((maximCurent, client) => Math.max(maximCurent, client.idClient), 0) + 1;

export default function Client() {
  const [clienti, setClienti] = useState<ClientType[]>(clientiEntitateMock);
  const [modLucru, setModLucru] = useState<'vizualizare' | 'adaugare' | 'modificare'>('vizualizare');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [tipClientSelectat, setTipClientSelectat] = useState<ClientFormValues['tipClient']>('PF');
  
  const [searchTerm, setSearchTerm] = useState('');
  const [arataInactivi, setArataInactivi] = useState(false);
  const [sortConfig, setSortConfig] = useState<{ key: keyof ClientType; direction: 'asc' | 'desc' } | null>(null);
  const [paginaCurenta, setPaginaCurenta] = useState(1);
  const inregistrariPePagina = 10;

  const [idPentruDezactivare, setIdPentruDezactivare] = useState<number | null>(null);

  const { formState: { errors }, handleSubmit, register, reset } = useForm<ClientFormValues>({
    resolver: zodResolver(clientSchema),
    defaultValues: valoriInitiale,
  });

  // `useMemo` recalculază lista derivată doar când se schimbă dependențele importante.
  const dateProcesate = useMemo(() => {
    const prelucrate = clienti.filter(c => {
      const statusCurent = c.status || 'Activ';
      const matchStatus = arataInactivi ? true : statusCurent === 'Activ';
      const term = searchTerm.toLowerCase();
      
      // Protecție anti-crash în caz de mock data incomplet:
      const matchCautare = 
        (c.nume || '').toLowerCase().includes(term) ||
        (c.prenume || '').toLowerCase().includes(term) ||
        (c.CUI || '').toLowerCase().includes(term) ||
        (c.CNP || '').toLowerCase().includes(term) ||
        (c.telefon || '').includes(term);
      
      return matchStatus && matchCautare;
    });

    if (sortConfig !== null) {
      prelucrate.sort((a, b) => {
        const aValue = a[sortConfig.key] ?? '';
        const bValue = b[sortConfig.key] ?? '';
        if (typeof aValue === 'string' && typeof bValue === 'string') {
          return sortConfig.direction === 'asc' ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
        }
        if (typeof aValue === 'number' && typeof bValue === 'number') {
          return sortConfig.direction === 'asc' ? aValue - bValue : bValue - aValue;
        }
        return 0;
      });
    }
    return prelucrate;
  }, [clienti, searchTerm, sortConfig, arataInactivi]);

  const totalPagini = Math.ceil(dateProcesate.length / inregistrariPePagina) || 1;
  const clientiPaginati = dateProcesate.slice((paginaCurenta - 1) * inregistrariPePagina, paginaCurenta * inregistrariPePagina);

  const handleSort = (key: keyof ClientType) => {
    // Dacă apăsăm din nou aceeași coloană, inversăm sensul sortării.
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') direction = 'desc';
    setSortConfig({ key, direction });
  };

  const getSortIcon = (key: keyof ClientType) => {
    if (sortConfig?.key !== key) return <span className="text-slate-300 ml-1">↕</span>;
    return sortConfig.direction === 'asc' ? <span className="text-indigo-600 ml-1">↑</span> : <span className="text-indigo-600 ml-1">↓</span>;
  };

  const incepeAdaugare = () => {
    setModLucru('adaugare');
    setEditingId(null);
    setTipClientSelectat('PF');
    reset(valoriInitiale);
  };

  const incepeEditare = (client: ClientType) => {
    // La editare populăm formularul cu datele clientului existent.
    // Pentru câmpurile opționale folosim fallback-uri, ca input-urile să rămână controlate.
    setModLucru('modificare');
    setEditingId(client.idClient);
    setTipClientSelectat(client.tipClient);
    reset({
      ...client,
      status: client.status ?? 'Activ',
      prenume: client.prenume ?? '',
      CNP: client.CNP ?? '',
      serieCI: client.serieCI ?? '',
      CUI: client.CUI ?? '',
      IBAN: client.IBAN ?? '',
      nrRegCom: client.nrRegCom ?? '',
    });
  };

  const revinoLaLista = () => {
    setModLucru('vizualizare');
    setEditingId(null);
    setTipClientSelectat('PF');
    reset(valoriInitiale);
  };

  const handleSalvare = handleSubmit((values) => {
    const clientSalvat: ClientType = {
      idClient: editingId ?? calculeazaUrmatorulIdClient(clienti),
      ...values,
      prenume: values.tipClient === 'PF' ? values.prenume || undefined : undefined,
      CNP: values.tipClient === 'PF' ? values.CNP || undefined : undefined,
      serieCI: values.tipClient === 'PF' ? values.serieCI || undefined : undefined,
      CUI: values.tipClient === 'PJ' ? values.CUI || undefined : undefined,
      IBAN: values.tipClient === 'PJ' ? values.IBAN || undefined : undefined,
      nrRegCom: values.tipClient === 'PJ' ? values.nrRegCom || undefined : undefined,
    };

    if (editingId !== null) {
      setClienti((prev) => prev.map((c) => (c.idClient === editingId ? clientSalvat : c)));
      toast.success('Clientul a fost actualizat.');
    } else {
      setClienti((prev) => [...prev, clientSalvat]);
      toast.success('Clientul a fost adăugat.');
    }
    revinoLaLista();
  });

  const handleToggleStatus = () => {
    if (idPentruDezactivare === null) return;
    setClienti((prev) =>
      prev.map((c) => {
        if (c.idClient === idPentruDezactivare) {
          const noulStatus = (c.status || 'Activ') === 'Activ' ? 'Inactiv' : 'Activ';
          toast.success(`Clientul a fost marcat ca ${noulStatus}.`);
          return { ...c, status: noulStatus };
        }
        return c;
      })
    );
    setIdPentruDezactivare(null); // REPARAT: Folosim `set...`
  };

  const activi = clienti.filter(c => (c.status || 'Activ') === 'Activ');
  const totalPf = activi.filter((client) => client.tipClient === 'PF').length;
  const totalPj = activi.length - totalPf;
  const soldTotal = activi.reduce((total, client) => total + (client.soldDebitor || 0), 0);

  return (
    <Card className="p-8">
      <PageHeader
        title="Gestiune Clienți"
        description="Administrează clienții și datele necesare pentru facturare și relația comercială."
        actions={modLucru === 'vizualizare' ? <Button onClick={incepeAdaugare}>+ Adaugă Client</Button> : null}
      />

      <div className="mb-6 grid gap-3 md:grid-cols-3">
        <StatCard label="Clienți Activi" value={activi.length} icon={<Users className="h-4 w-4" />} />
        <StatCard label="Persoane juridice (Activi)" value={totalPj} tone="info" icon={<Building2 className="h-4 w-4" />} />
        <StatCard label="Sold total (Activi)" value={`${soldTotal} RON`} tone="warning" />
      </div>

      {modLucru === 'vizualizare' ? (
        <>
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 mb-6 flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="w-full sm:w-96 relative">
              <svg className="w-5 h-5 absolute left-3 top-2.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Caută nume, CUI, CNP, telefon..."
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); setPaginaCurenta(1); }}
                className="w-full border border-slate-200 pl-10 p-2 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>
            <div className="flex items-center gap-2">
              <input 
                type="checkbox" 
                id="arataInactivi" 
                checked={arataInactivi} 
                onChange={(e) => { setArataInactivi(e.target.checked); setPaginaCurenta(1); }}
                className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4 cursor-pointer"
              />
              <label htmlFor="arataInactivi" className="text-sm text-slate-600 cursor-pointer font-medium">Afișează și inactivi</label>
            </div>
          </div>

          {clientiPaginati.length === 0 ? (
            <EmptyState title="Nu există clienți" description="Nu am găsit rezultate conform filtrelor tale." />
          ) : (
            <>
              <div className="overflow-x-auto rounded-xl border border-slate-200 mb-4">
                <table className="w-full text-left text-sm">
                  <thead className="border-b border-slate-200 bg-slate-50 text-slate-500">
                    <tr>
                      <th className="p-4 font-semibold cursor-pointer hover:bg-slate-100" onClick={() => handleSort('nume')}>Nume / Companie {getSortIcon('nume')}</th>
                      <th className="p-4 font-semibold text-center cursor-pointer hover:bg-slate-100" onClick={() => handleSort('tipClient')}>Tip {getSortIcon('tipClient')}</th>
                      <th className="p-4 font-semibold">Contact</th>
                      <th className="p-4 font-semibold cursor-pointer hover:bg-slate-100" onClick={() => handleSort('soldDebitor')}>Sold Debitor {getSortIcon('soldDebitor')}</th>
                      <th className="p-4 text-center font-semibold">Status</th>
                      <th className="p-4 text-center font-semibold">Acțiuni</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {clientiPaginati.map((client) => {
                      const clientStatus = client.status || 'Activ';
                      return (
                      <tr key={client.idClient} className={`transition-colors ${clientStatus === 'Inactiv' ? 'bg-slate-50 opacity-60' : 'hover:bg-slate-50'}`}>
                        <td className="p-4">
                          <div className="font-bold text-slate-800">{client.tipClient === 'PF' ? `${client.nume || '-'} ${client.prenume || ''}` : client.nume || '-'}</div>
                          <div className="text-xs font-medium text-slate-500 mt-1">{client.tipClient === 'PF' ? `CNP: ${client.CNP || '-'}` : `CUI: ${client.CUI || '-'}`}</div>
                        </td>
                        <td className="p-4 align-middle">
                          <div className="flex justify-center">
                            <span className="rounded-full bg-indigo-100 px-3 py-1 text-xs font-bold text-indigo-700">{client.tipClient}</span>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="text-slate-700 font-medium">{client.telefon || '-'}</div>
                          <div className="text-slate-500 text-xs">{client.email || '-'}</div>
                        </td>
                        <td className="p-4 font-bold text-slate-800">{client.soldDebitor || 0} RON</td>
                        <td className="p-4 text-center">
                           <span className={`px-2 py-1 rounded text-xs font-bold ${clientStatus === 'Activ' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>{clientStatus}</span>
                        </td>
                        <td className="p-4">
                          <div className="flex justify-center gap-2">
                            <Button variant="ghost" size="sm" onClick={() => incepeEditare(client)}>Editează</Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className={clientStatus === 'Activ' ? 'border-rose-200 text-rose-600 hover:bg-rose-50' : 'border-emerald-200 text-emerald-600 hover:bg-emerald-50'}
                              onClick={() => {
                                if(clientStatus === 'Inactiv') {
                                   setClienti(prev => prev.map(c => c.idClient === client.idClient ? {...c, status: 'Activ'} : c));
                                   toast.success('Client reactivat!');
                                } else {
                                   setIdPentruDezactivare(client.idClient);
                                }
                              }}
                            >
                              {clientStatus === 'Activ' ? 'Dezactivează' : 'Reactivează'}
                            </Button>
                          </div>
                        </td>
                      </tr>
                    )})}
                  </tbody>
                </table>
              </div>
              <div className="flex items-center justify-between border-t border-slate-200 pt-4">
                <span className="text-sm text-slate-500">Se afișează {((paginaCurenta - 1) * inregistrariPePagina) + 1} - {Math.min(paginaCurenta * inregistrariPePagina, dateProcesate.length)} din {dateProcesate.length} clienți</span>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => setPaginaCurenta(p => Math.max(1, p - 1))} disabled={paginaCurenta === 1}>Înapoi</Button>
                  <span className="flex items-center px-4 text-sm font-medium bg-slate-50 rounded-lg border border-slate-200">Pagina {paginaCurenta} din {totalPagini}</span>
                  <Button variant="outline" size="sm" onClick={() => setPaginaCurenta(p => Math.min(totalPagini, p + 1))} disabled={paginaCurenta === totalPagini}>Înainte</Button>
                </div>
              </div>
            </>
          )}
        </>
      ) : (
        <Card className="border-slate-200 bg-slate-50 shadow-none">
          <CardHeader>
            <CardTitle className="text-xl">{modLucru === 'adaugare' ? 'Adăugare Client Nou' : 'Modificare Client'}</CardTitle>
            <CardDescription>Alege tipul clientului pentru a afișa câmpurile corespunzătoare.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSalvare} className="space-y-6">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <SelectField label="Tip Client" value={tipClientSelectat} options={[{ label: 'Persoană Fizică (PF)', value: 'PF' }, { label: 'Persoană Juridică (PJ)', value: 'PJ' }]} error={errors.tipClient?.message} {...register('tipClient', { onChange: (e) => setTipClientSelectat(e.target.value as ClientFormValues['tipClient']) })} />
                <input type="hidden" value="Activ" {...register('status')} />
                <div className="hidden md:block"></div>

                {tipClientSelectat === 'PF' ? (
                  <>
                    <Field label="Nume (Familie)" error={errors.nume?.message} {...register('nume')} />
                    <Field label="Prenume" error={errors.prenume?.message} {...register('prenume')} />
                    <Field label="CNP" error={errors.CNP?.message} {...register('CNP')} />
                    <Field label="Serie CI" error={errors.serieCI?.message} {...register('serieCI')} />
                  </>
                ) : (
                  <>
                    <div className="md:col-span-2"><Field label="Denumire Companie" error={errors.nume?.message} {...register('nume')} /></div>
                    <Field label="CUI" error={errors.CUI?.message} {...register('CUI')} />
                    <Field label="Nr. Reg. Comerțului" error={errors.nrRegCom?.message} {...register('nrRegCom')} />
                    <div className="md:col-span-2"><Field label="Cont IBAN" error={errors.IBAN?.message} {...register('IBAN')} /></div>
                  </>
                )}

                <div className="md:col-span-2 mt-2 mb-2"><hr className="border-slate-200"/></div>
                <Field label="Telefon" error={errors.telefon?.message} {...register('telefon')} />
                <Field label="Email" type="email" error={errors.email?.message} {...register('email')} />
                <div className="md:col-span-2"><Field label="Adresă" error={errors.adresa?.message} {...register('adresa')} /></div>
                <Field label="Sold Debitor (RON)" type="number" step="0.01" error={errors.soldDebitor?.message} {...register('soldDebitor', { valueAsNumber: true })} />
              </div>

              <div className="flex flex-wrap gap-3 pt-4">
                <Button type="submit">Salvează Datele</Button>
                <Button type="button" variant="outline" onClick={revinoLaLista}>Renunță</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <ConfirmDialog
        isOpen={idPentruDezactivare !== null}
        title="Dezactivezi clientul?"
        description="Clientul nu va mai apărea în listele curente de operare, dar va fi păstrat în istoric. Poți să îl reactivezi oricând bifând filtrul 'Afișează inactivi'."
        confirmLabel="Dezactivează"
        onCancel={() => setIdPentruDezactivare(null)}
        onConfirm={handleToggleStatus}
      />
    </Card>
  );
}
