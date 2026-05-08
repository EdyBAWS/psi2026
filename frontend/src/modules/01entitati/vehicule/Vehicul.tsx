import { useState } from "react";
import { Car, Search, ClipboardList, ArrowUpDown, Plus, Edit2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "../../../componente/ui/PageHeader";
import { StatCard } from "../../../componente/ui/StatCard";
import { EmptyState } from "../../../componente/ui/EmptyState";
import { Button } from "../../../componente/ui/Button";
import { Field } from "../../../componente/ui/Field";
import { SelectField } from "../../../componente/ui/SelectField";
import { ConfirmDialog } from "../../../componente/ui/ConfirmDialog";

import type { VehiculEntity, VehiculFormValues, ClientEntity } from "../entitati.service";
import { useVehicul, type SortField } from "./useVehicul";

// ============================================================================
// 1. COMPONENTE REUTILIZABILE EXTRASE DIN RENDER
// ============================================================================

interface ThSortableProps {
  label: string;
  field: SortField;
  currentSortField: SortField;
  onSort: (field: SortField) => void;
}

function ThSortable({ label, field, currentSortField, onSort }: ThSortableProps) {
  return (
    <th 
      className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500 cursor-pointer hover:bg-slate-100 transition-colors group select-none" 
      onClick={() => onSort(field)}
    >
      <div className="flex items-center gap-2">
        {label}
        <ArrowUpDown className={`h-3 w-3 ${currentSortField === field ? 'text-indigo-500' : 'text-slate-300 group-hover:text-slate-400'}`} />
      </div>
    </th>
  );
}

// ============================================================================
// 2. COMPONENTA PENTRU FORMULAR
// ============================================================================
interface VehiculFormProps {
  initialData?: VehiculEntity | null;
  clienti: ClientEntity[];
  onClose: () => void;
  onSave: (data: VehiculFormValues, id?: number) => Promise<void>;
}

function VehiculForm({ initialData, clienti, onClose, onSave }: VehiculFormProps) {
  const [formData, setFormData] = useState<VehiculFormValues>({
    numarInmatriculare: initialData?.numarInmatriculare || "",
    marca: initialData?.marca || "",
    model: initialData?.model || "",
    vin: initialData?.vin || "",
    idClient: initialData?.idClient || (clienti.length > 0 ? clienti[0].idClient : 0),
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.numarInmatriculare || !formData.marca || !formData.idClient) {
      toast.error("Vă rugăm să completați câmpurile obligatorii.");
      return;
    }
    
    setIsSubmitting(true);
    try {
      await onSave(formData, initialData?.idVehicul);
      toast.success(initialData ? "Vehicul actualizat cu succes!" : "Vehicul adăugat cu succes!");
      onClose();
    } catch (error) {
      console.error(error);
      toast.error("A apărut o eroare la salvarea vehiculului.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const clientOptions = clienti
    .filter(c => c.status === 'Activ')
    .map(c => ({
      value: c.idClient.toString(),
      label: c.tipClient === 'PJ' ? c.nume : `${c.nume} ${c.prenume || ""}`,
    }));

  return (
    <div className="flex h-[calc(100vh-8rem)] flex-col overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-xl sticky top-6">
      <div className="border-b border-slate-100 bg-slate-50 px-5 py-4 flex justify-between items-center">
        <h3 className="text-xl font-bold text-slate-800">
          {initialData ? "Editează Vehicul" : "Adaugă Vehicul Nou"}
        </h3>
        <button onClick={onClose} className="rounded-lg p-2 text-slate-400 hover:bg-slate-200 hover:text-slate-600">
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
      </div>

      <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 space-y-5">
        <Field label="Număr Înmatriculare *" placeholder="ex: B 100 ABC" value={formData.numarInmatriculare} onChange={(e) => setFormData({ ...formData, numarInmatriculare: e.target.value.toUpperCase() })} required />
        <div className="grid grid-cols-2 gap-4">
          <Field label="Marcă *" placeholder="ex: Volkswagen" value={formData.marca} onChange={(e) => setFormData({ ...formData, marca: e.target.value })} required />
          <Field label="Model *" placeholder="ex: Golf" value={formData.model} onChange={(e) => setFormData({ ...formData, model: e.target.value })} required />
        </div>
        <Field label="Serie Șasiu (VIN) *" placeholder="17 caractere" value={formData.vin} onChange={(e) => setFormData({ ...formData, vin: e.target.value.toUpperCase() })} required />
        <SelectField label="Proprietar (Client) *" options={clientOptions} value={formData.idClient.toString()} onChange={(e) => setFormData({ ...formData, idClient: Number(e.target.value) })} placeholder="Selectează un client" required />

        <div className="pt-4 border-t border-slate-100 flex gap-3">
          <Button type="button" variant="outline" fullWidth onClick={onClose}>Anulează</Button>
          <Button type="submit" variant="primary" fullWidth disabled={isSubmitting}>
            {isSubmitting ? "Se salvează..." : "Salvează"}
          </Button>
        </div>
      </form>
    </div>
  );
}

// ============================================================================
// 3. COMPONENTA PENTRU DETALII
// ============================================================================
interface VehiculDetailProps {
  vehicul: any; // Folosim any aici pentru a acoperi noile campuri adaugate in useVehicul
  client?: ClientEntity;
  onInchide: () => void;
  onEdit: () => void;
  onDeleteRequest: () => void;
}

function VehiculDetail({ vehicul, client, onInchide, onEdit, onDeleteRequest }: VehiculDetailProps) {
  const istoricComenzi: any[] = vehicul.istoricComenzi || [];

  const numeClient = client ? (client.tipClient === 'PJ' ? client.nume : `${client.nume} ${client.prenume || ""}`).trim() : "Client Necunoscut";

  return (
    <div className="flex h-[calc(100vh-8rem)] flex-col overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm sticky top-6">
      <div className="border-b border-slate-100 bg-slate-50 px-5 py-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xl font-bold text-slate-800">{vehicul.numarInmatriculare}</h3>
              <span className={`inline-flex rounded-md border px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider ${vehicul.status === 'Activ' ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-rose-200 bg-rose-50 text-rose-700'}`}>{vehicul.status}</span>
            </div>
            <p className="mt-1 text-sm font-medium text-slate-500">ID Sistem: VHC-{vehicul.idVehicul.toString().padStart(4, '0')}</p>
          </div>
          <button onClick={onInchide} className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-200 hover:text-slate-600"><svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="p-5 border-b border-slate-100">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Specificații Auto</p>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <div><p className="text-xs text-slate-500">Marcă & Model</p><p className="font-semibold text-slate-800">{vehicul.marca} {vehicul.model}</p></div>
            <div className="sm:col-span-2"><p className="text-xs text-slate-500">Serie Șasiu (VIN)</p><p className="text-sm font-mono font-medium text-slate-700">{vehicul.vin || '-'}</p></div>
          </div>
        </div>

        <div className="p-5 border-b border-slate-100 bg-indigo-50/30">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-indigo-400">Proprietar / Utilizator</p>
          <div className="mt-3">
            <p className="text-lg font-bold text-slate-800">{numeClient}</p>
            <p className="text-sm font-medium text-slate-500 mt-1">📞 {client?.telefon || "-"}</p>
            <p className="text-sm font-medium text-slate-500">📧 {client?.email || "-"}</p>
          </div>
        </div>

        <ul className="divide-y divide-slate-100 p-5">
          <p className="mb-4 text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Istoric Comenzi ({istoricComenzi.length})</p>
          {istoricComenzi.length === 0 ? (
            <p className="text-sm text-slate-500">Nicio reparație înregistrată încă.</p>
          ) : (
            istoricComenzi.map((cmd) => (
              <li key={cmd.idComanda} className="py-3 flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold text-slate-800">{cmd.numarComanda}</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    {new Date(cmd.createdAt).toLocaleDateString('ro-RO')}
                  </p>
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-700 px-2 py-1 rounded-md">
                  {cmd.status}
                </span>
              </li>
            ))
          )}
        </ul>
      </div>

      <div className="mt-auto border-t border-slate-100 p-4 bg-slate-50 flex gap-3">
        <Button variant="outline" fullWidth onClick={onEdit} className="text-slate-600"><Edit2 className="w-4 h-4 mr-2" /> Editează</Button>
        <Button variant="danger" fullWidth onClick={onDeleteRequest} disabled={vehicul.status === 'Inactiv'}><Trash2 className="w-4 h-4 mr-2" /> {vehicul.status === 'Activ' ? 'Dezactivează' : 'Inactiv'}</Button>
      </div>
    </div>
  );
}

// ============================================================================
// 4. PAGINA PRINCIPALĂ (Acum folosește noul Hook)
// ============================================================================
export default function Vehicul() {
  const { 
    vehiculeProcesate, 
    vehiculeFiltrateSiSortate, 
    clienti, 
    loading, 
    cautare, 
    setCautare, 
    sortField, 
    handleSort, 
    stats, 
    salveaza, 
    schimbaStatus 
  } = useVehicul();

  const [idVehiculSelectat, setIdVehiculSelectat] = useState<number | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [vehiculToEdit, setVehiculToEdit] = useState<VehiculEntity | null>(null);
  const [vehiculToDelete, setVehiculToDelete] = useState<number | null>(null);

  const handleSave = async (data: VehiculFormValues, id?: number) => {
    await salveaza(data, id);
    if (id) setIdVehiculSelectat(id); 
  };

  const handleConfirmDeactivate = async () => {
    if (vehiculToDelete) {
      await schimbaStatus(vehiculToDelete, 'Inactiv');
      toast.success("Vehiculul a fost dezactivat cu succes!");
      setIsConfirmOpen(false);
      setVehiculToDelete(null);
    }
  };

  const vehiculSelectat = vehiculeProcesate.find(v => v.idVehicul === idVehiculSelectat);

  if (loading) return <div className="py-12 text-center text-slate-500">Se încarcă vehiculele...</div>;

  return (
    <div className="space-y-6 pb-10">
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
        <PageHeader title="Registru Vehicule" description="Evidența detaliată a mașinilor introduse în service, istoricul reparațiilor și legăturile cu clienții proprietari." />
        <div className="flex flex-wrap items-center justify-between mt-6">
          <div className="flex flex-wrap gap-4">
            <StatCard label="Total Vehicule" value={stats.total} icon={<Car className="h-4 w-4" />} />
            <StatCard label="Vehicule Active" value={stats.activi} tone="success" icon={<ClipboardList className="h-4 w-4" />} />
          </div>
          <Button variant="primary" onClick={() => { setVehiculToEdit(null); setIsFormOpen(true); setIdVehiculSelectat(null); }}>
            <Plus className="w-5 h-5 mr-2" /> Adaugă Vehicul Nou
          </Button>
        </div>
      </div>

      <div className="flex w-full flex-col gap-6 xl:flex-row xl:items-start">
        <div className="flex-1 space-y-6">
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center">
            <div className="relative w-full max-w-md">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input type="text" placeholder="Caută după număr, VIN sau deținător..." value={cautare} onChange={(e) => setCautare(e.target.value)} className="h-10 w-full rounded-lg border border-slate-200 bg-white pl-10 pr-4 text-sm outline-none transition-all focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500" />
            </div>
          </div>

          {vehiculeFiltrateSiSortate.length === 0 ? (
             <div className="bg-white rounded-2xl border border-slate-100 p-12 shadow-sm">
               <EmptyState title="Niciun vehicul găsit" description="Nu am găsit nicio mașină care să corespundă criteriilor tale de căutare." />
             </div>
          ) : (
            <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
              <table className="min-w-full divide-y divide-slate-200 text-sm">
                <thead className="bg-slate-50">
                  <tr>
                    <ThSortable label="Vehicul" field="numarInmatriculare" currentSortField={sortField} onSort={handleSort} />
                    <ThSortable label="Client / Deținător" field="numeDetinator" currentSortField={sortField} onSort={handleSort} />
                    <ThSortable label="Detalii Tehnice" field="marca" currentSortField={sortField} onSort={handleSort} />
                    <ThSortable label="Status" field="status" currentSortField={sortField} onSort={handleSort} />
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {vehiculeFiltrateSiSortate.map((v) => (
                    <tr key={v.idVehicul} onClick={() => { setIdVehiculSelectat(v.idVehicul); setIsFormOpen(false); }} className={`cursor-pointer transition-colors hover:bg-slate-50 ${idVehiculSelectat === v.idVehicul ? 'bg-indigo-50/50' : ''}`}>
                      <td className="px-6 py-4">
                        <p className="font-bold text-slate-900">{v.numarInmatriculare}</p>
                        <p className="text-xs text-slate-500 mt-0.5">VHC-{v.idVehicul.toString().padStart(4, '0')}</p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-semibold text-slate-800">{v.numeDetinator}</p>
                        <p className="text-xs text-slate-500 mt-0.5">{v.clientObj?.telefon || "-"}</p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-medium text-slate-700">{v.marca} {v.model}</p>
                        <p className="text-[11px] text-slate-400 font-mono mt-0.5">{v.vin || '-'}</p>
                      </td>
                      <td className="px-6 py-4">
                         <span className={`inline-flex rounded-full px-2 py-1 text-[10px] font-bold uppercase tracking-wide ${v.status === 'Activ' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>{v.status}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {(isFormOpen || vehiculSelectat) && (
          <div className="w-full shrink-0 xl:w-[420px] animate-in fade-in slide-in-from-right-4">
            {isFormOpen ? (
              <VehiculForm initialData={vehiculToEdit} clienti={clienti} onClose={() => { setIsFormOpen(false); setVehiculToEdit(null); }} onSave={handleSave} />
            ) : vehiculSelectat ? (
              <VehiculDetail vehicul={vehiculSelectat} client={vehiculSelectat.clientObj} onInchide={() => setIdVehiculSelectat(null)} onEdit={() => { setVehiculToEdit(vehiculSelectat); setIsFormOpen(true); }} onDeleteRequest={() => { setVehiculToDelete(vehiculSelectat.idVehicul); setIsConfirmOpen(true); }} />
            ) : null}
          </div>
        )}
      </div>

      <ConfirmDialog isOpen={isConfirmOpen} title="Dezactivare Vehicul" description="Ești sigur că vrei să dezactivezi acest vehicul? El nu va mai putea fi selectat pentru comenzi noi în modulul de Recepție." confirmLabel="Dezactivează" cancelLabel="Renunță" onCancel={() => { setIsConfirmOpen(false); setVehiculToDelete(null); }} onConfirm={handleConfirmDeactivate} />
    </div>
  );
}