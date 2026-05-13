import { ClipboardList, Wrench } from "lucide-react";
import { createPortal } from "react-dom";
import { PageHeader } from "../../../../componente/ui/PageHeader";
import { StatCard } from "../../../../componente/ui/StatCard";
import { EmptyState } from "../../../../componente/ui/EmptyState";
import GestiuneComenziDetail from "./components/GestiuneComenziDetail";
import GestiuneComenziFilters from "./components/GestiuneComenziFilters";
import GestiuneComenziTable from "./components/GestiuneComenziTable";
import { useGestiuneComenzi } from "./useGestiuneComenzi";
import type { Asigurator, CatalogKit, CatalogManopera, CatalogPiesa, Client, ComandaService, DosarDauna, Mecanic, PozitieComanda, PozitieComandaDraft, Vehicul } from "../../types";

interface GestiuneComenziProps {
  asiguratori: Asigurator[];
  clienti: Client[];
  comenzi: ComandaService[];
  dosare: DosarDauna[];
  mecanici: Mecanic[];
  pozitii: PozitieComanda[];
  vehicule: Vehicul[];
  catalogPiese: CatalogPiesa[];
  catalogManopere: CatalogManopera[];
  catalogKituri: CatalogKit[];
  onActualizeazaComanda: (idComanda: number, modificari: Partial<ComandaService>) => Promise<void>;
  onActualizeazaPozitii: (idComanda: number, pozitii: PozitieComandaDraft[]) => Promise<void>;
}

export default function GestiuneComenzi(props: GestiuneComenziProps) {
  const { stare, setters, date } = useGestiuneComenzi(props);

  return (
    <div className="space-y-8">
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
        <PageHeader title="Registru Comenzi Service" description="Monitorizează fluxul de lucru." />
        <div className="flex flex-wrap gap-4 mt-6">
          <StatCard label="Active" value={date.statistici.totalComenziActive} icon={<Wrench className="h-4 w-4" />} />
          <StatCard label="Istoric" value={date.statistici.totalComenzi} tone="success" icon={<ClipboardList className="h-4 w-4" />} />
        </div>
      </div>

      <div className="flex w-full flex-col gap-6 xl:flex-row xl:items-start">
        <div className="flex-1 space-y-6">
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 shadow-sm">
            <GestiuneComenziFilters
              cautare={stare.cautare}
              doarIntarziate={stare.doarIntarziate}
              filtruMecanic={stare.filtruMecanic}
              filtruStatus={stare.filtruStatus}
              mecanici={props.mecanici}
              onCautareChange={setters.setCautare}
              onDoarIntarziateChange={setters.setDoarIntarziate}
              onFiltruMecanicChange={setters.setFiltruMecanic}
              onFiltruStatusChange={setters.setFiltruStatus}
              onReset={setters.reseteazaFiltre}
              sortDir={stare.sortDir}
              sortField={stare.sortField}
            />
          </div>

          {date.comenziFiltrate.length === 0 ? (
            <EmptyState title="Nicio comandă" description="Comenzile noi vor apărea aici." />
          ) : (
            <GestiuneComenziTable
              idComandaSelectata={stare.idComandaSelectata}
              comenzi={date.liniiTabel} 
              onSort={setters.handleSchimbaSortare}
              onSelecteazaComanda={setters.setIdComandaSelectata}
              sortDir={stare.sortDir}
              sortField={stare.sortField}
            />
          )}
        </div>

      </div>
      
      {stare.idComandaSelectata !== null && date.detaliiSelectate.comandaSelectata ? createPortal(
        <div 
          className="global-overlay animate-in fade-in duration-300"
          onClick={(e) => {
            if (e.target === e.currentTarget) setters.setIdComandaSelectata(null);
          }}
        >
          <div className="w-full max-w-5xl max-h-[90vh] overflow-hidden rounded-3xl shadow-2xl animate-in zoom-in-95 duration-300 bg-white border border-slate-200">
            <GestiuneComenziDetail
              {...date.detaliiSelectate}
              mecanici={props.mecanici}
              catalogPiese={props.catalogPiese}
              catalogManopere={props.catalogManopere}
              catalogKituri={props.catalogKituri}
              onActualizeazaComanda={props.onActualizeazaComanda}
              onActualizeazaPozitii={props.onActualizeazaPozitii}
              onInchide={() => setters.setIdComandaSelectata(null)}
            />
          </div>
        </div>,
        document.body
      ) : null}
    </div>
  );
}
