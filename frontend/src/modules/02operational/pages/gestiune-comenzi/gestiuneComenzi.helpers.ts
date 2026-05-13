// src/modules/02operational/pages/gestiune-comenzi/gestiuneComenzi.helpers.ts
import {
  calculeazaRezumatPozitii,
  comandaEsteActiva,
  comandaEsteIntarziata,
} from "../../calculations";
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

export type GestiuneSortField =
  | "numarComanda"
  | "data"
  | "vehicul"
  | "status"
  | "valoare";
export type GestiuneSortDir = "asc" | "desc";

export interface GestiuneFiltre {
  cautare: string;
  filtruStatus: StatusComanda | "Toate";
  filtruMecanic: number | "toate";
  filtruPlata: ComandaService["tipPlata"] | "Toate";
  doarIntarziate: boolean;
}

export interface ComandaFiltrataContext {
  client: Client | null;
  comanda: ComandaService;
  intarziata: boolean;
  vehicul: Vehicul | null;
}

export interface DetaliiComandaSelectata {
  asiguratorSelectat: Asigurator | null;
  clientSelectat: Client | null;
  comandaSelectata: ComandaService | null;
  dosarSelectat: DosarDauna | null;
  mecanicSelectat: Mecanic | null;
  pozitiiComandaSelectata: PozitieComanda[];
  rezumatSelectat: ReturnType<typeof calculeazaRezumatPozitii>;
  vehiculSelectat: Vehicul | null;
}

export const statusuriFiltrare: Array<StatusComanda | "Toate"> = [
  "Toate",
  "In asteptare diagnoza",
  "Asteapta aprobare client",
  "In asteptare piese",
  "In lucru",
  "Finalizat",
  "Facturat",
  "Anulat",
];

export const formatSuma = (valoare: number) =>
  new Intl.NumberFormat("ro-RO", {
    style: "currency",
    currency: "RON",
    maximumFractionDigits: 2,
  }).format(valoare);

export const formatData = (valoare: Date | string | null | undefined) => {
  if (!valoare) return "-";
  const dateObj = typeof valoare === 'string' ? new Date(valoare) : valoare;
  return dateObj.toLocaleDateString("ro-RO");
};

export function descriereSortare(
  sortField: GestiuneSortField,
  sortDir: GestiuneSortDir,
) {
  const etichete: Record<GestiuneSortField, string> = {
    data: "data deschiderii",
    numarComanda: "numărul comenzii",
    status: "status",
    valoare: "valoarea devizului",
    vehicul: "vehicul",
  };

  return `Sortare după ${etichete[sortField]}, ordine ${
    sortDir === "asc" ? "crescătoare" : "descrescătoare"
  }.`;
}

export function filtreazaSiSorteazaComenzi(
  comenzi: ComandaService[],
  clienti: Client[],
  vehicule: Vehicul[],
  filtre: GestiuneFiltre,
  sortField: GestiuneSortField,
  sortDir: GestiuneSortDir,
) {
  const termen = filtre.cautare.trim().toLowerCase();

  return comenzi
    .filter((comanda) => {
      const vehicul = vehicule.find((item) => item.idVehicul === comanda.idVehicul) ?? null;
      const client = clienti.find((item) => item.idClient === vehicul?.idClient) ?? null;
      
      const potrivireCautare = termen === "" || [
          comanda.numarComanda,
          vehicul?.numarInmatriculare ?? "",
          vehicul?.marca ?? "",
          vehicul?.model ?? "",
          client?.nume ?? "",
        ].some((camp) => camp.toLowerCase().includes(termen));

      const potrivireStatus = filtre.filtruStatus === "Toate" || comanda.status === filtre.filtruStatus;
      const potrivireMecanic = filtre.filtruMecanic === "toate" || comanda.idMecanic === filtre.filtruMecanic;
      const potrivirePlata = filtre.filtruPlata === "Toate" || comanda.tipPlata === filtre.filtruPlata;
      const potrivireIntarziere = !filtre.doarIntarziate || (comanda.status && comanda.termenPromis && comandaEsteIntarziata(comanda.status, comanda.termenPromis));

      return potrivireCautare && potrivireStatus && potrivireMecanic && potrivirePlata && potrivireIntarziere;
    })
    .sort((a, b) => {
      let comparison = 0;
      if (sortField === "data") {
        const dataA = a.dataDeschidere ? new Date(a.dataDeschidere).getTime() : 0;
        const dataB = b.dataDeschidere ? new Date(b.dataDeschidere).getTime() : 0;
        comparison = dataA - dataB;
      } else if (sortField === "numarComanda") {
        comparison = a.numarComanda.localeCompare(b.numarComanda);
      } else if (sortField === "status") {
        comparison = (a.status || "").localeCompare(b.status || "");
      } else if (sortField === "vehicul") {
        const vehiculA = vehicule.find((item) => item.idVehicul === a.idVehicul);
        const vehiculB = vehicule.find((item) => item.idVehicul === b.idVehicul);
        comparison = (vehiculA?.numarInmatriculare || "").localeCompare(vehiculB?.numarInmatriculare || "");
      } else {
        comparison = (a.totalEstimat ?? 0) - (b.totalEstimat ?? 0);
      }
      return sortDir === "asc" ? comparison : -comparison;
    });
}

export function construiesteLiniiLista(
  comenziFiltrate: ComandaService[],
  clienti: Client[],
  vehicule: Vehicul[],
): ComandaFiltrataContext[] {
  return comenziFiltrate.map((comanda) => {
    const vehicul = vehicule.find((v) => v.idVehicul === comanda.idVehicul) ?? null;
    const client = clienti.find((c) => c.idClient === vehicul?.idClient) ?? null;

    return {
      client,
      comanda,
      intarziata: !!(comanda.status && comanda.termenPromis && comandaEsteIntarziata(comanda.status, comanda.termenPromis)),
      vehicul,
    };
  });
}

export function rezolvaDetaliiComandaSelectata(
  idComandaSelectata: number | null,
  comenzi: ComandaService[],
  clienti: Client[],
  vehicule: Vehicul[],
  mecanici: Mecanic[],
  dosare: DosarDauna[],
  _asiguratori: Asigurator[],
  pozitii: PozitieComanda[],
): DetaliiComandaSelectata {
  const comandaSelectata = idComandaSelectata === null ? null : (comenzi.find((c) => c.idComanda === idComandaSelectata) ?? null);
  const vehiculSelectat = comandaSelectata ? (vehicule.find((v) => v.idVehicul === comandaSelectata.idVehicul) ?? null) : null;
  const pozitiiComandaSelectata = comandaSelectata ? pozitii.filter((p) => p.idComanda === comandaSelectata.idComanda) : [];

  return {
    asiguratorSelectat: null,
    clientSelectat: vehiculSelectat ? (clienti.find((c) => c.idClient === vehiculSelectat.idClient) ?? null) : null,
    comandaSelectata,
    dosarSelectat: comandaSelectata?.idDosar ? (dosare.find((d) => d.idDosar === comandaSelectata.idDosar) ?? null) : null,
    mecanicSelectat: mecanici.find((m) => m.idMecanic === comandaSelectata?.idMecanic) ?? null,
    pozitiiComandaSelectata,
    rezumatSelectat: calculeazaRezumatPozitii(pozitiiComandaSelectata),
    vehiculSelectat,
  };
}

export function calculeazaStatisticiComenzi(comenzi: ComandaService[]) {
  return {
    totalComenzi: comenzi.length,
    totalComenziActive: comenzi.filter((c) => c.status && comandaEsteActiva(c.status)).length,
    totalIntarziate: comenzi.filter((c) => c.status && c.termenPromis && comandaEsteIntarziata(c.status, c.termenPromis)).length,
  };
}
