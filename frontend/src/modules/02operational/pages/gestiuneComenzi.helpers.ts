// Helperii din acest fișier țin logica "de listă" și "de selecție"
// pentru pagina `GestiuneComenzi`.
// Scopul este ca pagina principală să rămână mai ușor de citit:
// UI-ul stă în componentă, iar calculele și legăturile dintre entități stau aici.
import { calculeazaRezumatPozitii, comandaEsteActiva, comandaEsteIntarziata } from '../calculations';
import type {
  Asigurator,
  Client,
  ComandaService,
  DosarDauna,
  Mecanic,
  PozitieComanda,
  StatusComanda,
  Vehicul,
} from '../types';

export type GestiuneSortField = 'nrComanda' | 'data' | 'vehicul' | 'status' | 'valoare';
export type GestiuneSortDir = 'asc' | 'desc';

export interface GestiuneFiltre {
  cautare: string;
  filtruStatus: StatusComanda | 'Toate';
  filtruMecanic: number | 'toate';
  filtruPlata: ComandaService['tipPlata'] | 'Toate';
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

export const statusuriFiltrare: Array<StatusComanda | 'Toate'> = [
  'Toate',
  'In asteptare diagnoza',
  'Asteapta aprobare client',
  'Asteapta piese',
  'In Lucru',
  'Gata de livrare',
  'Livrat',
  'Facturat',
  'Anulat',
];

export const formatSuma = (valoare: number) =>
  new Intl.NumberFormat('ro-RO', {
    style: 'currency',
    currency: 'RON',
    maximumFractionDigits: 2,
  }).format(valoare);

export const formatData = (valoare: Date | null) =>
  valoare ? valoare.toLocaleDateString('ro-RO') : 'Nefinalizată';

export function descriereSortare(sortField: GestiuneSortField, sortDir: GestiuneSortDir) {
  // Acest text este util pentru a explica utilizatorului
  // cum este ordonată lista în momentul curent.
  const etichete: Record<GestiuneSortField, string> = {
    data: 'data deschiderii',
    nrComanda: 'numărul comenzii',
    status: 'status',
    valoare: 'valoarea devizului',
    vehicul: 'vehicul',
  };

  return `Sortare după ${etichete[sortField]}, ordine ${
    sortDir === 'asc' ? 'crescătoare' : 'descrescătoare'
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
      // Pentru fiecare comandă rezolvăm și contextul ei minim,
      // adică vehiculul și clientul asociat.
      const vehicul = vehicule.find((item) => item.idVehicul === comanda.idVehicul) ?? null;
      const client = clienti.find((item) => item.idClient === vehicul?.idClient) ?? null;
      const potrivireCautare =
        termen === '' ||
        [
          comanda.nrComanda,
          vehicul?.nrInmatriculare ?? '',
          vehicul?.marca ?? '',
          vehicul?.model ?? '',
          client?.nume ?? '',
          client?.denumireCompanie ?? '',
        ].some((camp) => camp.toLowerCase().includes(termen));

      const potrivireStatus =
        filtre.filtruStatus === 'Toate' || comanda.status === filtre.filtruStatus;
      const potrivireMecanic =
        filtre.filtruMecanic === 'toate' || comanda.idMecanic === filtre.filtruMecanic;
      const potrivirePlata =
        filtre.filtruPlata === 'Toate' || comanda.tipPlata === filtre.filtruPlata;
      const potrivireIntarziere =
        !filtre.doarIntarziate || comandaEsteIntarziata(comanda.status, comanda.termenPromis);

      return (
        potrivireCautare &&
        potrivireStatus &&
        potrivireMecanic &&
        potrivirePlata &&
        potrivireIntarziere
      );
    })
    .sort((a, b) => {
      // Sortarea rămâne într-un singur loc, ca să nu duplicăm
      // aceeași logică în tabel și în pagina principală.
      let comparison = 0;

      if (sortField === 'data') {
        comparison = a.dataDeschidere.getTime() - b.dataDeschidere.getTime();
      } else if (sortField === 'nrComanda') {
        comparison = a.nrComanda.localeCompare(b.nrComanda);
      } else if (sortField === 'vehicul') {
        const vehiculA = vehicule.find((item) => item.idVehicul === a.idVehicul)?.nrInmatriculare ?? '';
        const vehiculB = vehicule.find((item) => item.idVehicul === b.idVehicul)?.nrInmatriculare ?? '';
        comparison = vehiculA.localeCompare(vehiculB);
      } else if (sortField === 'status') {
        comparison = a.status.localeCompare(b.status);
      } else {
        comparison = a.totalEstimat - b.totalEstimat;
      }

      return sortDir === 'asc' ? comparison : -comparison;
    });
}

export function construiesteLiniiLista(
  comenziFiltrate: ComandaService[],
  clienti: Client[],
  vehicule: Vehicul[],
): ComandaFiltrataContext[] {
  // În listă vrem deja o structură "pregătită de afișare",
  // nu doar comanda brută. De aceea construim aici contextul complet.
  return comenziFiltrate.map((comanda) => {
    const vehicul = vehicule.find((item) => item.idVehicul === comanda.idVehicul) ?? null;
    const client = clienti.find((item) => item.idClient === vehicul?.idClient) ?? null;

    return {
      client,
      comanda,
      intarziata: comandaEsteIntarziata(comanda.status, comanda.termenPromis),
      vehicul,
    };
  });
}

export function rezolvaDetaliiComandaSelectata(
  idComandaSelectata: number | null,
  comenziFiltrate: ComandaService[],
  clienti: Client[],
  vehicule: Vehicul[],
  mecanici: Mecanic[],
  dosare: DosarDauna[],
  asiguratori: Asigurator[],
  pozitii: PozitieComanda[],
): DetaliiComandaSelectata {
  // Când utilizatorul selectează o comandă, pagina din dreapta are nevoie de
  // multe legături rezolvate: client, vehicul, mecanic, dosar, asigurator, poziții.
  // Helperul acesta centralizează toate aceste căutări într-un singur loc.
  const comandaSelectata =
    idComandaSelectata === null
      ? null
      : comenziFiltrate.find((comanda) => comanda.idComanda === idComandaSelectata) ?? null;

  const pozitiiComandaSelectata = comandaSelectata
    ? pozitii.filter((pozitie) => pozitie.idComanda === comandaSelectata.idComanda)
    : [];
  const rezumatSelectat = calculeazaRezumatPozitii(pozitiiComandaSelectata);
  const vehiculSelectat = comandaSelectata
    ? vehicule.find((item) => item.idVehicul === comandaSelectata.idVehicul) ?? null
    : null;
  const clientSelectat = vehiculSelectat
    ? clienti.find((item) => item.idClient === vehiculSelectat.idClient) ?? null
    : null;
  const mecanicSelectat = comandaSelectata
    ? mecanici.find((item) => item.idMecanic === comandaSelectata.idMecanic) ?? null
    : null;
  const dosarSelectat = comandaSelectata
    ? dosare.find((item) => item.idDosar === comandaSelectata.idDosar) ?? null
    : null;
  const asiguratorSelectat = dosarSelectat
    ? asiguratori.find((item) => item.idAsigurator === dosarSelectat.idAsigurator) ?? null
    : null;

  return {
    asiguratorSelectat,
    clientSelectat,
    comandaSelectata,
    dosarSelectat,
    mecanicSelectat,
    pozitiiComandaSelectata,
    rezumatSelectat,
    vehiculSelectat,
  };
}

export function calculeazaStatisticiComenzi(comenzi: ComandaService[]) {
  // Cardurile de statistică folosesc aceeași sursă de date,
  // deci este mai sigur să le calculăm centralizat aici.
  return {
    totalComenzi: comenzi.length,
    totalComenziActive: comenzi.filter((comanda) => comandaEsteActiva(comanda.status)).length,
    totalIntarziate: comenzi.filter((comanda) =>
      comandaEsteIntarziata(comanda.status, comanda.termenPromis),
    ).length,
  };
}
