import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { Button } from '../../../componente/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../componente/ui/Card';
import { EmptyState } from '../../../componente/ui/EmptyState';
import { Field } from '../../../componente/ui/Field';
import { PageHeader } from '../../../componente/ui/PageHeader';
import { SelectField } from '../../../componente/ui/SelectField';
import type { Client as ClientType } from '../../../types/entitati';
import { clientSchema, type ClientFormValues } from '../schemas';

const valoriInitiale: ClientFormValues = {
  tipClient: 'PF',
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
  const [clienti, setClienti] = useState<ClientType[]>([]);
  const [modLucru, setModLucru] = useState<'vizualizare' | 'adaugare' | 'modificare'>('vizualizare');
  const [editingId, setEditingId] = useState<number | null>(null);
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

  const incepeAdaugare = () => {
    setModLucru('adaugare');
    setEditingId(null);
    setTipClientSelectat('PF');
    reset(valoriInitiale);
  };

  const incepeEditare = (client: ClientType) => {
    setModLucru('modificare');
    setEditingId(client.idClient);
    setTipClientSelectat(client.tipClient);
    reset({
      tipClient: client.tipClient,
      nume: client.nume ?? '',
      prenume: client.prenume ?? '',
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
    const clientSalvat: ClientType = {
      idClient: editingId ?? calculeazaUrmatorulIdClient(clienti),
      ...values,
      // Curățăm datele nerelevante în funcție de tipul clientului
      prenume: values.tipClient === 'PF' ? values.prenume || undefined : undefined,
      CNP: values.tipClient === 'PF' ? values.CNP || undefined : undefined,
      serieCI: values.tipClient === 'PF' ? values.serieCI || undefined : undefined,
      CUI: values.tipClient === 'PJ' ? values.CUI || undefined : undefined,
      IBAN: values.tipClient === 'PJ' ? values.IBAN || undefined : undefined,
      nrRegCom: values.tipClient === 'PJ' ? values.nrRegCom || undefined : undefined,
    };

    if (editingId !== null) {
      setClienti((previous) =>
        previous.map((client) => (client.idClient === editingId ? clientSalvat : client)),
      );
      toast.success('Clientul a fost actualizat.');
    } else {
      setClienti((previous) => [...previous, clientSalvat]);
      toast.success('Clientul a fost adăugat.');
    }

    revinoLaLista();
  });

  const handleStergere = (id: number) => {
    if (window.confirm('Sigur dorești să ștergi acest client?')) {
      setClienti((previous) => previous.filter((client) => client.idClient !== id));
      toast.success('Clientul a fost șters.');
    }
  };

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

      {modLucru === 'vizualizare' ? (
        clienti.length === 0 ? (
          <EmptyState
            title="Nu există clienți"
            description="Adaugă primul client pentru a începe gestiunea entităților."
          />
        ) : (
          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-slate-200 bg-slate-50 text-slate-500">
                <tr>
                  <th className="p-4 font-semibold">Nume Client / Companie</th>
                  <th className="p-4 font-semibold text-center">Tip</th>
                  <th className="p-4 font-semibold">Contact</th>
                  <th className="p-4 font-semibold">Sold Debitor</th>
                  <th className="p-4 text-center font-semibold">Acțiuni</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {clienti.map((client) => (
                  <tr key={client.idClient} className="hover:bg-slate-50 transition-colors">
                    <td className="p-4">
                      <div className="font-bold text-slate-800">
                        {client.tipClient === 'PF' ? `${client.nume} ${client.prenume || ''}` : client.nume}
                      </div>
                      <div className="text-xs font-medium text-slate-500 mt-1">
                        {client.tipClient === 'PF' ? `CNP: ${client.CNP}` : `CUI: ${client.CUI}`}
                      </div>
                    </td>
                    <td className="p-4 align-middle">
                      <div className="flex justify-center">
                        <span className="rounded-full bg-indigo-100 px-3 py-1 text-xs font-bold text-indigo-700">
                          {client.tipClient}
                        </span>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="text-slate-700 font-medium">{client.telefon}</div>
                      <div className="text-slate-500 text-xs">{client.email}</div>
                    </td>
                    <td className="p-4 font-bold text-slate-800">{client.soldDebitor} RON</td>
                    <td className="p-4">
                      <div className="flex justify-center gap-2">
                        <Button variant="ghost" size="sm" onClick={() => incepeEditare(client)}>
                          Editează
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-rose-200 text-rose-600 hover:bg-rose-50"
                          onClick={() => handleStergere(client.idClient)}
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
              Alege tipul clientului pentru a afișa câmpurile corespunzătoare.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSalvare} className="space-y-6">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                
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
                
                {/* Spațiu gol pentru a alinia frumos grid-ul */}
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
                    <div className="md:col-span-2">
                      <Field label="Denumire Companie" error={errors.nume?.message} {...register('nume')} />
                    </div>
                    <Field label="CUI" error={errors.CUI?.message} {...register('CUI')} />
                    <Field label="Nr. Reg. Comerțului" error={errors.nrRegCom?.message} {...register('nrRegCom')} />
                    <div className="md:col-span-2">
                      <Field label="Cont IBAN" error={errors.IBAN?.message} {...register('IBAN')} />
                    </div>
                  </>
                )}

                <div className="md:col-span-2 mt-2 mb-2"><hr className="border-slate-200"/></div>

                <Field label="Telefon" error={errors.telefon?.message} {...register('telefon')} />
                <Field label="Email" type="email" error={errors.email?.message} {...register('email')} />
                <div className="md:col-span-2">
                  <Field label="Adresă" error={errors.adresa?.message} {...register('adresa')} />
                </div>
                
                <Field
                  label="Sold Debitor (RON)"
                  type="number"
                  step="0.01"
                  error={errors.soldDebitor?.message}
                  {...register('soldDebitor', { valueAsNumber: true })}
                />
              </div>

              <div className="flex flex-wrap gap-3 pt-4">
                <Button type="submit">Salvează Datele</Button>
                <Button type="button" variant="outline" onClick={revinoLaLista}>
                  Renunță
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}
    </Card>
  );
}