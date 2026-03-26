import { useState } from 'react';
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

// Valorile inițiale sunt separate de componentă pentru a putea fi refolosite
// la reset și pentru a păstra mai clar "cum arată formularul gol".
const valoriInitiale: ClientFormValues = {
  tipClient: 'PF',
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

// Generăm noul id pe baza datelor deja existente din listă.
// Facem asta pentru că este o metodă stabilă și predictibilă în UI local,
// iar lint-ul React nu mai semnalează funcții impure precum `Date.now()`
// în logica de construire a obiectului.
const calculeazaUrmatorulIdClient = (clienti: ClientType[]) =>
  clienti.reduce((maximCurent, client) => Math.max(maximCurent, client.idClient), 0) + 1;

// Această pagină este un CRUD local pentru clienți.
// Ea folosește `react-hook-form` pentru colectarea datelor
// și `zod` pentru regulile de validare.
export default function Client() {
  const [clienti, setClienti] = useState<ClientType[]>(clientiEntitateMock);
  const [modLucru, setModLucru] = useState<'vizualizare' | 'adaugare' | 'modificare'>('vizualizare');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [idClientPentruStergere, setIdClientPentruStergere] = useState<number | null>(null);
  // Tipul selectat este ținut separat pentru că ne trebuie imediat în UI
  // ca să știm ce câmpuri condiționale să afișăm.
  const [tipClientSelectat, setTipClientSelectat] = useState<ClientFormValues['tipClient']>('PF');

  const {
    formState: { errors },
    handleSubmit,
    register,
    reset,
  } = useForm<ClientFormValues>({
    resolver: zodResolver(clientSchema),
    defaultValues: valoriInitiale,
  });

  // În modul de adăugare pornim de la formularul gol și revenim la tipul implicit.
  const incepeAdaugare = () => {
    setModLucru('adaugare');
    setEditingId(null);
    setTipClientSelectat('PF');
    reset(valoriInitiale);
  };

  const incepeEditare = (client: ClientType) => {
    // La editare facem invers: luăm obiectul existent și îl "împingem" în formular.
    setModLucru('modificare');
    setEditingId(client.idClient);
    setTipClientSelectat(client.tipClient);
    reset({
      tipClient: client.tipClient,
      telefon: client.telefon,
      email: client.email,
      adresa: client.adresa,
      soldDebitor: client.soldDebitor,
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
    // `handleSubmit` rulează validarea și ne dă aici doar valorile deja trecute
    // prin schema `zod`.
    // În acest pas construim obiectul final care va intra în lista locală.
    const clientSalvat: ClientType = {
      idClient: editingId ?? calculeazaUrmatorulIdClient(clienti),
      ...values,
      CNP: values.tipClient === 'PF' ? values.CNP || undefined : undefined,
      serieCI: values.tipClient === 'PF' ? values.serieCI || undefined : undefined,
      CUI: values.tipClient === 'PJ' ? values.CUI || undefined : undefined,
      IBAN: values.tipClient === 'PJ' ? values.IBAN || undefined : undefined,
      nrRegCom: values.tipClient === 'PJ' ? values.nrRegCom || undefined : undefined,
    };

    if (editingId !== null) {
      // Editarea înlocuiește doar elementul cu același id.
      setClienti((previous) =>
        previous.map((client) => (client.idClient === editingId ? clientSalvat : client)),
      );
      toast.success('Clientul a fost actualizat.');
    } else {
      // Adăugarea creează un element nou și îl pune în listă.
      setClienti((previous) => [...previous, clientSalvat]);
      toast.success('Clientul a fost adăugat.');
    }

    revinoLaLista();
  });

  const handleStergere = () => {
    if (idClientPentruStergere === null) return;
    setClienti((previous) =>
      previous.filter((client) => client.idClient !== idClientPentruStergere),
    );
    setIdClientPentruStergere(null);
    toast.success('Clientul a fost șters.');
  };

  const totalPf = clienti.filter((client) => client.tipClient === 'PF').length;
  const totalPj = clienti.length - totalPf;
  const soldTotal = clienti.reduce((total, client) => total + client.soldDebitor, 0);

  return (
    <Card className="p-8">
      <PageHeader
        title="Gestiune Clienți"
        description="Administrează clienții și datele necesare pentru facturare și relația comercială."
        actions={
          modLucru === 'vizualizare' ? (
            <Button onClick={incepeAdaugare}>+ Adaugă Client</Button>
          ) : null
        }
      />

      <div className="mb-6 grid gap-3 md:grid-cols-3">
        <StatCard label="Total clienți" value={clienti.length} icon={<Users className="h-4 w-4" />} />
        <StatCard label="Persoane juridice" value={totalPj} tone="info" icon={<Building2 className="h-4 w-4" />} />
        <StatCard label="Sold total" value={`${soldTotal} RON`} tone="warning" />
      </div>

      {modLucru === 'vizualizare' ? (
        clienti.length === 0 ? (
          <EmptyState
            title="Nu există clienți"
            description="Adaugă primul client pentru a începe gestiunea entităților."
            actionLabel="Adaugă client"
            onAction={incepeAdaugare}
          />
        ) : (
          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-slate-200 bg-slate-50 text-slate-500">
                <tr>
                  <th className="p-4 font-semibold">Nume / CUI</th>
                  <th className="p-4 font-semibold">Tip</th>
                  <th className="p-4 font-semibold">Telefon</th>
                  <th className="p-4 font-semibold">Email</th>
                  <th className="p-4 font-semibold">Sold Debitor</th>
                  <th className="p-4 text-center font-semibold">Acțiuni</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {clienti.map((client) => (
                  <tr key={client.idClient} className="hover:bg-slate-50 transition-colors">
                    <td className="p-4 font-medium text-slate-700">
                      {client.tipClient === 'PF' ? client.CNP : client.CUI}
                    </td>
                    <td className="p-4">
                      <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-700">
                        {client.tipClient}
                      </span>
                    </td>
                    <td className="p-4 text-slate-600">{client.telefon}</td>
                    <td className="p-4 text-slate-600">{client.email}</td>
                    <td className="p-4 font-semibold text-slate-700">{client.soldDebitor} RON</td>
                    <td className="p-4">
                      <div className="flex justify-center gap-2">
                        <Button variant="ghost" size="sm" onClick={() => incepeEditare(client)}>
                          Editează
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-rose-200 text-rose-600 hover:bg-rose-50"
                          onClick={() => setIdClientPentruStergere(client.idClient)}
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
              {modLucru === 'adaugare' ? 'Adăugare Client Nou' : 'Modificare Client'}
            </CardTitle>
            <CardDescription>
              Folosim `react-hook-form` și `zod` pentru validare predictibilă și mesaje clare de eroare.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSalvare} className="space-y-6">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {/* Câmpurile PF / PJ se schimbă în funcție de tipul selectat.
                    Ținem această logică aici pentru ca utilizatorul să vadă
                    doar câmpurile relevante pentru cazul lui. */}
                <SelectField
                  label="Tip Client"
                  value={tipClientSelectat}
                  options={[
                    { label: 'Persoană Fizică (PF)', value: 'PF' },
                    { label: 'Persoană Juridică (PJ)', value: 'PJ' },
                  ]}
                  error={errors.tipClient?.message}
                  {...register('tipClient', {
                    onChange: (event) =>
                      setTipClientSelectat(event.target.value as ClientFormValues['tipClient']),
                  })}
                />
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
                <Field
                  label="Adresă"
                  error={errors.adresa?.message}
                  {...register('adresa')}
                />
                {tipClientSelectat === 'PF' ? (
                  <>
                    <Field label="CNP" error={errors.CNP?.message} {...register('CNP')} />
                    <Field
                      label="Serie CI"
                      error={errors.serieCI?.message}
                      {...register('serieCI')}
                    />
                  </>
                ) : (
                  <>
                    <Field label="CUI" error={errors.CUI?.message} {...register('CUI')} />
                    <Field
                      label="Nr. Reg. Comerțului"
                      error={errors.nrRegCom?.message}
                      {...register('nrRegCom')}
                    />
                    <Field label="IBAN" error={errors.IBAN?.message} {...register('IBAN')} />
                  </>
                )}
                {/* `valueAsNumber` face conversia din text în număr înainte ca
                    datele să ajungă în schema de validare. */}
                <Field
                  label="Sold Debitor (RON)"
                  type="number"
                  step="0.01"
                  error={errors.soldDebitor?.message}
                  {...register('soldDebitor', { valueAsNumber: true })}
                />
              </div>

              <div className="flex flex-wrap gap-3">
                <Button type="submit">Salvează Datele</Button>
                <Button type="button" variant="outline" onClick={revinoLaLista}>
                  Renunță
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <ConfirmDialog
        isOpen={idClientPentruStergere !== null}
        title="Ștergi clientul?"
        description="Acțiunea elimină clientul din lista demo locală a modulului de entități."
        confirmLabel="Șterge"
        onCancel={() => setIdClientPentruStergere(null)}
        onConfirm={handleStergere}
      />
    </Card>
  );
}
