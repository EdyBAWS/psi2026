// src/modules/02operational/pages/gestiune-comenzi/useGestiuneComenzi.ts
import { useMemo, useState } from "react";
import { usePageSessionState } from "../../../../lib/pageState";
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
} from "../../types";

interface UseGestiuneComenziProps {
  asiguratori: Asigurator[];
  clienti: Client[];
  comenzi: ComandaService[];
  dosare: DosarDauna[];
  mecanici: Mecanic[];
  pozitii: PozitieComanda[];
  vehicule: Vehicul[];
}

export function useGestiuneComenzi({
  asiguratori,
  clienti,
  comenzi,
  dosare,
  mecanici,
  pozitii,
  vehicule,
}: UseGestiuneComenziProps) {
  const [cautare, setCautare] = usePageSessionState("gestiune-cautare", "");
  const [filtruStatus, setFiltruStatus] = usePageSessionState<StatusComanda | "Toate">("gestiune-status", "Toate");
  const [filtruMecanic, setFiltruMecanic] = usePageSessionState<number | "toate">("gestiune-mecanic", "toate");
  const [filtruPlata, setFiltruPlata] = usePageSessionState<ComandaService["tipPlata"] | "Toate">("gestiune-plata", "Toate");
  const [doarIntarziate, setDoarIntarziate] = usePageSessionState("gestiune-intarziate", false);
  
  const [sortField, setSortField] = usePageSessionState<GestiuneSortField>("gestiune-sortField", "data");
  const [sortDir, setSortDir] = usePageSessionState<GestiuneSortDir>("gestiune-sortDir", "desc");

  const [idComandaSelectata, setIdComandaSelectata] = useState<number | null>(null);

  const reseteazaFiltre = () => {
    setCautare("");
    setFiltruStatus("Toate");
    setFiltruMecanic("toate");
    setFiltruPlata("Toate");
    setDoarIntarziate(false);
  };

  const handleSchimbaSortare = (field: GestiuneSortField) => {
    if (sortField === field) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDir("desc");
    }
  };

  const comenziFiltrate = useMemo(() => {
    // ORDINE CORECTĂ: comenzi, clienti, vehicule
    return filtreazaSiSorteazaComenzi(comenzi, clienti, vehicule, {
      cautare, filtruStatus, filtruMecanic, filtruPlata, doarIntarziate,
    }, sortField, sortDir);
  }, [comenzi, clienti, vehicule, cautare, filtruStatus, filtruMecanic, filtruPlata, doarIntarziate, sortField, sortDir]);

  const liniiTabel = useMemo(() => {
    // ORDINE CORECTĂ: comenziFiltrate, clienti, vehicule
    return construiesteLiniiLista(comenziFiltrate, clienti, vehicule);
  }, [comenziFiltrate, clienti, vehicule]);

  const detaliiSelectate = useMemo(() => {
    // ORDINE CORECTĂ: id, comenzi, clienti, vehicule
    return rezolvaDetaliiComandaSelectata(
      idComandaSelectata,
      comenzi, clienti, vehicule, mecanici, dosare, asiguratori, pozitii
    );
  }, [idComandaSelectata, comenzi, clienti, vehicule, mecanici, dosare, asiguratori, pozitii]);

  return {
    stare: { cautare, filtruStatus, filtruMecanic, filtruPlata, doarIntarziate, sortField, sortDir, idComandaSelectata },
    setters: { setCautare, setFiltruStatus, setFiltruMecanic, setFiltruPlata, setDoarIntarziate, setIdComandaSelectata, reseteazaFiltre, handleSchimbaSortare },
    date: { statistici: useMemo(() => calculeazaStatisticiComenzi(comenzi), [comenzi]), comenziFiltrate, liniiTabel, detaliiSelectate }
  };
}