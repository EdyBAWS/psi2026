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

export function calculeazaFluxPreluare({ detaliiPreluare, dosarValid, esteLucrareAsigurare, idMecaniciSelectati, poateSalva, pozitiiDraft, vehiculSelectat }: any) {
  const pasiFlux = esteLucrareAsigurare ? ["Selectare auto", "Simptome", "Dosar Daună", "Alege piese/manopere necesare", "Confirmare"] : ["Selectare auto", "Simptome", "Alege piese/manopere necesare", "Confirmare"];
  let pasCurent = 1;
  if (!vehiculSelectat) return { pasiFlux, pasCurent };
  
  pasCurent = 2; // Avem vehicul, suntem la simptome
  
  if (detaliiPreluare.simptomeReclamate.trim().length >= 10) {
    if (esteLucrareAsigurare) {
      pasCurent = 3; // Simptome OK, suntem la Dosar
      if (dosarValid) pasCurent = 4; // Dosar OK, suntem la Piese
    } else {
      pasCurent = 3; // Simptome OK, suntem la Piese (fără dosar)
    }
  }

  if (suntPozitiiValide(pozitiiDraft) && idMecaniciSelectati.length > 0 && poateSalva) {
    pasCurent = pasiFlux.length; // Totul OK, suntem la Confirmare
  }
  
  return { pasiFlux, pasCurent };
}

export function calculeazaIndicatoriPreluare(vehiculSelectat: Vehicul | null, esteLucrareAsigurare: boolean, dosarValid: boolean, detaliiPreluare: DetaliiPreluareForm, idMecaniciSelectati: number[], pozitiiDraft: PozitieComandaDraft[]) {
  return {
    lipsescSimptomeSauMecanic: vehiculSelectat !== null && (!detaliiPreluare.simptomeReclamate || idMecaniciSelectati.length === 0 || !suntPozitiiValide(pozitiiDraft)),
    lipsesteDosar: vehiculSelectat !== null && esteLucrareAsigurare && !dosarValid,
    rezumatPozitii: calcRezumat(pozitiiDraft),
  };
}
