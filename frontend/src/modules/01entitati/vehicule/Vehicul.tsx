import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Car, Search, ClipboardList, ArrowUpDown, Plus, Edit2, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "../../../componente/ui/PageHeader";
import { StatCard } from "../../../componente/ui/StatCard";
import { Button } from "../../../componente/ui/Button";
import { ConfirmDialog } from "../../../componente/ui/ConfirmDialog";
import { VehiculForm } from "./VehiculForm";

import type { VehiculEntity, ClientEntity } from "../entitati.service";
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
      className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500 cursor-pointer hover:bg-slate-50"
      onClick={() => onSort(field)}
    >
      <div className="flex items-center gap-2">
        {label}
        <ArrowUpDown className={`h-3 w-3 ${currentSortField === field ? 'text-indigo-500' : 'text-slate-300'}`} />
      </div>
    </th>
  );
}

// ============================================================================
// 2. COMPONENTA PENTRU DETALII
// ============================================================================
interface VehiculDetailProps {
  vehicul: any;
  client?: ClientEntity;
  onInchide: () => void;
  onEdit: () => void;
  onDeleteRequest: () => void;
}

function VehiculDetail({ vehicul, client, onInchide, onEdit, onDeleteRequest }: VehiculDetailProps) {
  const navigate = useNavigate();
  const istoricComenzi: any[] = vehicul.istoricComenzi || [];

  const numeClient = client 
    ? (client.tipClient === 'PJ' ? client.nume : `${client.nume} ${client.prenume || ""}`).trim() 
    : "Client Necunoscut";

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
          <button onClick={onInchide} className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-200 hover:text-slate-600">
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="p-5 border-b border-slate-100">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Specificații Auto</p>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <div>
              <p className="text-xs text-slate-500">Marcă & Model</p>
              <p className="font-semibold text-slate-800">{vehicul.marca} {vehicul.model}</p>
            </div>
            <div className="sm:col-span-2">
              <p className="text-xs text-slate-500">Serie Șasiu (VIN)</p>
              <p className="text-sm font-mono font-medium text-slate-700">{vehicul.vin || '-'}</p>
            </div>
          </div>
        </div>

        <div className="p-5 border-b border-slate-100 bg-indigo-50/30">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-indigo-400">Proprietar / Utilizator</p>
          <div className="mt-3">
            <p className="text-lg font-bold text-slate-800">{numeClient}</p>
            {client && (
              <p className="text-sm font-medium text-slate-500 mt-1">📞 {client.telefon}</p>
            )}
          </div>
        </div>

        <div className="p-5">
          <p className="mb-4 text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Istoric Comenzi ({istoricComenzi.length})</p>
          {istoricComenzi.length === 0 ? (
            <p className="text-sm text-slate-500">Nicio reparație înregistrată încă.</p>
          ) : (
            <ul className="divide-y divide-slate-100">
              {istoricComenzi.map((cmd) => (
                <li 
                  key={cmd.idComanda} 
                  onClick={() => {
                    sessionStorage.setItem('gestiune-idComandaSelectata', cmd.idComanda.toString());
                    navigate('/operational');
                  }}
                  className="py-3 flex items-center justify-between cursor-pointer hover:bg-slate-50 transition-colors px-2 -mx-2 rounded-lg group"
                >
                  <div>
                    <p className="text-sm font-bold text-indigo-600 group-hover:text-indigo-800">{cmd.numarComanda}</p>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      {new Date(cmd.createdAt).toLocaleDateString('ro-RO')}
                    </p>
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-700 px-2 py-1 rounded-md">
                    {cmd.status.replace(/_/g, ' ')}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className="mt-auto border-t border-slate-100 p-4 bg-slate-50 flex gap-3">
        <Button variant="outline" fullWidth onClick={onEdit} className="text-slate-600">
          <Edit2 className="w-4 h-4 mr-2" /> Editează
        </Button>
        <Button 
          variant="danger" 
          fullWidth 
          onClick={onDeleteRequest} 
          disabled={vehicul.status === 'Inactiv'}
        >
          <Trash2 className="w-4 h-4 mr-2" /> 
          {vehicul.status === 'Activ' ? 'Dezactivează' : 'Inactiv'}
        </Button>
      </div>
    </div>
  );
}

// ============================================================================
// 3. PAGINA PRINCIPALĂ
// ============================================================================
export default function Vehicule() {
  const {
    vehiculeFiltrateSiSortate,
    clienti,
    loading,
    stats,
    cautare,
    setCautare,
    sortField,
    onSort,
    salveaza,
    sterge
  } = useVehicul();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [vehiculToEdit, setVehiculToEdit] = useState<VehiculEntity | null>(null);
  const [idVehiculSelectat, setIdVehiculSelectat] = useState<number | null>(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [vehiculToDelete, setVehiculToDelete] = useState<number | null>(null);

  const handleSave = async (data: any) => {
    try {
      await salveaza(data, vehiculToEdit?.idVehicul);
      setIsFormOpen(false);
      setVehiculToEdit(null);
      toast.success(vehiculToEdit ? "Vehicul actualizat cu succes" : "Vehicul adăugat cu succes");
    } catch (e) {
      toast.error("Eroare la salvare. Verificați datele.");
    }
  };

  const vehiculSelectat = vehiculeFiltrateSiSortate.find(v => v.idVehicul === idVehiculSelectat);

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <PageHeader 
        title="Gestiune Vehicule" 
        description="Administrează flota auto și clienții asociați." 
        actions={
          <Button onClick={() => { setVehiculToEdit(null); setIsFormOpen(true); setIdVehiculSelectat(null); }}>
            <Plus className="w-4 h-4 mr-2" /> Vehicul Nou
          </Button>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <StatCard label="Total Vehicule" value={stats.total} icon={<Car />} />
        <StatCard label="Vehicule Active" value={stats.activi} icon={<ClipboardList />} />
      </div>

      <div className="flex gap-6 relative items-start">
        <div className={`flex-1 space-y-4 transition-all duration-300 ${isFormOpen || vehiculSelectat ? 'hidden lg:block lg:w-2/3' : 'w-full'}`}>
          <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input 
                type="text" 
                placeholder="Caută după număr, serie șasiu sau client..." 
                value={cautare}
                onChange={(e) => setCautare(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-50 border-none rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>
          </div>

          {loading ? (
            <div className="py-12 text-center text-slate-500 font-medium">Se încarcă datele...</div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-x-auto">
              <table className="w-full whitespace-nowrap">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/50">
                    <ThSortable label="Număr" field="numarInmatriculare" currentSortField={sortField} onSort={onSort} />
                    <ThSortable label="Client" field="numeDetinator" currentSortField={sortField} onSort={onSort} />
                    <ThSortable label="Marcă" field="marca" currentSortField={sortField} onSort={onSort} />
                    <ThSortable label="Status" field="status" currentSortField={sortField} onSort={onSort} />
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {vehiculeFiltrateSiSortate.map((v) => (
                    <tr 
                      key={v.idVehicul} 
                      onClick={() => { setIdVehiculSelectat(v.idVehicul); setIsFormOpen(false); }}
                      className={`cursor-pointer transition-colors hover:bg-slate-50 ${idVehiculSelectat === v.idVehicul ? 'bg-indigo-50/50' : ''}`}
                    >
                      <td className="px-6 py-4 font-bold text-slate-800">{v.numarInmatriculare}</td>
                      <td className="px-6 py-4 font-medium text-slate-600">{v.numeDetinator}</td>
                      <td className="px-6 py-4 text-slate-500">{v.marca} {v.model}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center rounded-full px-2 py-1 text-[10px] font-bold uppercase tracking-wide ${v.status === 'Activ' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>
                          {v.status}
                        </span>
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
              <VehiculForm 
                initialData={vehiculToEdit} 
                clienti={clienti} 
                onClose={() => { setIsFormOpen(false); setVehiculToEdit(null); }} 
                onSave={handleSave} 
              />
            ) : vehiculSelectat ? (
              <VehiculDetail 
                vehicul={vehiculSelectat} 
                client={vehiculSelectat.clientObj}
                onInchide={() => setIdVehiculSelectat(null)}
                onEdit={() => { setVehiculToEdit(vehiculSelectat); setIsFormOpen(true); }}
                onDeleteRequest={() => { setVehiculToDelete(vehiculSelectat.idVehicul); setIsConfirmOpen(true); }}
              />
            ) : null}
          </div>
        )}
      </div>

      <ConfirmDialog 
        isOpen={isConfirmOpen}
        title="Dezactivare Vehicul"
        description="Ești sigur că vrei să dezactivezi acest vehicul? El nu va mai putea fi selectat pentru comenzi noi."
        onConfirm={async () => {
          if (vehiculToDelete) await sterge(vehiculToDelete);
          setIsConfirmOpen(false);
          setVehiculToDelete(null);
          setIdVehiculSelectat(null);
        }}
        onCancel={() => setIsConfirmOpen(false)}
      />
    </div>
  );
}