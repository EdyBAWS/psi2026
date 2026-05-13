// src/modules/01entitati/vehicule/Vehicul.tsx
import { useState } from "react";
import { Car, Search, ClipboardList, ArrowUpDown, Edit2, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "../../../componente/ui/PageHeader";
import { StatCard } from "../../../componente/ui/StatCard";
import { EmptyState } from "../../../componente/ui/EmptyState";
import { Button } from "../../../componente/ui/Button";
import { ConfirmDialog } from "../../../componente/ui/ConfirmDialog";
import { Card, CardContent } from "../../../componente/ui/Card";
import { VehiculForm } from "./VehiculForm";

import type { ClientEntity } from "../entitati.service";
import { useVehicul, type SortField } from "./useVehicul";

// ============================================================================
// 1. DETALII VEHICUL (STILIZAT CA FORMULARUL DIN CLIENT.TSX)
// ============================================================================
interface VehiculDetailProps {
  vehicul: any;
  client?: ClientEntity;
  onInchide: () => void;
  onEdit: () => void;
  onDeleteRequest: () => void;
  onNavigate?: (page: string) => void;
}

function VehiculDetail({ vehicul, client, onInchide, onEdit, onDeleteRequest, onNavigate }: VehiculDetailProps) {
  const istoricBrut = vehicul.istoricComenzi || [];
  const istoricUnic = Array.from(new Map(istoricBrut.map((cmd: any) => [cmd.idComanda, cmd])).values());

  const numeClient = client 
    ? (client.tipClient === 'PJ' ? client.nume : `${client.nume} ${client.prenume || ""}`).trim() 
    : "Client Necunoscut";

  return (
    <div className="rounded-2xl border border-indigo-100 bg-white p-6 shadow-xl animate-in fade-in slide-in-from-top-4 sticky top-6">
      <div className="flex items-start justify-between mb-6 border-b border-slate-100 pb-3">
        <div>
          <h4 className="text-lg font-bold text-slate-800">{vehicul.numarInmatriculare}</h4>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">ID: VHC-{vehicul.idVehicul}</p>
        </div>
        <div className="flex items-center gap-2">
           <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${vehicul.status === 'Activ' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>
            {vehicul.status}
          </span>
          <button onClick={onInchide} className="p-1 hover:bg-slate-100 rounded-lg text-slate-400">
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>

      <div className="space-y-6">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-indigo-500 mb-2">Specificații Auto</p>
          <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
            <div>
              <p className="text-[10px] text-slate-400 uppercase font-bold">Marcă & Model</p>
              <p className="font-bold text-slate-700 text-sm">{vehicul.marca} {vehicul.model}</p>
            </div>
            <div>
              <p className="text-[10px] text-slate-400 uppercase font-bold">VIN</p>
              <p className="text-xs font-mono font-bold text-slate-700">{vehicul.vin || '-'}</p>
            </div>
          </div>
        </div>

        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-indigo-500 mb-2">Proprietar</p>
          <div className="p-4 rounded-xl border border-slate-200 bg-white">
            <p className="font-bold text-slate-800">{numeClient}</p>
            {client?.telefon && <p className="text-xs text-slate-500 mt-1">📞 {client.telefon}</p>}
          </div>
        </div>

        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-indigo-500 mb-2">Istoric Reparații ({istoricUnic.length})</p>
          <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
            {istoricUnic.length === 0 ? (
              <p className="text-xs text-slate-400 italic">Lipsă istoric.</p>
            ) : (
              istoricUnic.map((cmd: any) => (
                <div 
                  key={cmd.idComanda} 
                  className="flex items-center justify-between p-3 rounded-xl border border-slate-100 hover:border-indigo-200 hover:bg-indigo-50/50 transition-all cursor-pointer group"
                  onClick={() => {
                    sessionStorage.setItem('gestiune-idComandaSelectata', cmd.idComanda.toString());
                    if (onNavigate) onNavigate('operational-comenzi');
                  }}
                >
                  <div>
                    <p className="text-xs font-bold text-slate-700 group-hover:text-indigo-600">{cmd.numarComanda}</p>
                    <p className="text-[9px] text-slate-400">{new Date(cmd.createdAt).toLocaleDateString('ro-RO')}</p>
                  </div>
                  {cmd.status === "FINALIZAT" && (
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        sessionStorage.setItem('facturare-idComandaSelectata', cmd.idComanda.toString());
                        if (onNavigate) onNavigate('facturare-comenzi');
                      }}
                      className="text-[9px] font-bold uppercase bg-emerald-50 text-emerald-700 px-2 py-1 rounded"
                    >
                      Factură →
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <div className="flex gap-3 mt-8 pt-4 border-t border-slate-50">
        <Button variant="outline" fullWidth onClick={onEdit}>
          <Edit2 className="w-4 h-4 mr-2" /> Editează
        </Button>
        <Button 
          variant="ghost" 
          fullWidth 
          onClick={onDeleteRequest} 
          disabled={vehicul.status === 'Inactiv'}
          className="text-rose-500 hover:bg-rose-50"
        >
          <Trash2 className="w-4 h-4 mr-2" /> Dezactivează
        </Button>
      </div>
    </div>
  );
}

// ============================================================================
// 3. PAGINA PRINCIPALĂ (STRUCTURĂ IDENTICĂ CU CLIENT.TSX)
// ============================================================================
export default function Vehicule({ onNavigate }: { onNavigate?: (page: string) => void }) {
  const {
    vehiculeFiltrateSiSortate, clienti, loading, stats, cautare, setCautare,
    sortField, sortDir, onSort, salveaza, sterge
  } = useVehicul();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [vehiculToEdit, setVehiculToEdit] = useState<any | null>(null);
  const [idSelectat, setIdSelectat] = useState<number | null>(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  const deschideAdaugare = () => { setVehiculToEdit(null); setIdSelectat(null); setIsFormOpen(true); };
  
  const handleSave = async (data: any) => {
    try {
      await salveaza(data, vehiculToEdit?.idVehicul);
      setIsFormOpen(false);
      setVehiculToEdit(null);
      toast.success(vehiculToEdit ? "Vehicul actualizat" : "Vehicul adăugat");
    } catch (err) { console.error(err); }
  };

  const renderSortIcon = (field: SortField) => {
    if (sortField !== field) return <ArrowUpDown className="h-3 w-3 opacity-30" />;
    return <span className="text-indigo-600 font-bold text-xs">{sortDir === 'asc' ? '↑' : '↓'}</span>;
  };

  const vehiculSelectat = vehiculeFiltrateSiSortate.find(v => v.idVehicul === idSelectat);

  if (loading) return <div className="py-12 text-center text-slate-500">Se încarcă flota auto...</div>;

  return (
    <div className="space-y-6 pb-10">
      {/* HEADER & STATS (STIL CLIENT.TSX) */}
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
          <Car className="w-64 h-64 text-indigo-900" />
        </div>
        <div className="relative z-10">
        <PageHeader 
          title="Gestiune Vehicule" 
          description="Administrează flota auto a clienților și urmărește istoricul intervențiilor tehnice." 
          actions={
            <Button variant={isFormOpen ? "outline" : "primary"} onClick={isFormOpen ? () => setIsFormOpen(false) : deschideAdaugare}>
              {isFormOpen ? 'Închide Formularul' : '+ Adaugă Vehicul'}
            </Button>
          }
        />
        <div className="flex flex-wrap gap-4 mt-6">
          <StatCard label="Total Vehicule" value={stats.total} icon={<Car />} />
          <StatCard label="Vehicule Active" value={stats.activi} tone="info" icon={<ClipboardList />} />
        </div>
        </div>
      </div>

      {/* SEARCH BAR (STIL CLIENT.TSX) */}
      <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:max-w-md">
          <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
          <input 
            type="text" placeholder="Caută după număr, serie șasiu sau client..." 
            className="w-full rounded-xl border border-slate-200 py-2.5 pl-10 pr-4 outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
            value={cautare} onChange={(e) => setCautare(e.target.value)}
          />
        </div>
      </div>

      {/* FORMULAR ADAUGARE/EDITARE */}
      {isFormOpen && (
        <div className="rounded-2xl border border-indigo-100 bg-white p-6 shadow-xl animate-in fade-in slide-in-from-top-4">
          <h4 className="mb-6 text-lg font-bold text-slate-800 border-b border-slate-100 pb-3">
            {vehiculToEdit ? 'Editare Vehicul' : 'Înregistrare Vehicul Nou'}
          </h4>
          <VehiculForm 
            initialData={vehiculToEdit} 
            clienti={clienti} 
            onClose={() => { setIsFormOpen(false); setVehiculToEdit(null); }} 
            onSave={handleSave} 
          />
        </div>
      )}

      {/* TABEL & DETALII (STIL CLIENT.TSX) */}
      <div className="flex flex-col xl:flex-row gap-6 items-start">
        <Card className={`overflow-hidden border-slate-100 shadow-sm flex-1 ${vehiculSelectat ? 'hidden xl:block' : 'w-full'}`}>
          <CardContent className="p-0">
            {vehiculeFiltrateSiSortate.length === 0 ? (
               <div className="py-12"><EmptyState icon={<Car />} title="Niciun vehicul găsit" description="Verifică filtrele sau adaugă un vehicul nou." actionLabel="+ Adaugă Vehicul" onAction={deschideAdaugare} /></div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full text-left text-sm">
                  <thead className="bg-slate-50 text-[10px] font-bold uppercase text-slate-400 border-b border-slate-200">
                    <tr>
                      <th className="px-6 py-4 cursor-pointer hover:bg-slate-100 transition-colors" onClick={() => onSort('numarInmatriculare')}>
                        Nr. Înmatriculare {renderSortIcon('numarInmatriculare')}
                      </th>
                      <th className="px-6 py-4 cursor-pointer hover:bg-slate-100 transition-colors" onClick={() => onSort('numeDetinator')}>
                        Client / Proprietar {renderSortIcon('numeDetinator')}
                      </th>
                      <th className="px-6 py-4 cursor-pointer hover:bg-slate-100 transition-colors" onClick={() => onSort('marca')}>
                        Model {renderSortIcon('marca')}
                      </th>
                      <th className="px-6 py-4">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {vehiculeFiltrateSiSortate.map((v) => (
                      <tr 
                        key={v.idVehicul} 
                        onClick={() => { setIdSelectat(v.idVehicul); setIsFormOpen(false); }}
                        className={`hover:bg-slate-50 transition-colors cursor-pointer group ${idSelectat === v.idVehicul ? 'bg-indigo-50' : ''}`}
                      >
                        <td className="px-6 py-4 font-bold text-slate-800 tabular-nums">{v.numarInmatriculare}</td>
                        <td className="px-6 py-4 font-semibold text-slate-600">{v.numeDetinator}</td>
                        <td className="px-6 py-4 text-slate-500">{v.marca} {v.model}</td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${v.status === 'Activ' ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>
                            {v.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* PANOU DETALII SIDEBAR */}
        {vehiculSelectat && (
          <div className="w-full xl:w-[450px] shrink-0">
            <VehiculDetail 
              vehicul={vehiculSelectat} 
              client={vehiculSelectat.clientObj}
              onInchide={() => setIdSelectat(null)}
              onEdit={() => { setVehiculToEdit(vehiculSelectat); setIsFormOpen(true); }}
              onDeleteRequest={() => setIsConfirmOpen(true)}
              onNavigate={onNavigate}
            />
          </div>
        )}
      </div>

      <ConfirmDialog 
        isOpen={isConfirmOpen}
        title="Dezactivare Vehicul"
        description="Ești sigur că vrei să marchezi acest vehicul ca inactiv? Acesta nu va mai putea fi selectat pentru recepții noi."
        onConfirm={async () => {
          if (idSelectat) await sterge(idSelectat);
          setIsConfirmOpen(false);
          setIdSelectat(null);
        }}
        onCancel={() => setIsConfirmOpen(false)}
      />
    </div>
  );
}