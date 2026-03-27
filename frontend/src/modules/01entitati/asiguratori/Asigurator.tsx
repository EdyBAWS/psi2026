// CRUD-ul de asiguratori este mai simplu, dar păstrează aceeași structură:
// formular validat, listă filtrabilă și schimbare de status local.
import { useState, useMemo } from 'react';
import { ShieldCheck, Users } from 'lucide-react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { Button } from '../../../componente/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../componente/ui/Card';
import { ConfirmDialog } from '../../../componente/ui/ConfirmDialog';
import { EmptyState } from '../../../componente/ui/EmptyState';
import { Field } from '../../../componente/ui/Field';
import { PageHeader } from '../../../componente/ui/PageHeader';
import { StatCard } from '../../../componente/ui/StatCard';
import { asiguratoriEntitateMock } from '../../../mock/entitati';
import type { Asigurator as AsiguratorType } from '../../../types/entitati';
import { asiguratorSchema, type AsiguratorFormValues } from '../schemas';

const valoriInitiale: AsiguratorFormValues = {
  status: 'Activ',
  denumire: '',
  CUI: '',
  telefon: '',
};

const calculeazaUrmatorulIdAsigurator = (asiguratori: AsiguratorType[]) =>
  asiguratori.reduce((maximCurent, a) => Math.max(maximCurent, a.idAsigurator), 0) + 1;

export default function Asigurator() {
  const [asiguratori, setAsiguratori] = useState<AsiguratorType[]>(asiguratoriEntitateMock);
  const [modLucru, setModLucru] = useState<'vizualizare' | 'adaugare' | 'modificare'>('vizualizare');
  const [editingId, setEditingId] = useState<number | null>(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [arataInactivi, setArataInactivi] = useState(false);
  const [sortConfig, setSortConfig] = useState<{ key: keyof AsiguratorType; direction: 'asc' | 'desc' } | null>(null);
  const [paginaCurenta, setPaginaCurenta] = useState(1);
  const inregistrariPePagina = 10;

  const [idPentruDezactivare, setIdPentruDezactivare] = useState<number | null>(null);

  const { formState: { errors }, handleSubmit, register, reset } = useForm<AsiguratorFormValues>({
    resolver: zodResolver(asiguratorSchema),
    defaultValues: valoriInitiale,
  });

  // Și aici lista tabelului este derivată, nu afișăm direct array-ul brut.
  const dateProcesate = useMemo(() => {
    const prelucrate = asiguratori.filter(a => {
      const statusCurent = a.status || 'Activ';
      const matchStatus = arataInactivi ? true : statusCurent === 'Activ';
      const term = searchTerm.toLowerCase();
      
      const matchCautare = 
        (a.denumire || '').toLowerCase().includes(term) ||
        (a.CUI || '').toLowerCase().includes(term) ||
        (a.telefon || '').includes(term);
      
      return matchStatus && matchCautare;
    });

    if (sortConfig !== null) {
      prelucrate.sort((a, b) => {
        const aValue = a[sortConfig.key] ?? '';
        const bValue = b[sortConfig.key] ?? '';
        if (typeof aValue === 'string' && typeof bValue === 'string') {
          return sortConfig.direction === 'asc' ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
        }
        return 0;
      });
    }
    return prelucrate;
  }, [asiguratori, searchTerm, sortConfig, arataInactivi]);

  const totalPagini = Math.ceil(dateProcesate.length / inregistrariPePagina) || 1;
  const asiguratoriPaginati = dateProcesate.slice((paginaCurenta - 1) * inregistrariPePagina, paginaCurenta * inregistrariPePagina);

  const handleSort = (key: keyof AsiguratorType) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') direction = 'desc';
    setSortConfig({ key, direction });
  };

  const getSortIcon = (key: keyof AsiguratorType) => {
    if (sortConfig?.key !== key) return <span className="text-slate-300 ml-1">↕</span>;
    return sortConfig.direction === 'asc' ? <span className="text-indigo-600 ml-1">↑</span> : <span className="text-indigo-600 ml-1">↓</span>;
  };

  const incepeAdaugare = () => {
    setModLucru('adaugare');
    setEditingId(null);
    reset(valoriInitiale);
  };

  const incepeEditare = (asigurator: AsiguratorType) => {
    setModLucru('modificare');
    setEditingId(asigurator.idAsigurator);
    reset({
      ...asigurator,
      status: asigurator.status ?? 'Activ',
    });
  };

  const revinoLaLista = () => {
    setModLucru('vizualizare');
    setEditingId(null);
    reset(valoriInitiale);
  };

  const handleSalvare = handleSubmit((values) => {
    const asiguratorSalvat: AsiguratorType = {
      idAsigurator: editingId ?? calculeazaUrmatorulIdAsigurator(asiguratori),
      ...values,
    };

    if (editingId !== null) {
      setAsiguratori((prev) => prev.map((a) => (a.idAsigurator === editingId ? asiguratorSalvat : a)));
      toast.success('Asiguratorul a fost actualizat.');
    } else {
      setAsiguratori((prev) => [...prev, asiguratorSalvat]);
      toast.success('Asiguratorul a fost adăugat.');
    }
    revinoLaLista();
  });

  const handleToggleStatus = () => {
    if (idPentruDezactivare === null) return;
    setAsiguratori((prev) =>
      prev.map((a) => {
        if (a.idAsigurator === idPentruDezactivare) {
          const noulStatus = (a.status || 'Activ') === 'Activ' ? 'Inactiv' : 'Activ';
          toast.success(`Asiguratorul a fost marcat ca ${noulStatus}.`);
          return { ...a, status: noulStatus };
        }
        return a;
      })
    );
    setIdPentruDezactivare(null); // REPARAT: Folosim `set...`
  };

  const activi = asiguratori.filter(a => (a.status || 'Activ') === 'Activ');

  return (
    <Card className="p-8">
      <PageHeader
        title="Societăți Asigurare"
        description="Gestionează asiguratorii folosiți în dosarele de daună."
        actions={modLucru === 'vizualizare' ? <Button onClick={incepeAdaugare}>+ Adaugă Asigurator</Button> : null}
      />

      <div className="mb-6 grid gap-3 md:grid-cols-3">
        <StatCard label="Total asiguratori activi" value={activi.length} icon={<ShieldCheck className="h-4 w-4" />} />
        <StatCard label="Cu date complete" value={activi.filter((item) => item.telefon && item.CUI).length} tone="success" />
        <StatCard label="Parteneri (Toți)" value={asiguratori.length} tone="info" icon={<Users className="h-4 w-4" />} />
      </div>

      {modLucru === 'vizualizare' ? (
        <>
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 mb-6 flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="w-full sm:w-96 relative">
              <svg className="w-5 h-5 absolute left-3 top-2.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input type="text" placeholder="Caută după nume sau CUI..." value={searchTerm} onChange={(e) => { setSearchTerm(e.target.value); setPaginaCurenta(1); }} className="w-full border border-slate-200 pl-10 p-2 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" />
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" id="arataInactivi" checked={arataInactivi} onChange={(e) => { setArataInactivi(e.target.checked); setPaginaCurenta(1); }} className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4 cursor-pointer" />
              <label htmlFor="arataInactivi" className="text-sm text-slate-600 cursor-pointer font-medium">Afișează inactivi</label>
            </div>
          </div>

          {asiguratoriPaginati.length === 0 ? (
            <EmptyState title="Niciun rezultat" description="Nu am găsit asigurători conform filtrelor." />
          ) : (
            <>
              <div className="overflow-x-auto rounded-xl border border-slate-200 mb-4">
                <table className="w-full text-left text-sm">
                  <thead className="border-b border-slate-200 bg-slate-50 text-slate-500">
                    <tr>
                      <th className="p-4 font-semibold cursor-pointer hover:bg-slate-100" onClick={() => handleSort('denumire')}>Denumire Societate {getSortIcon('denumire')}</th>
                      <th className="p-4 font-semibold cursor-pointer hover:bg-slate-100" onClick={() => handleSort('CUI')}>CUI {getSortIcon('CUI')}</th>
                      <th className="p-4 font-semibold">Telefon</th>
                      <th className="p-4 font-semibold text-center">Status</th>
                      <th className="p-4 text-center font-semibold">Acțiuni</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {asiguratoriPaginati.map((asigurator) => {
                      const asigStatus = asigurator.status || 'Activ';
                      return (
                      <tr key={asigurator.idAsigurator} className={`transition-colors ${asigStatus === 'Inactiv' ? 'bg-slate-50 opacity-60' : 'hover:bg-slate-50'}`}>
                        <td className="p-4 font-bold text-slate-800">{asigurator.denumire || '-'}</td>
                        <td className="p-4 text-slate-600">{asigurator.CUI || '-'}</td>
                        <td className="p-4 text-slate-600">{asigurator.telefon || '-'}</td>
                        <td className="p-4 text-center">
                           <span className={`px-2 py-1 rounded text-xs font-bold ${asigStatus === 'Activ' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>{asigStatus}</span>
                        </td>
                        <td className="p-4">
                          <div className="flex justify-center gap-2">
                            <Button variant="ghost" size="sm" onClick={() => incepeEditare(asigurator)}>Editează</Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className={asigStatus === 'Activ' ? 'border-rose-200 text-rose-600 hover:bg-rose-50' : 'border-emerald-200 text-emerald-600 hover:bg-emerald-50'}
                              onClick={() => {
                                if(asigStatus === 'Inactiv') {
                                   setAsiguratori(prev => prev.map(a => a.idAsigurator === asigurator.idAsigurator ? {...a, status: 'Activ'} : a));
                                   toast.success('Asigurator reactivat!');
                                } else {
                                   setIdPentruDezactivare(asigurator.idAsigurator);
                                }
                              }}
                            >
                              {asigStatus === 'Activ' ? 'Dezactivează' : 'Reactivează'}
                            </Button>
                          </div>
                        </td>
                      </tr>
                    )})}
                  </tbody>
                </table>
              </div>
              <div className="flex items-center justify-between border-t border-slate-200 pt-4">
                <span className="text-sm text-slate-500">Afișare {((paginaCurenta - 1) * inregistrariPePagina) + 1} - {Math.min(paginaCurenta * inregistrariPePagina, dateProcesate.length)} din {dateProcesate.length}</span>
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
        <Card className="max-w-2xl border-slate-200 bg-slate-50 shadow-none">
          <CardHeader>
            <CardTitle className="text-xl">{modLucru === 'adaugare' ? 'Adăugare Asigurator' : 'Modificare Asigurator'}</CardTitle>
            <CardDescription>Adaugă detalii despre societatea de asigurare.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSalvare} className="space-y-4">
              <input type="hidden" value="Activ" {...register('status')} />
              <Field label="Denumire Societate" error={errors.denumire?.message} {...register('denumire')} />
              <Field label="CUI" error={errors.CUI?.message} {...register('CUI')} />
              <Field label="Telefon" error={errors.telefon?.message} {...register('telefon')} />
              <div className="flex flex-wrap gap-3 pt-4">
                <Button type="submit">Salvează</Button>
                <Button type="button" variant="outline" onClick={revinoLaLista}>Renunță</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <ConfirmDialog
        isOpen={idPentruDezactivare !== null}
        title="Dezactivezi asiguratorul?"
        description="Societatea nu va mai apărea în listele curente de operare. Poți să o reactivezi oricând bifând filtrul 'Afișează inactivi'."
        confirmLabel="Dezactivează"
        onCancel={() => setIdPentruDezactivare(null)}
        onConfirm={handleToggleStatus}
      />
    </Card>
  );
}
