import { AlertTriangle, ClipboardList, Wrench } from "lucide-react";
import { useEffect } from "react";
import { EmptyState } from "../../../componente/ui/EmptyState";
import { StatCard } from "../../../componente/ui/StatCard";
import { usePageSessionState } from "../../../lib/pageState";
import GestiuneComenziDetail from "./components/GestiuneComenziDetail";
import GestiuneComenziFilters from "./components/GestiuneComenziFilters";
import GestiuneComenziTable from "./components/GestiuneComenziTable";
import {
  calculeazaStatisticiComenzi,
  construiesteLiniiLista,
  filtreazaSiSorteazaComenzi,
  rezolvaDetaliiComandaSelectata,
  type GestiuneSortDir,
  type GestiuneSortField,
} from "./gestiuneComenzi.helpers";
import type {
  Asigurator,
  Client,
  ComandaService,
  DosarDauna,
  Mecanic,
  PozitieComanda,
  StatusComanda,
  Vehicul,
} from "../types";

interface GestiuneComenziProps {
  asiguratori: Asigurator[];
  clienti: Client[];
  comenzi: ComandaService[];
  dosare: DosarDauna[];
  mecanici: Mecanic[];
  pozitii: PozitieComanda[];
  vehicule: Vehicul[];
}

export default function GestiuneComenzi({
  asiguratori,
  clienti,
  comenzi,
  dosare,
  mecanici,
  pozitii,
  vehicule,
}: GestiuneComenziProps) {
  const [cautare, setCautare] = usePageSessionState(
    "operational-comenzi-cautare",
    "",
  );
  const [filtruStatus, setFiltruStatus] = usePageSessionState<
    StatusComanda | "Toate"
  >("operational-comenzi-status", "Toate");
  const [filtruMecanic, setFiltruMecanic] = usePageSessionState<
    number | "toate"
  >("operational-comenzi-mecanic", "toate");
  const [filtruPlata, setFiltruPlata] = usePageSessionState<
    ComandaService["tipPlata"] | "Toate"
  >("operational-comenzi-plata", "Toate");
  const [doarIntarziate, setDoarIntarziate] = usePageSessionState(
    "operational-comenzi-intarziate",
    false,
  );
  const [idComandaSelectata, setIdComandaSelectata] = usePageSessionState<
    number | null
  >("operational-comenzi-selectata", null);
  const [sortField, setSortField] = usePageSessionState<GestiuneSortField>(
    "operational-comenzi-sort-field",
    "data",
  );
  const [sortDir, setSortDir] = usePageSessionState<GestiuneSortDir>(
    "operational-comenzi-sort-dir",
    "desc",
  );

  const handleSort = (field: GestiuneSortField) => {
    if (sortField === field) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
      return;
    }

    setSortField(field);
    setSortDir(field === "data" || field === "valoare" ? "desc" : "asc");
  };

  const reseteazaFiltre = () => {
    setCautare("");
    setFiltruStatus("Toate");
    setFiltruMecanic("toate");
    setFiltruPlata("Toate");
    setDoarIntarziate(false);
    setSortField("data");
    setSortDir("desc");
  };

  const comenziFiltrate = filtreazaSiSorteazaComenzi(
    comenzi,
    clienti,
    vehicule,
    { cautare, filtruStatus, filtruMecanic, filtruPlata, doarIntarziate },
    sortField,
    sortDir,
  );
  const liniiLista = construiesteLiniiLista(comenziFiltrate, clienti, vehicule);
  const statistici = calculeazaStatisticiComenzi(comenzi);
  const detaliiComanda = rezolvaDetaliiComandaSelectata(
    idComandaSelectata,
    comenziFiltrate,
    clienti,
    vehicule,
    mecanici,
    dosare,
    asiguratori,
    pozitii,
  );

  useEffect(() => {
    if (idComandaSelectata === null) {
      return;
    }

    const existaInLista = comenziFiltrate.some(
      (comanda) => comanda.idComanda === idComandaSelectata,
    );
    if (!existaInLista) {
      setIdComandaSelectata(null);
    }
  }, [comenziFiltrate, idComandaSelectata, setIdComandaSelectata]);

  return (
    <section className="relative space-y-8 pb-10">
      <style>{`
        @keyframes slideFadeIn {
          from { opacity: 0; transform: translateY(-16px) scale(0.99); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        .animate-fisa-intrare {
          animation: slideFadeIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>

      {detaliiComanda.comandaSelectata ? (
        <GestiuneComenziDetail
          {...detaliiComanda}
          onInchide={() => setIdComandaSelectata(null)}
        />
      ) : null}

      <div className="space-y-6 rounded-2xl border border-slate-100 bg-white p-8 shadow-sm">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h3 className="text-2xl font-bold tracking-tight text-slate-800">
              Registru comenzi service
            </h3>
            <p className="mt-1 text-sm text-slate-500">
              Urmărește și gestionează stadiul lucrărilor și detaliile fiecărui
              deviz.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <StatCard
              label="Total comenzi"
              value={statistici.totalComenzi}
              icon={<ClipboardList className="h-4 w-4" />}
            />
            <StatCard
              label="Active"
              value={statistici.totalComenziActive}
              tone="info"
              icon={<Wrench className="h-4 w-4" />}
            />
            <StatCard
              label="Întârziate"
              value={statistici.totalIntarziate}
              tone="danger"
              icon={<AlertTriangle className="h-4 w-4" />}
            />
          </div>
        </div>

        <GestiuneComenziFilters
          cautare={cautare}
          doarIntarziate={doarIntarziate}
          filtruMecanic={filtruMecanic}
          filtruPlata={filtruPlata}
          filtruStatus={filtruStatus}
          mecanici={mecanici}
          onCautareChange={setCautare}
          onDoarIntarziateChange={setDoarIntarziate}
          onFiltruMecanicChange={setFiltruMecanic}
          onFiltruPlataChange={setFiltruPlata}
          onFiltruStatusChange={setFiltruStatus}
          onReset={reseteazaFiltre}
          sortDir={sortDir}
          sortField={sortField}
        />
      </div>

      {comenziFiltrate.length === 0 ? (
        <EmptyState
          title={
            comenzi.length === 0
              ? "Nu există comenzi în registru"
              : "Nu există rezultate"
          }
          description={
            comenzi.length === 0
              ? "Comenzile noi deschise din recepție vor apărea aici împreună cu detaliile lor."
              : "Filtrele actuale nu au găsit nicio comandă. Poți reseta rapid căutarea și filtrele."
          }
          actionLabel={comenzi.length === 0 ? undefined : "Resetează filtrele"}
          onAction={comenzi.length === 0 ? undefined : reseteazaFiltre}
        />
      ) : (
        <GestiuneComenziTable
          comenzi={liniiLista}
          idComandaSelectata={idComandaSelectata}
          onSelecteazaComanda={setIdComandaSelectata}
          onSort={handleSort}
          sortDir={sortDir}
          sortField={sortField}
        />
      )}
    </section>
  );
}
