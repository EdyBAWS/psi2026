import { useMemo, useEffect } from "react";
import { usePageSessionState } from "../../../../lib/pageState";
import { detaliiPreluareInitiale, stareDosarInitiala, type DetaliiPreluareForm, type StareDosarAsigurare } from "../../receptie/formState";
import { valideazaPreluare } from "../../receptie/validations";
import { calculeazaFluxPreluare, calculeazaIndicatoriPreluare, calculeazaPreviewDocumente, calculeazaRezumatPozitii } from "./preluareAuto.helpers";
import type { Asigurator, CatalogKit, CatalogManopera, CatalogPiesa, Client, ComandaService, DosarDauna, Mecanic, PozitieComandaDraft, Vehicul } from "../../types";

export function usePreluareAuto(props: {
  asiguratori: Asigurator[]; catalogKituri: CatalogKit[]; catalogManopere: CatalogManopera[]; catalogPiese: CatalogPiesa[];
  clienti: Client[]; comenzi: ComandaService[]; dosare: DosarDauna[]; mecanici: Mecanic[]; vehicule: Vehicul[];
}) {
  const [idVehiculSelectat, setIdVehiculSelectat] = usePageSessionState<number | null>("preluare-vehicul", null);
  const [detaliiPreluare, setDetaliiPreluare] = usePageSessionState<DetaliiPreluareForm>("preluare-detalii", detaliiPreluareInitiale);
  const [stareDosar, setStareDosar] = usePageSessionState<StareDosarAsigurare>("preluare-dosar", stareDosarInitiala);
  const [pozitiiDraft, setPozitiiDraft] = usePageSessionState<PozitieComandaDraft[]>("preluare-pozitii", []);
  const [idMecaniciSelectati, setIdMecaniciSelectati] = usePageSessionState<number[]>("preluare-mecanici", []);
  const [esteLucrareAsigurare, setEsteLucrareAsigurare] = usePageSessionState<boolean>("preluare-este-asigurare", false);

  // SelectorDosar păstrează toate informațiile despre dosar în `stareDosar`.
  // Derivăm id-ul de aici ca să nu avem două surse de adevăr pentru același
  // lucru.
  const idDosarSelectat = esteLucrareAsigurare && stareDosar.mod === "existent"
    ? stareDosar.idDosarSelectat
    : null;
  const vehiculSelectat = useMemo(() => props.vehicule.find((v) => v.idVehicul === idVehiculSelectat) ?? null, [idVehiculSelectat, props.vehicule]);
  const dosarSelectat = useMemo(() => props.dosare.find(d => d.idDosar === idDosarSelectat) ?? null, [idDosarSelectat, props.dosare]);
  const clientSelectat = useMemo(() => vehiculSelectat ? (props.clienti.find((c) => c.idClient === vehiculSelectat.idClient) ?? null) : null, [vehiculSelectat, props.clienti]);
  const totalCurent = useMemo(() => calculeazaRezumatPozitii(pozitiiDraft).total, [pozitiiDraft]);

  const comandaActivaExistenta = useMemo(() => {
    if (!vehiculSelectat) return null;
    return props.comenzi.find((c) => c.idVehicul === vehiculSelectat.idVehicul && (c.status !== "Facturat" && c.status !== "Anulat" && c.status !== "Finalizat")) ?? null;
  }, [vehiculSelectat, props.comenzi]);

  const validare = useMemo(() => valideazaPreluare({
    comandaActivaExistenta, detaliiPreluare, esteLucrareAsigurare, idMecaniciSelectati, pozitiiDraft, stareDosar, totalEstimat: totalCurent, vehiculSelectat
  }), [comandaActivaExistenta, detaliiPreluare, esteLucrareAsigurare, idMecaniciSelectati, pozitiiDraft, stareDosar, vehiculSelectat, totalCurent]);

  const indicatori = useMemo(() => calculeazaIndicatoriPreluare(
    vehiculSelectat, esteLucrareAsigurare, validare.dosarValid, detaliiPreluare, idMecaniciSelectati, pozitiiDraft
  ), [vehiculSelectat, esteLucrareAsigurare, validare.dosarValid, detaliiPreluare, idMecaniciSelectati, pozitiiDraft]);

  const flux = useMemo(() => calculeazaFluxPreluare({
    detaliiPreluare, dosarValid: validare.dosarValid, esteLucrareAsigurare, idMecaniciSelectati, poateSalva: validare.poateSalva, pozitiiDraft, vehiculSelectat
  }), [detaliiPreluare, validare.dosarValid, esteLucrareAsigurare, idMecaniciSelectati, validare.poateSalva, pozitiiDraft, vehiculSelectat]);

  // Când se schimbă vehiculul, dosarul selectat anterior nu mai este valid.
  useEffect(() => { setStareDosar(stareDosarInitiala); }, [idVehiculSelectat, setStareDosar]);

  const schimbaFluxAsigurare = (activ: boolean) => {
    setEsteLucrareAsigurare(activ);
    if (activ && detaliiPreluare.tipPlata !== "Asigurare") {
      setDetaliiPreluare((p) => ({ ...p, tipPlata: "Asigurare" }));
    } else if (!activ && detaliiPreluare.tipPlata === "Asigurare") {
      setDetaliiPreluare((p) => ({ ...p, tipPlata: "Client Direct" }));
    }
  };

  const reseteazaFlux = () => {
    setIdVehiculSelectat(null); setDetaliiPreluare(detaliiPreluareInitiale);
    setStareDosar(stareDosarInitiala); setPozitiiDraft([]); setIdMecaniciSelectati([]); setEsteLucrareAsigurare(false);
  };

  return {
    stare: { idVehiculSelectat, idDosarSelectat, detaliiPreluare, stareDosar, pozitiiDraft, idMecaniciSelectati, esteLucrareAsigurare },
    setters: { setIdVehiculSelectat, setDetaliiPreluare, setStareDosar, setPozitiiDraft, setIdMecaniciSelectati, setEsteLucrareAsigurare, reseteazaFlux, schimbaFluxAsigurare },
    derivate: { vehiculSelectat, dosarSelectat, clientSelectat, comandaActivaExistenta, validare, indicatori, flux, preview: calculeazaPreviewDocumente(props.comenzi, props.dosare) }
  };
}

