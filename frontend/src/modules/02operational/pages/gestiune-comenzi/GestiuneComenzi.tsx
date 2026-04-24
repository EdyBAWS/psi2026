// src/modules/02operational/pages/gestiune-comenzi/GestiuneComenzi.tsx
import { AlertTriangle, ClipboardList, Wrench } from "lucide-react";
import { PageHeader } from "../../../../componente/ui/PageHeader";
import { StatCard } from "../../../../componente/ui/StatCard";
import { EmptyState } from "../../../../componente/ui/EmptyState";
import GestiuneComenziDetail from "./components/GestiuneComenziDetail";
import GestiuneComenziFilters from "./components/GestiuneComenziFilters";
import GestiuneComenziTable from "./components/GestiuneComenziTable";
import { useGestiuneComenzi } from "./useGestiuneComenzi";
import type {
  Asigurator, Client, ComandaService, DosarDauna, Mecanic, PozitieComanda, Vehicul,
} from "../../types";

interface GestiuneComenziProps {
  asiguratori: Asigurator[];
  clienti: Client[];
  comenzi: ComandaService[];
  dosare: DosarDauna[];
  mecanici: Mecanic[];
  pozitii: PozitieComanda[];
  vehicule: Vehicul[];
}

export default function GestiuneComenzi(props: GestiuneComenziProps) {
  const { stare, setters, date } = useGestiuneComenzi(props);

  return (
    <div className="space-y-6 pb-10">
      {/* HEADER UNITAR STIL CATALOG/ENTITĂȚI */}
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
        <PageHeader 
          title="Registru Comenzi Service" 
          description="Monitorizează fluxul de lucru, statusul reparațiilor și termenele de livrare promise clienților."
        />
        <div className="flex flex-wrap gap-4 mt-6">
          <StatCard label="Comenzi Active" value={date.statistici.totalComenziActive} icon={<Wrench className="h-4 w-4" />} />
          <StatCard label="Termen Depășit" value={date.statistici.totalIntarziate} tone="danger" icon={<AlertTriangle className="h-4 w-4" />} />
          <StatCard label="Total Istoric" value={date.statistici.totalComenzi} tone="success" icon={<ClipboardList className="h-4 w-4" />} />
        </div>
      </div>

      <div className="flex w-full flex-col gap-6 xl:flex-row xl:items-start">
        <div className="flex-1 space-y-6">
          {/* TOOLBAR RAFINAT */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 shadow-sm">
            <GestiuneComenziFilters
              cautare={stare.cautare}
              doarIntarziate={stare.doarIntarziate}
              filtruMecanic={stare.filtruMecanic}
              filtruPlata={stare.filtruPlata}
              filtruStatus={stare.filtruStatus}
              mecanici={props.mecanici}
              onCautareChange={setters.setCautare}
              onDoarIntarziateChange={setters.setDoarIntarziate}
              onFiltruMecanicChange={setters.setFiltruMecanic}
              onFiltruPlataChange={setters.setFiltruPlata}
              onFiltruStatusChange={setters.setFiltruStatus}
              onReset={setters.reseteazaFiltre}
              sortDir={stare.sortDir}
              sortField={stare.sortField}
            />
          </div>

          {/* TABEL SAU EMPTY STATE */}
          {date.comenziFiltrate.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-100 p-12 shadow-sm">
              <EmptyState
                title={props.comenzi.length === 0 ? "Nu există comenzi deschise" : "Nicio potrivire"}
                description={
                  props.comenzi.length === 0
                    ? "Comenzile noi create în secțiunea 'Recepție' vor apărea automat aici."
                    : "Nu am găsit nicio comandă care să respecte filtrele selectate."
                }
                actionLabel={props.comenzi.length === 0 ? undefined : "Resetează toate filtrele"}
                onAction={props.comenzi.length === 0 ? undefined : setters.reseteazaFiltre}
              />
            </div>
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

        {/* PANOU DETALII LATERAL */}
        {stare.idComandaSelectata !== null && date.detaliiSelectate.comandaSelectata ? (
          <div className="w-full shrink-0 xl:sticky xl:top-6 xl:w-[420px] animate-in fade-in slide-in-from-right-4">
            <GestiuneComenziDetail
              {...date.detaliiSelectate}
              onInchide={() => setters.setIdComandaSelectata(null)}
            />
          </div>
        ) : null}
      </div>
    </div>
  );
}