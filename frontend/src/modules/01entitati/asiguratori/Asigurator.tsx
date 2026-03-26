import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { Button } from '../../../componente/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../componente/ui/Card';
import { EmptyState } from '../../../componente/ui/EmptyState';
import { Field } from '../../../componente/ui/Field';
import { PageHeader } from '../../../componente/ui/PageHeader';
import type { Asigurator as AsiguratorType } from '../../../types/entitati';
import { asiguratorSchema, type AsiguratorFormValues } from '../schemas';

const valoriInitiale: AsiguratorFormValues = {
  denumire: '',
  CUI: '',
  telefon: '',
};

const calculeazaUrmatorulIdAsigurator = (asiguratori: AsiguratorType[]) =>
  asiguratori.reduce(
    (maximCurent, asigurator) => Math.max(maximCurent, asigurator.idAsigurator),
    0,
  ) + 1;

export default function Asigurator() {
  const [asiguratori, setAsiguratori] = useState<AsiguratorType[]>([]);
  const [modLucru, setModLucru] = useState<'vizualizare' | 'adaugare' | 'modificare'>('vizualizare');
  const [editingId, setEditingId] = useState<number | null>(null);

  const {
    formState: { errors },
    handleSubmit,
    register,
    reset,
  } = useForm<AsiguratorFormValues>({
    resolver: zodResolver(asiguratorSchema),
    defaultValues: valoriInitiale,
  });

  const incepeAdaugare = () => {
    setModLucru('adaugare');
    setEditingId(null);
    reset(valoriInitiale);
  };

  const incepeEditare = (asigurator: AsiguratorType) => {
    setModLucru('modificare');
    setEditingId(asigurator.idAsigurator);
    reset({
      denumire: asigurator.denumire,
      CUI: asigurator.CUI,
      telefon: asigurator.telefon,
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
      setAsiguratori((previous) =>
        previous.map((asigurator) =>
          asigurator.idAsigurator === editingId ? asiguratorSalvat : asigurator,
        ),
      );
      toast.success('Asigurătorul a fost actualizat.');
    } else {
      setAsiguratori((previous) => [...previous, asiguratorSalvat]);
      toast.success('Asigurătorul a fost adăugat.');
    }

    revinoLaLista();
  });

  const handleStergere = (id: number) => {
    if (window.confirm('Ștergi acest asigurător?')) {
      setAsiguratori((previous) =>
        previous.filter((asigurator) => asigurator.idAsigurator !== id),
      );
      toast.success('Asigurătorul a fost șters.');
    }
  };

  return (
    <Card className="p-8">
      <PageHeader
        title="Societăți Asigurare"
        description="Gestionează asigurătorii folosiți în dosarele de daună și fluxurile comerciale."
        actions={
          modLucru === 'vizualizare' ? (
            <Button type="button" onClick={incepeAdaugare}>
              + Adaugă Asigurător
            </Button>
          ) : null
        }
      />

      {modLucru === 'vizualizare' ? (
        asiguratori.length === 0 ? (
          <EmptyState
            title="Nu există asigurători"
            description="Adaugă primul asigurător pentru a-l putea lega de dosarele de daună."
          />
        ) : (
          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-slate-200 bg-slate-50 text-slate-500">
                <tr>
                  <th className="p-4 font-semibold">Denumire Societate</th>
                  <th className="p-4 font-semibold">CUI</th>
                  <th className="p-4 font-semibold">Telefon de contact</th>
                  <th className="p-4 text-center font-semibold">Acțiuni</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {asiguratori.map((asigurator) => (
                  <tr
                    key={asigurator.idAsigurator}
                    className="hover:bg-slate-50 transition-colors"
                  >
                    <td className="p-4 font-medium text-slate-700">
                      {asigurator.denumire}
                    </td>
                    <td className="p-4 text-slate-600">{asigurator.CUI}</td>
                    <td className="p-4 text-slate-600">{asigurator.telefon}</td>
                    <td className="p-4">
                      <div className="flex justify-center gap-2">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => incepeEditare(asigurator)}
                        >
                          Editează
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="border-rose-200 text-rose-600 hover:bg-rose-50"
                          onClick={() => handleStergere(asigurator.idAsigurator)}
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
        <Card className="max-w-2xl border-slate-200 bg-slate-50 shadow-none">
          <CardHeader>
            <CardTitle className="text-xl">
              {modLucru === 'adaugare' ? 'Adăugare Asigurător' : 'Modificare Asigurător'}
            </CardTitle>
            <CardDescription>
              Formularul folosește schema `zod` pentru câmpurile esențiale.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSalvare} className="space-y-4">
              <Field
                label="Denumire Societate"
                error={errors.denumire?.message}
                {...register('denumire')}
              />
              <Field label="CUI" error={errors.CUI?.message} {...register('CUI')} />
              <Field
                label="Telefon"
                error={errors.telefon?.message}
                {...register('telefon')}
              />

              <div className="flex flex-wrap gap-3 pt-2">
                <Button type="submit">Salvează</Button>
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
