import { useState } from 'react';
import { BriefcaseBusiness, Users } from 'lucide-react';
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
import { angajatiEntitateMock } from '../../../mock/entitati';
import type { Angajat as AngajatType } from '../../../types/entitati';
import { angajatSchema, type AngajatFormValues } from '../schemas';

// Valorile inițiale sunt sursa unică pentru resetarea formularului.
const valoriInitiale: AngajatFormValues = {
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

// Calculăm următorul id în mod determinist din lista curentă.
const calculeazaUrmatorulIdAngajat = (angajati: AngajatType[]) =>
  angajati.reduce((maximCurent, angajat) => Math.max(maximCurent, angajat.idAngajat), 0) + 1;

// Pagina gestionează local lista de angajați și formularul de adăugare/editare.
export default function Angajat() {
  const [angajati, setAngajati] = useState<AngajatType[]>(angajatiEntitateMock);
  const [modLucru, setModLucru] = useState<'vizualizare' | 'adaugare' | 'modificare'>('vizualizare');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [idAngajatPentruStergere, setIdAngajatPentruStergere] = useState<number | null>(null);
  // Rolul selectat influențează direct ce grup de câmpuri este vizibil.
  const [tipAngajatSelectat, setTipAngajatSelectat] =
    useState<AngajatFormValues['tipAngajat']>('Mecanic');

  const {
    formState: { errors },
    handleSubmit,
    register,
    reset,
  } = useForm<AngajatFormValues>({
    resolver: zodResolver(angajatSchema),
    defaultValues: valoriInitiale,
  });

  // Adăugarea pornește dintr-un formular gol.
  const incepeAdaugare = () => {
    setModLucru('adaugare');
    setEditingId(null);
    setTipAngajatSelectat('Mecanic');
    reset(valoriInitiale);
  };

  const incepeEditare = (angajat: AngajatType) => {
    // La editare populăm formularul cu datele deja existente.
    setModLucru('modificare');
    setEditingId(angajat.idAngajat);
    setTipAngajatSelectat(angajat.tipAngajat);
    reset({
      nume: angajat.nume,
      prenume: angajat.prenume,
      CNP: angajat.CNP,
      telefon: angajat.telefon,
      email: angajat.email,
      tipAngajat: angajat.tipAngajat,
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
    // Aici convertim datele de formular în obiectul final salvat în listă.
    // Câmpurile opționale sunt păstrate doar dacă au sens pentru rolul ales.
    const angajatSalvat: AngajatType = {
      idAngajat: editingId ?? calculeazaUrmatorulIdAngajat(angajati),
      ...values,
      departament: values.tipAngajat === 'Manager' ? values.departament || undefined : undefined,
      sporConducere:
        values.tipAngajat === 'Manager' ? values.sporConducere || undefined : undefined,
      specializare:
        values.tipAngajat === 'Mecanic' ? values.specializare || undefined : undefined,
      costOrar: values.tipAngajat === 'Mecanic' ? values.costOrar || undefined : undefined,
      nrBirou:
        values.tipAngajat === 'Receptioner' ? values.nrBirou || undefined : undefined,
      tura: values.tipAngajat === 'Receptioner' ? values.tura || undefined : undefined,
    };

    if (editingId !== null) {
      setAngajati((previous) =>
        previous.map((angajat) =>
          angajat.idAngajat === editingId ? angajatSalvat : angajat,
        ),
      );
      toast.success('Angajatul a fost actualizat.');
    } else {
      setAngajati((previous) => [...previous, angajatSalvat]);
      toast.success('Angajatul a fost adăugat.');
    }

    revinoLaLista();
  });

  const handleStergere = () => {
    if (idAngajatPentruStergere === null) return;
    setAngajati((previous) =>
      previous.filter((angajat) => angajat.idAngajat !== idAngajatPentruStergere),
    );
    setIdAngajatPentruStergere(null);
    toast.success('Angajatul a fost șters.');
  };

  const totalMecanici = angajati.filter((angajat) => angajat.tipAngajat === 'Mecanic').length;
  const totalManageri = angajati.filter((angajat) => angajat.tipAngajat === 'Manager').length;

  return (
    <Card className="p-8">
      <PageHeader
        title="Gestiune Angajați"
        description="Administrează personalul și rolurile operaționale ale service-ului."
        actions={
          modLucru === 'vizualizare' ? (
            <Button onClick={incepeAdaugare}>+ Adaugă Angajat</Button>
          ) : null
        }
      />

      <div className="mb-6 grid gap-3 md:grid-cols-3">
        <StatCard label="Total angajați" value={angajati.length} icon={<Users className="h-4 w-4" />} />
        <StatCard label="Mecanici" value={totalMecanici} tone="info" icon={<BriefcaseBusiness className="h-4 w-4" />} />
        <StatCard label="Manageri" value={totalManageri} tone="warning" />
      </div>

      {modLucru === 'vizualizare' ? (
        angajati.length === 0 ? (
          <EmptyState
            title="Nu există angajați"
            description="Adaugă primul angajat pentru a popula modulele operaționale."
            actionLabel="Adaugă angajat"
            onAction={incepeAdaugare}
          />
        ) : (
          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-slate-200 bg-slate-50 text-slate-500">
                <tr>
                  <th className="p-4 font-semibold">Nume și Prenume</th>
                  <th className="p-4 font-semibold">Rol (Funcție)</th>
                  <th className="p-4 font-semibold">Telefon</th>
                  <th className="p-4 font-semibold">Email</th>
                  <th className="p-4 text-center font-semibold">Acțiuni</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {angajati.map((angajat) => (
                  <tr key={angajat.idAngajat} className="hover:bg-slate-50 transition-colors">
                    <td className="p-4 font-medium text-slate-700">
                      {angajat.nume} {angajat.prenume}
                    </td>
                    <td className="p-4">
                      <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-bold text-indigo-700">
                        {angajat.tipAngajat}
                      </span>
                    </td>
                    <td className="p-4 text-slate-600">{angajat.telefon}</td>
                    <td className="p-4 text-slate-600">{angajat.email}</td>
                    <td className="p-4">
                      <div className="flex justify-center gap-2">
                        <Button variant="ghost" size="sm" onClick={() => incepeEditare(angajat)}>
                          Editează
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-rose-200 text-rose-600 hover:bg-rose-50"
                          onClick={() => setIdAngajatPentruStergere(angajat.idAngajat)}
                        >
                          Șterge
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      ) : (
        <Card className="border-slate-200 bg-slate-50 shadow-none">
          <CardHeader>
            <CardTitle className="text-xl">
              {modLucru === 'adaugare' ? 'Adăugare Angajat' : 'Modificare Angajat'}
            </CardTitle>
            <CardDescription>
              Formularul validează condițional câmpurile în funcție de rolul ales.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSalvare} className="space-y-6">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <Field label="Nume" error={errors.nume?.message} {...register('nume')} />
                <Field
                  label="Prenume"
                  error={errors.prenume?.message}
                  {...register('prenume')}
                />
                <Field label="CNP" error={errors.CNP?.message} {...register('CNP')} />
                <Field
                  label="Telefon"
                  error={errors.telefon?.message}
                  {...register('telefon')}
                />
                <Field
                  label="Email"
                  type="email"
                  error={errors.email?.message}
                  {...register('email')}
                />
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
                    onChange: (event) =>
                      setTipAngajatSelectat(
                        event.target.value as AngajatFormValues['tipAngajat'],
                      ),
                  })}
                />

                {tipAngajatSelectat === 'Manager' ? (
                  <>
                    {/* Managerul are propriile câmpuri specifice. */}
                    <Field
                      label="Departament"
                      error={errors.departament?.message}
                      {...register('departament')}
                    />
                    <Field
                      label="Spor Conducere (RON)"
                        type="number"
                        error={errors.sporConducere?.message}
                        {...register('sporConducere', {
                          setValueAs: (value) => (value === '' ? undefined : Number(value)),
                        })}
                    />
                  </>
                ) : null}

                {tipAngajatSelectat === 'Mecanic' ? (
                  <>
                    {/* Pentru mecanic ne interesează specializarea și costul orar. */}
                    <Field
                      label="Specializare"
                      error={errors.specializare?.message}
                      {...register('specializare')}
                    />
                    <Field
                      label="Cost Orar (RON)"
                        type="number"
                        error={errors.costOrar?.message}
                        {...register('costOrar', {
                          setValueAs: (value) => (value === '' ? undefined : Number(value)),
                        })}
                    />
                  </>
                ) : null}

                {tipAngajatSelectat === 'Receptioner' ? (
                  <>
                    {/* Recepționerul are alte date relevante decât mecanicul sau managerul. */}
                    <Field
                      label="Nr. Birou"
                      error={errors.nrBirou?.message}
                      {...register('nrBirou')}
                    />
                    <Field label="Tura" error={errors.tura?.message} {...register('tura')} />
                  </>
                ) : null}
              </div>

              <div className="flex flex-wrap gap-3">
                <Button type="submit">Salvează</Button>
                <Button type="button" variant="outline" onClick={revinoLaLista}>
                  Renunță
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <ConfirmDialog
        isOpen={idAngajatPentruStergere !== null}
        title="Ștergi angajatul?"
        description="Acțiunea elimină angajatul doar din lista demo locală a modulului de entități."
        confirmLabel="Șterge"
        onCancel={() => setIdAngajatPentruStergere(null)}
        onConfirm={handleStergere}
      />
    </Card>
  );
}
