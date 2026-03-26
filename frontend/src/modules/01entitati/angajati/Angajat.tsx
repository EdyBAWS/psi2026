import { useState, useMemo } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { Button } from '../../../componente/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../componente/ui/Card';
import { EmptyState } from '../../../componente/ui/EmptyState';
import { Field } from '../../../componente/ui/Field';
import { PageHeader } from '../../../componente/ui/PageHeader';
import { SelectField } from '../../../componente/ui/SelectField';
import type { Angajat as AngajatType } from '../../../types/entitati';
import { angajatSchema, type AngajatFormValues } from '../schemas';

const valoriInitiale: AngajatFormValues = {
  status: 'Activ',
  nume: '',
  prenume: '',
  CNP: '',
  telefon: '',
  email: '',
  tipAngajat: 'Mecanic',
  departament: '',
  sporConducere: 0,
  specializare: '',
  costOrar: 0,
  nrBirou: '',
  tura: '',
};

const calculeazaUrmatorulIdAngajat = (angajati: AngajatType[]) =>
  angajati.reduce((maximCurent, angajat) => Math.max(maximCurent, angajat.idAngajat), 0) + 1;

export default function Angajat() {
  const [angajati, setAngajati] = useState<AngajatType[]>([]);
  const [modLucru, setModLucru] = useState<'vizualizare' | 'adaugare' | 'modificare'>('vizualizare');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [tipAngajatSelectat, setTipAngajatSelectat] = useState<AngajatFormValues['tipAngajat']>('Mecanic');

  const [searchTerm, setSearchTerm] = useState('');
  const [arataInactivi, setArataInactivi] = useState(false);
  const [sortConfig, setSortConfig] = useState<{ key: keyof AngajatType; direction: 'asc' | 'desc' } | null>(null);
  const [paginaCurenta, setPaginaCurenta] = useState(1);
  const inregistrariPePagina = 10;

  const { formState: { errors }, handleSubmit, register, reset } = useForm<AngajatFormValues>({
    resolver: zodResolver(angajatSchema),
    defaultValues: valoriInitiale,
  });

  const dateProcesate = useMemo(() => {
    const prelucrate = angajati.filter(a => {
      const matchStatus = arataInactivi ? true : a.status === 'Activ';
      const term = searchTerm.toLowerCase();
      const matchCautare = 
        a.nume.toLowerCase().includes(term) ||
        a.prenume.toLowerCase().includes(term) ||
        a.tipAngajat.toLowerCase().includes(term) ||
        a.telefon.includes(term) ||
        (a.specializare && a.specializare.toLowerCase().includes(term)) ||
        (a.departament && a.departament.toLowerCase().includes(term));
      
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
  }, [angajati, searchTerm, sortConfig, arataInactivi]);

  const totalPagini = Math.ceil(dateProcesate.length / inregistrariPePagina) || 1;
  const angajatiPaginati = dateProcesate.slice((paginaCurenta - 1) * inregistrariPePagina, paginaCurenta * inregistrariPePagina);

  const handleSort = (key: keyof AngajatType) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') direction = 'desc';
    setSortConfig({ key, direction });
  };

  const getSortIcon = (key: keyof AngajatType) => {
    if (sortConfig?.key !== key) return <span className="text-slate-300 ml-1">↕</span>;
    return sortConfig.direction === 'asc' ? <span className="text-indigo-600 ml-1">↑</span> : <span className="text-indigo-600 ml-1">↓</span>;
  };

  const incepeAdaugare = () => {
    setModLucru('adaugare');
    setEditingId(null);
    setTipAngajatSelectat('Mecanic');
    reset(valoriInitiale);
  };

  const incepeEditare = (angajat: AngajatType) => {
    setModLucru('modificare');
    setEditingId(angajat.idAngajat);
    setTipAngajatSelectat(angajat.tipAngajat);
    reset({
      ...angajat,
      status: angajat.status ?? 'Activ',
      departament: angajat.departament ?? '',
      sporConducere: angajat.sporConducere ?? 0,
      specializare: angajat.specializare ?? '',
      costOrar: angajat.costOrar ?? 0,
      nrBirou: angajat.nrBirou ?? '',
      tura: angajat.tura ?? '',
    });
  };

  const revinoLaLista = () => {
    setModLucru('vizualizare');
    setEditingId(null);
    setTipAngajatSelectat('Mecanic');
    reset(valoriInitiale);
  };

  const handleSalvare = handleSubmit((values) => {
    const angajatSalvat: AngajatType = {
      idAngajat: editingId ?? calculeazaUrmatorulIdAngajat(angajati),
      ...values,
      departament: values.tipAngajat === 'Manager' ? values.departament || undefined : undefined,
      sporConducere: values.tipAngajat === 'Manager' ? values.sporConducere || undefined : undefined,
      specializare: values.tipAngajat === 'Mecanic' ? values.specializare || undefined : undefined,
      costOrar: values.tipAngajat === 'Mecanic' ? values.costOrar || undefined : undefined,
      nrBirou: values.tipAngajat === 'Receptioner' ? values.nrBirou || undefined : undefined,
      tura: values.tipAngajat === 'Receptioner' ? values.tura || undefined : undefined,
    };

    if (editingId !== null) {
      setAngajati((prev) => prev.map((a) => (a.idAngajat === editingId ? angajatSalvat : a)));
      toast.success('Angajatul a fost actualizat.');
    } else {
      setAngajati((prev) => [...prev, angajatSalvat]);
      toast.success('Angajatul a fost adăugat.');
    }
    revinoLaLista();
  });

  const handleToggleStatus = (id: number) => {
    setAngajati((prev) =>
      prev.map((a) => {
        if (a.idAngajat === id) {
          const noulStatus = a.status === 'Activ' ? 'Inactiv' : 'Activ';
          toast.success(`Angajatul a fost marcat ca ${noulStatus}.`);
          return { ...a, status: noulStatus };
        }
        return a;
      })
    );
  };

  return (
    <Card className="p-8">
      <PageHeader
        title="Gestiune Angajați"
        description="Administrează personalul și rolurile operaționale ale service-ului."
        actions={modLucru === 'vizualizare' ? <Button onClick={incepeAdaugare}>+ Adaugă Angajat</Button> : null}
      />

      {modLucru === 'vizualizare' ? (
        <>
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 mb-6 flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="w-full sm:w-96 relative">
              <svg className="w-5 h-5 absolute left-3 top-2.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Caută nume, telefon, specializare..."
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
              <label htmlFor="arataInactivi" className="text-sm text-slate-600 cursor-pointer font-medium">Afișează inactivi</label>
            </div>
          </div>

          {angajatiPaginati.length === 0 ? (
            <EmptyState title="Niciun rezultat" description="Nu am găsit angajați conform filtrelor." />
          ) : (
            <>
              <div className="overflow-x-auto rounded-xl border border-slate-200 mb-4">
                <table className="w-full text-left text-sm">
                  <thead className="border-b border-slate-200 bg-slate-50 text-slate-500">
                    <tr>
                      <th className="p-4 font-semibold cursor-pointer hover:bg-slate-100" onClick={() => handleSort('nume')}>Nume și Prenume {getSortIcon('nume')}</th>
                      <th className="p-4 font-semibold text-center cursor-pointer hover:bg-slate-100" onClick={() => handleSort('tipAngajat')}>Rol {getSortIcon('tipAngajat')}</th>
                      <th className="p-4 font-semibold">Contact</th>
                      <th className="p-4 font-semibold text-center">Status</th>
                      <th className="p-4 text-center font-semibold">Acțiuni</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {angajatiPaginati.map((angajat) => (
                      <tr key={angajat.idAngajat} className={`transition-colors ${angajat.status === 'Inactiv' ? 'bg-slate-50 opacity-60' : 'hover:bg-slate-50'}`}>
                        <td className="p-4 font-bold text-slate-800">
                          {angajat.nume} {angajat.prenume}
                          <div className="text-xs font-normal text-slate-500 mt-0.5">
                            {angajat.specializare || angajat.departament || `Tura: ${angajat.tura}`}
                          </div>
                        </td>
                        <td className="p-4 align-middle">
                          <div className="flex justify-center">
                            <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-bold text-indigo-700">{angajat.tipAngajat}</span>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="text-slate-700 font-medium">{angajat.telefon}</div>
                          <div className="text-slate-500 text-xs">{angajat.email}</div>
                        </td>
                        <td className="p-4 text-center">
                           <span className={`px-2 py-1 rounded text-xs font-bold ${angajat.status === 'Activ' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>{angajat.status}</span>
                        </td>
                        <td className="p-4">
                          <div className="flex justify-center gap-2">
                            <Button variant="ghost" size="sm" onClick={() => incepeEditare(angajat)}>Editează</Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className={angajat.status === 'Activ' ? 'border-rose-200 text-rose-600 hover:bg-rose-50' : 'border-emerald-200 text-emerald-600 hover:bg-emerald-50'}
                              onClick={() => handleToggleStatus(angajat.idAngajat)}
                            >
                              {angajat.status === 'Activ' ? 'Dezactivează' : 'Reactivează'}
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex items-center justify-between border-t border-slate-200 pt-4">
                <span className="text-sm text-slate-500">
                  Afișare {((paginaCurenta - 1) * inregistrariPePagina) + 1} - {Math.min(paginaCurenta * inregistrariPePagina, dateProcesate.length)} din {dateProcesate.length}
                </span>
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
            <CardTitle className="text-xl">{modLucru === 'adaugare' ? 'Adăugare Angajat' : 'Modificare Angajat'}</CardTitle>
            <CardDescription>Formularul validează condițional câmpurile în funcție de rol.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSalvare} className="space-y-6">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <input type="hidden" value="Activ" {...register('status')} />
                
                <Field label="Nume" error={errors.nume?.message} {...register('nume')} />
                <Field label="Prenume" error={errors.prenume?.message} {...register('prenume')} />
                <Field label="CNP" error={errors.CNP?.message} {...register('CNP')} />
                <Field label="Telefon" error={errors.telefon?.message} {...register('telefon')} />
                <Field label="Email" type="email" error={errors.email?.message} {...register('email')} />
                
                <SelectField
                  label="Rol Angajat"
                  value={tipAngajatSelectat}
                  options={[
                    { label: 'Manager', value: 'Manager' },
                    { label: 'Mecanic', value: 'Mecanic' },
                    { label: 'Recepționer', value: 'Receptioner' },
                  ]}
                  error={errors.tipAngajat?.message}
                  {...register('tipAngajat', {
                    onChange: (e) => setTipAngajatSelectat(e.target.value as AngajatFormValues['tipAngajat']),
                  })}
                />

                {tipAngajatSelectat === 'Manager' && (
                  <>
                    <Field label="Departament" error={errors.departament?.message} {...register('departament')} />
                    <Field label="Spor Conducere (RON)" type="number" error={errors.sporConducere?.message} {...register('sporConducere', { setValueAs: (v) => (v === '' ? undefined : Number(v)) })} />
                  </>
                )}
                {tipAngajatSelectat === 'Mecanic' && (
                  <>
                    <Field label="Specializare" error={errors.specializare?.message} {...register('specializare')} />
                    <Field label="Cost Orar (RON)" type="number" error={errors.costOrar?.message} {...register('costOrar', { setValueAs: (v) => (v === '' ? undefined : Number(v)) })} />
                  </>
                )}
                {tipAngajatSelectat === 'Receptioner' && (
                  <>
                    <Field label="Nr. Birou" error={errors.nrBirou?.message} {...register('nrBirou')} />
                    <Field label="Tura" error={errors.tura?.message} {...register('tura')} />
                  </>
                )}
              </div>

              <div className="flex flex-wrap gap-3 pt-4">
                <Button type="submit">Salvează</Button>
                <Button type="button" variant="outline" onClick={revinoLaLista}>Renunță</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}
    </Card>
  );
}