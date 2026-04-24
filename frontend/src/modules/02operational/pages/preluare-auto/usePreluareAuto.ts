import { useState, useMemo } from "react";
import { usePageSessionState } from "../../../../lib/pageState";
import { detaliiPreluareInitiale, stareDosarInitiala, type DetaliiPreluareForm, type StareDosarAsigurare } from "../../receptie/formState";
import { valideazaPreluare } from "../../receptie/validations";
import { calculeazaFluxPreluare, calculeazaIndicatoriPreluare, calculeazaPreviewDocumente } from "./preluareAuto.helpers";
import type { Asigurator, CatalogKit, CatalogManopera, CatalogPiesa, Client, ComandaService, DosarDauna, Mecanic, PozitieComandaDraft, Vehicul } from "../../types";

interface UsePreluareAutoProps {
  asiguratori: Asigurator[];
  catalogKituri: CatalogKit[];
  catalogManopere: CatalogManopera[];
  catalogPiese: CatalogPiesa[];
  clienti: Client[];
  comenzi: ComandaService[];
  dosare: DosarDauna[];
  mecanici: Mecanic[];
  vehicule: Vehicul[];
}

export function usePreluareAuto(props: UsePreluareAutoProps) {
  // --- STĂRI FORMULARE ȘI SELECȚIE ---
  const [idVehiculSelectat, setIdVehiculSelectat] = usePageSessionState<number | null>("preluare-vehicul", null);
  
  const [detaliiPreluare, setDetaliiPreluare] = useState<DetaliiPreluareForm>(detaliiPreluareInitiale);
  const [stareDosar, setStareDosar] = useState<StareDosarAsigurare>(stareDosarInitiala);
  const [pozitiiDraft, setPozitiiDraft] = useState<PozitieComandaDraft[]>([]);
  const [idMecanicSelectat, setIdMecanicSelectat] = useState<number | null>(null);
  
  const [esteLucrareAsigurare, setEsteLucrareAsigurare] = useState(false);

  // --- DERIVĂRI BAZATE PE SELECȚIE ---
  const vehiculSelectat = useMemo(() => 
    props.vehicule.find((v) => v.idVehicul === idVehiculSelectat) ?? null, 
  [idVehiculSelectat, props.vehicule]);

  const clientSelectat = useMemo(() => 
    vehiculSelectat ? (props.clienti.find((c) => c.idClient === vehiculSelectat.idClient) ?? null) : null,
  [vehiculSelectat, props.clienti]);

  const comandaActivaExistenta = useMemo(() => {
    if (!vehiculSelectat) return null;
    return props.comenzi.find((c) => c.idVehicul === vehiculSelectat.idVehicul && (
      c.status === "In asteptare diagnoza" || c.status === "Asteapta aprobare client" || 
      c.status === "Asteapta piese" || c.status === "In Lucru" || c.status === "Gata de livrare"
    )) ?? null;
  }, [vehiculSelectat, props.comenzi]);

  // --- CALCULE ȘI VALIDĂRI ---
  const validare = useMemo(() => {
    return valideazaPreluare({
      comandaActivaExistenta,
      detaliiPreluare,
      esteLucrareAsigurare,
      idMecanicSelectat,
      pozitiiDraft,
      stareDosar,
      totalEstimat: pozitiiDraft.reduce((acc, p) => acc + (p.cantitate * p.pretVanzare * (1 - p.discountProcent / 100) * (1 + p.cotaTVA / 100)), 0),
      vehiculSelectat,
    });
  }, [comandaActivaExistenta, detaliiPreluare, esteLucrareAsigurare, idMecanicSelectat, pozitiiDraft, stareDosar, vehiculSelectat]);

  const indicatori = useMemo(() => {
    return calculeazaIndicatoriPreluare(
      vehiculSelectat, esteLucrareAsigurare, validare.dosarValid, detaliiPreluare, idMecanicSelectat, pozitiiDraft
    );
  }, [vehiculSelectat, esteLucrareAsigurare, validare.dosarValid, detaliiPreluare, idMecanicSelectat, pozitiiDraft]);

  const flux = useMemo(() => {
    return calculeazaFluxPreluare({
      detaliiPreluare,
      dosarValid: !indicatori.lipsesteDosar,
      esteLucrareAsigurare,
      idMecanicSelectat,
      poateSalva: validare.poateSalva,
      pozitiiDraft,
      vehiculSelectat
    });
  }, [detaliiPreluare, indicatori.lipsesteDosar, esteLucrareAsigurare, idMecanicSelectat, validare.poateSalva, pozitiiDraft, vehiculSelectat]);

  const preview = useMemo(() => {
    return calculeazaPreviewDocumente(props.comenzi, props.dosare);
  }, [props.comenzi, props.dosare]);

  // --- HANDLERI ---
  const schimbaFluxAsigurare = (activ: boolean) => {
    setEsteLucrareAsigurare(activ);
    if (activ && detaliiPreluare.tipPlata !== "Asigurare") {
      setDetaliiPreluare((prev) => ({ ...prev, tipPlata: "Asigurare" }));
    }
  };

  const reseteazaFlux = () => {
    setIdVehiculSelectat(null);
    setDetaliiPreluare(detaliiPreluareInitiale);
    setStareDosar(stareDosarInitiala);
    setPozitiiDraft([]);
    setIdMecanicSelectat(null);
    setEsteLucrareAsigurare(false);
    
    // Scroll sus și când dăm "Resetează"
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  // NOU: Funcție care setează vehiculul și forțează scroll-ul sus animat
  const handleSelecteazaVehicul = (id: number | null) => {
    setIdVehiculSelectat(id);
    if (id !== null && typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return {
    stare: {
      idVehiculSelectat, detaliiPreluare, stareDosar, pozitiiDraft, idMecanicSelectat, esteLucrareAsigurare
    },
    setters: {
      // Am expus handler-ul nostru nou care învelește setIdVehiculSelectat original
      setIdVehiculSelectat: handleSelecteazaVehicul, 
      setDetaliiPreluare, setStareDosar, setPozitiiDraft, setIdMecanicSelectat, schimbaFluxAsigurare, reseteazaFlux
    },
    derivate: {
      vehiculSelectat, clientSelectat, comandaActivaExistenta,
      validare, indicatori, flux, preview
    }
  };
}