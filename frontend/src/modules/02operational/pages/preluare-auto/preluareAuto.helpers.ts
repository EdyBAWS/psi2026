import { calculeazaRezumatPozitii as calcRezumat } from "../../calculations";
import { suntPozitiiValide } from "../../receptie/validations";
import type { ComandaService, DosarDauna, PozitieComandaDraft, Vehicul, StatusComanda } from "../../types";
import type { DetaliiPreluareForm } from "../../receptie/formState";

export const calculeazaRezumatPozitii = calcRezumat;
export const formatSuma = (v: number) => new Intl.NumberFormat("ro-RO", { style: "currency", currency: "RON" }).format(v);
export const formatData = (v?: Date | string | null) => v ? new Date(v).toLocaleDateString("ro-RO") : "-";
export const urmatorulId = <T>(items: T[], selector: (item: T) => number) => items.length === 0 ? 1 : Math.max(...items.map(selector)) + 1;
export const genereazaNumarDocument = (prefix: string, id: number) => `${prefix}-${new Date().getFullYear()}-${String(id).padStart(3, "0")}`;

export const statusuriFiltrare: Array<StatusComanda | "Toate"> = ["Toate", "In asteptare diagnoza", "Asteapta aprobare client", "In asteptare piese", "In lucru", "Finalizat", "Facturat", "Anulat"];
export function descriereSortare(camp: string, dir: "asc" | "desc") { return `Sortat după ${camp}, ${dir === "asc" ? "crescător" : "descrescător"}`; }

export function calculeazaPreviewDocumente(comenzi: ComandaService[], dosare: DosarDauna[]) {
  return {
    numarComandaPreview: genereazaNumarDocument("CMD", urmatorulId(comenzi, (c) => c.idComanda)),
    numarDosarPreview: genereazaNumarDocument("DAUNA", urmatorulId(dosare, (d) => d.idDosar)),
  };
}

export function calculeazaFluxPreluare({ detaliiPreluare, dosarValid, esteLucrareAsigurare, idMecanicSelectat, poateSalva, pozitiiDraft, vehiculSelectat }: any) {
  const pasiFlux = esteLucrareAsigurare ? ["Selectare auto", "Simptome", "Dosar Daună", "Deviz", "Confirmare"] : ["Selectare auto", "Simptome", "Deviz", "Confirmare"];
  let pasCurent = 1;
  if (!vehiculSelectat) return { pasiFlux, pasCurent };
  if (detaliiPreluare.simptomeReclamate.trim().length > 0) {
    pasCurent = 2;
    if (esteLucrareAsigurare && dosarValid) pasCurent = 3;
  }
  if (suntPozitiiValide(pozitiiDraft) && idMecanicSelectat !== null && poateSalva) pasCurent = pasiFlux.length;
  return { pasiFlux, pasCurent };
}

export function calculeazaIndicatoriPreluare(vehiculSelectat: Vehicul | null, esteLucrareAsigurare: boolean, dosarValid: boolean, detaliiPreluare: DetaliiPreluareForm, idMecanicSelectat: number | null, pozitiiDraft: PozitieComandaDraft[]) {
  return {
    lipsescSimptomeSauMecanic: vehiculSelectat !== null && (!detaliiPreluare.simptomeReclamate || idMecanicSelectat === null || !suntPozitiiValide(pozitiiDraft)),
    lipsesteDosar: vehiculSelectat !== null && esteLucrareAsigurare && !dosarValid,
    rezumatPozitii: calcRezumat(pozitiiDraft),
  };
}