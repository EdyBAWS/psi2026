import { useEffect, useState } from "react";
import { X, Save } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "../../../componente/ui/Button";
import { Field } from "../../../componente/ui/Field";
import { SelectField } from "../../../componente/ui/SelectField";
import { vehiculSchema, type VehiculFormValues } from "../schemas";
import type { VehiculEntity, ClientEntity } from "../entitati.service";

interface VehiculFormProps {
  initialData: VehiculEntity | null;
  clienti: ClientEntity[];
  onClose: () => void;
  onSave: (data: any) => Promise<void>;
}

export function VehiculForm({ initialData, clienti, onClose, onSave }: VehiculFormProps) {
  const { register, handleSubmit, formState: { errors }, reset } = useForm<VehiculFormValues>({
    resolver: zodResolver(vehiculSchema) as any,
    mode: 'all',
    defaultValues: {
      numarInmatriculare: "",
      marca: "",
      model: "",
      vin: "",
      status: "Activ"
    }
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initialData) {
      reset({
        numarInmatriculare: initialData.numarInmatriculare,
        marca: initialData.marca,
        model: initialData.model,
        vin: initialData.vin || "",
        idClient: initialData.idClient,
        status: initialData.status as any
      });
    }
  }, [initialData, reset]);

  const onSubmit = async (data: VehiculFormValues) => {
    setLoading(true);
    try {
      await onSave(data);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-[calc(100vh-8rem)] flex-col overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm sticky top-6">
      <div className="border-b border-slate-100 bg-slate-50 px-5 py-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-slate-800">
            {initialData ? "Editează Vehicul" : "Vehicul Nou"}
          </h3>
          <button onClick={onClose} className="rounded-lg p-1 text-slate-400 hover:bg-slate-200">
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="flex-1 overflow-y-auto p-5 space-y-4">
        <Field
          id="input-nr-vehicul"
          label="Număr Înmatriculare *"
          placeholder="Ex: B-123-ABC"
          {...register('numarInmatriculare')}
          error={errors.numarInmatriculare?.message}
        />

        <div className="grid grid-cols-2 gap-4">
          <Field
            id="input-marca-vehicul"
            label="Marcă *"
            {...register('marca')}
            error={errors.marca?.message}
          />
          <Field
            id="input-model-vehicul"
            label="Model *"
            {...register('model')}
            error={errors.model?.message}
          />
        </div>

        <Field
          id="input-vin-vehicul"
          label="Serie Șasiu (VIN)"
          placeholder="17 caractere"
          className="font-mono"
          maxLength={17}
          {...register('vin')}
          error={errors.vin?.message}
        />

        <SelectField
          id="select-client-vehicul"
          label="Proprietar / Client *"
          options={[
            { label: 'Selectează client...', value: '' },
            ...clienti.map(c => ({
              label: c.tipClient === "PJ" ? c.nume : `${c.nume} ${c.prenume || ""}`,
              value: c.idClient.toString()
            }))
          ]}
          {...register('idClient', { valueAsNumber: true })}
          error={errors.idClient?.message}
        />

        <SelectField
          label="Status"
          options={[
            { label: 'Activ', value: 'Activ' },
            { label: 'Inactiv', value: 'Inactiv' }
          ]}
          {...register('status')}
          error={errors.status?.message}
        />
      </form>

      <div className="border-t border-slate-100 p-4 bg-slate-50">
        <Button id="btn-save-vehicul" fullWidth type="button" onClick={handleSubmit(onSubmit)} disabled={loading}>
          <Save className="w-4 h-4 mr-2" /> {loading ? "Se salvează..." : "Salvează Vehicul"}
        </Button>
      </div>
    </div>
  );
}
