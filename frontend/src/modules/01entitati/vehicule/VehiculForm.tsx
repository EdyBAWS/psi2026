import { useState, useEffect } from "react";
import { X, Save } from "lucide-react";
import { Button } from "../../../componente/ui/Button";
import type { VehiculEntity, ClientEntity } from "../entitati.service";

interface VehiculFormProps {
  initialData: VehiculEntity | null;
  clienti: ClientEntity[];
  onClose: () => void;
  onSave: (data: any) => Promise<void>;
}

export function VehiculForm({ initialData, clienti, onClose, onSave }: VehiculFormProps) {
  const [formData, setFormData] = useState({
    numarInmatriculare: "",
    marca: "",
    model: "",
    vin: "",
    idClient: "",
    status: "Activ" as "Activ" | "Inactiv"
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData({
        numarInmatriculare: initialData.numarInmatriculare,
        marca: initialData.marca,
        model: initialData.model,
        vin: initialData.vin || "",
        idClient: initialData.idClient.toString(),
        status: initialData.status as "Activ" | "Inactiv"
      });
    }
  }, [initialData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSave({
        ...formData,
        idClient: parseInt(formData.idClient, 10)
      });
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

      <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 space-y-4">
        <div>
          <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1 block">
            Număr Înmatriculare
          </label>
          <input
            required
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
            value={formData.numarInmatriculare}
            onChange={e => setFormData({ ...formData, numarInmatriculare: e.target.value.toUpperCase() })}
            placeholder="Ex: B-123-ABC"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1 block">Marcă</label>
            <input
              required
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
              value={formData.marca}
              onChange={e => setFormData({ ...formData, marca: e.target.value })}
            />
          </div>
          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1 block">Model</label>
            <input
              required
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
              value={formData.model}
              onChange={e => setFormData({ ...formData, model: e.target.value })}
            />
          </div>
        </div>

        <div>
          <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1 block">Serie Șasiu (VIN)</label>
          <input
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm font-mono focus:ring-2 focus:ring-indigo-500 outline-none"
            value={formData.vin}
            onChange={e => setFormData({ ...formData, vin: e.target.value.toUpperCase() })}
            maxLength={17}
          />
        </div>

        <div>
          <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1 block">Proprietar / Client</label>
          <select
            required
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
            value={formData.idClient}
            onChange={e => setFormData({ ...formData, idClient: e.target.value })}
          >
            <option value="">Selectează un client...</option>
            {clienti.map(client => (
              <option key={client.idClient} value={client.idClient}>
                {client.tipClient === "PJ" ? client.nume : `${client.nume} ${client.prenume || ""}`}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1 block">Status</label>
          <select
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
            value={formData.status}
            onChange={e => setFormData({ ...formData, status: e.target.value as "Activ" | "Inactiv" })}
          >
            <option value="Activ">Activ</option>
            <option value="Inactiv">Inactiv</option>
          </select>
        </div>
      </form>

      <div className="border-t border-slate-100 p-4 bg-slate-50">
        <Button fullWidth type="submit" onClick={handleSubmit} disabled={loading}>
          <Save className="w-4 h-4 mr-2" /> {loading ? "Se salvează..." : "Salvează Vehicul"}
        </Button>
      </div>
    </div>
  );
}