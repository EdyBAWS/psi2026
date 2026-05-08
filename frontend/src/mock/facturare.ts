// Aici legăm zona de facturare de aceleași comenzi și poziții demo folosite
// în operațional. Nu avem încă stare live comună, dar măcar toate ecranele
// pornesc de la același "univers" de date.
import {
  mockClienti,
  mockComenzi,
  mockPozitii,
  mockVehicule,
} from "./operational";
import type {
  ComandaFacturabilaMock,
  FacturaMock,
  LinieFacturaMock,
  TranzactieIstoricMock,
} from "./types";

const statusuriFacturabile = new Set(["Gata de livrare", "Livrat"]);

const clientiById = new Map(
  mockClienti.map((client) => [
    client.idClient,
    client.denumireCompanie ?? client.nume,
  ]),
);

const vehiculeById = new Map(
  mockVehicule.map((vehicul) => [
    vehicul.idVehicul,
    `${vehicul.marca} ${vehicul.model} (${vehicul.numarInmatriculare})`,
  ]),
);

const vehiculLaClient = new Map(
  mockVehicule.map((vehicul) => [vehicul.idVehicul, vehicul.idClient]),
);

const facturiEmiseSeed: Array<
  | {
      idFactura: number;
      idComanda: number;
      numar: string;
      dataEmitere: string;
      dataScadenta: string;
      restDePlata: number;
    }
  | {
      idFactura: number;
      idComanda: null;
      idClient: number;
      idVehicul: number;
      numar: string;
      dataEmitere: string;
      dataScadenta: string;
      totalInitial: number;
      restDePlata: number;
    }
> = [
  {
    idFactura: 9001,
    idComanda: 5,
    numar: "F-SAG-2026-00124",
    dataEmitere: "2026-03-24",
    dataScadenta: "2026-04-08",
    restDePlata: 980,
  },
  {
    idFactura: 9002,
    idComanda: null,
    idClient: 1002,
    idVehicul: 2,
    numar: "F-SAG-2026-00118",
    dataEmitere: "2026-03-12",
    dataScadenta: "2026-03-22",
    totalInitial: 1550,
    restDePlata: 1550,
  },
  {
    idFactura: 9003,
    idComanda: 6,
    numar: "F-SAG-2026-00126",
    dataEmitere: "2026-03-25",
    dataScadenta: "2026-04-09",
    restDePlata: 840,
  },
  {
    idFactura: 9004,
    idComanda: null,
    idClient: 1004,
    idVehicul: 4,
    numar: "F-SAG-2026-00110",
    dataEmitere: "2026-03-08",
    dataScadenta: "2026-03-18",
    totalInitial: 3200,
    restDePlata: 1240,
  },
];

const liniiFacturaStandalone = new Map<number, LinieFacturaMock[]>([
  [
    9002,
    [
      {
        idLinie: 900201,
        tip: "Piesă",
        denumire: "Ansamblu oglindă stânga Skoda Octavia",
        cantitate: 1,
        pretUnitar: 780,
      },
      {
        idLinie: 900202,
        tip: "Manoperă",
        denumire: "Înlocuire oglindă și reglaj sistem electric",
        cantitate: 2,
        pretUnitar: 185,
      },
      {
        idLinie: 900203,
        tip: "Piesă",
        denumire: "Capac vopsit oglindă",
        cantitate: 1,
        pretUnitar: 400,
      },
    ],
  ],
  [
    9004,
    [
      {
        idLinie: 900401,
        tip: "Piesă",
        denumire: "Compresor AC Ford Transit",
        cantitate: 1,
        pretUnitar: 2150,
      },
      {
        idLinie: 900402,
        tip: "Kit",
        denumire: "Kit service AC Ford Transit",
        cantitate: 1,
        pretUnitar: 380,
      },
      {
        idLinie: 900403,
        tip: "Manoperă",
        denumire: "Service și diagnoză instalație AC",
        cantitate: 2.5,
        pretUnitar: 230,
      },
    ],
  ],
]);

function numeClientDinVehicul(idVehicul: number): string {
  const idClient = vehiculLaClient.get(idVehicul);
  return idClient
    ? (clientiById.get(idClient) ?? `Client #${idClient}`)
    : "Client necunoscut";
}

function tipLiniePentruFactura(tipPozitie: string): LinieFacturaMock["tip"] {
  switch (tipPozitie) {
    case "Manopera":
      return "Manoperă";
    case "Kit":
      return "Kit";
    default:
      return "Piesă";
  }
}

export function obtineLiniiFacturaDinComandaMock(
  idComanda: number,
): LinieFacturaMock[] {
  return mockPozitii
    .filter((pozitie) => pozitie.idComanda === idComanda)
    .map((pozitie) => ({
      idLinie: pozitie.idPozitieCmd,
      tip: tipLiniePentruFactura(pozitie.tipPozitie),
      denumire: pozitie.descriere,
      cantitate: pozitie.cantitate,
      pretUnitar: pozitie.pretVanzare,
    }));
}

export function obtineComenziFacturabileDinMock(): ComandaFacturabilaMock[] {
  const comenziDejaFacturate = new Set(
    facturiEmiseSeed
      .map((factura) => factura.idComanda)
      .filter((idComanda): idComanda is number => idComanda !== null),
  );

  return mockComenzi
    .filter(
      (comanda) =>
        statusuriFacturabile.has(comanda.status ?? "") &&
        !comenziDejaFacturate.has(comanda.idComanda),
    )
    .map((comanda) => ({
      idComanda: comanda.idComanda,
      nrComanda: comanda.numarComanda,
      dataComanda: (comanda.dataFinalizare ?? comanda.dataDeschidere ?? new Date())
        .toISOString()
        .split("T")[0],
      idVehicul: comanda.idVehicul,
      status: comanda.status ?? "Gata de livrare",
      totalEstimat: comanda.totalEstimat ?? 0,
      client: numeClientDinVehicul(comanda.idVehicul),
      vehicul:
        vehiculeById.get(comanda.idVehicul) ?? `Vehicul #${comanda.idVehicul}`,
    }));
}

export const facturiEmiseMock: FacturaMock[] = facturiEmiseSeed.map(
  (facturaSeed) => {
    if (facturaSeed.idComanda !== null) {
      const comanda = mockComenzi.find(
        (item) => item.idComanda === facturaSeed.idComanda,
      );
      if (!comanda) {
        throw new Error(
          `Comanda ${facturaSeed.idComanda} nu există în mock-ul operațional.`,
        );
      }

      const idClient = vehiculLaClient.get(comanda.idVehicul);
      if (!idClient) {
        throw new Error(
          `Vehiculul ${comanda.idVehicul} nu are client în mock-ul operațional.`,
        );
      }

      return {
        idFactura: facturaSeed.idFactura,
        idClient,
        idComanda: comanda.idComanda,
        idVehicul: comanda.idVehicul,
        numar: facturaSeed.numar,
        dataEmitere: facturaSeed.dataEmitere,
        dataScadenta: facturaSeed.dataScadenta,
        client: clientiById.get(idClient) ?? `Client #${idClient}`,
        totalInitial: comanda.totalEstimat ?? 0,
        restDePlata: facturaSeed.restDePlata,
        status:
          facturaSeed.restDePlata === 0
            ? "Achitata"
            : facturaSeed.restDePlata < (comanda.totalEstimat ?? 0)
              ? "Achitata partial"
              : "Emisa",
      } satisfies FacturaMock;
    }

    return {
      idFactura: facturaSeed.idFactura,
      idClient: facturaSeed.idClient,
      idComanda: null,
      idVehicul: facturaSeed.idVehicul,
      numar: facturaSeed.numar,
      dataEmitere: facturaSeed.dataEmitere,
      dataScadenta: facturaSeed.dataScadenta,
      client:
        clientiById.get(facturaSeed.idClient) ??
        `Client #${facturaSeed.idClient}`,
      totalInitial: facturaSeed.totalInitial,
      restDePlata: facturaSeed.restDePlata,
      status:
        facturaSeed.restDePlata === 0
          ? "Achitata"
          : facturaSeed.restDePlata < facturaSeed.totalInitial
            ? "Achitata partial"
            : "Emisa",
    } satisfies FacturaMock;
  },
);

export function obtineLiniiFacturaEmisaDinMock(
  idFactura: number,
): LinieFacturaMock[] {
  const factura = facturiEmiseMock.find((item) => item.idFactura === idFactura);
  if (!factura) {
    return [];
  }

  if (factura.idComanda !== null) {
    return obtineLiniiFacturaDinComandaMock(factura.idComanda);
  }

  return liniiFacturaStandalone.get(idFactura) ?? [];
}

export const istoricFacturareMock: TranzactieIstoricMock[] = [
  {
    id: "TRX-001",
    dataOra: "2026-03-24 16:05",
    tipOperatiune: "Facturare Comandă",
    numarDocument: "F-SAG-2026-00124",
    client: facturiEmiseMock[0]?.client ?? "Client necunoscut",
    valoare: facturiEmiseMock[0]?.totalInitial ?? 0,
    utilizator: "Admin",
    detalii: "Facturare comandă CMD-2026-005 după livrarea vehiculului.",
  },
  {
    id: "TRX-002",
    dataOra: "2026-03-25 09:15",
    tipOperatiune: "Penalizare",
    numarDocument: "PEN-0045",
    client: facturiEmiseMock[1]?.client ?? "Client necunoscut",
    valoare: 126,
    utilizator: "Admin",
    detalii: `Întârziere la factura ${facturiEmiseMock[1]?.numar ?? "F-SAG-2026-00118"} (1%/zi).`,
  },
  {
    id: "TRX-003",
    dataOra: "2026-03-25 11:45",
    tipOperatiune: "Discount Extra",
    numarDocument: facturiEmiseMock[0]?.numar ?? "F-SAG-2026-00124",
    client: facturiEmiseMock[0]?.client ?? "Client necunoscut",
    valoare: -150,
    utilizator: "Admin",
    detalii: "Campanie de fidelizare pentru client corporate.",
  },
  {
    id: "TRX-004",
    dataOra: "2026-03-25 13:20",
    tipOperatiune: "Storno",
    numarDocument: "RET-0012",
    client: facturiEmiseMock[1]?.client ?? "Client necunoscut",
    valoare: -500,
    utilizator: "Alex (Facturare)",
    detalii: "Retur oglindă stânga după constatarea unui defect de fabricație.",
  },
  {
    id: "TRX-005",
    dataOra: "2026-03-25 17:25",
    tipOperatiune: "Facturare Comandă",
    numarDocument: "F-SAG-2026-00126",
    client: facturiEmiseMock[2]?.client ?? "Client necunoscut",
    valoare: facturiEmiseMock[2]?.totalInitial ?? 0,
    utilizator: "Admin",
    detalii:
      "Facturare comandă CMD-2026-006 pentru lucrare suspensie și bujii.",
  },
  {
    id: "TRX-006",
    dataOra: "2026-03-26 08:40",
    tipOperatiune: "Penalizare",
    numarDocument: "PEN-0046",
    client: facturiEmiseMock[3]?.client ?? "Client necunoscut",
    valoare: 74.4,
    utilizator: "Alex (Facturare)",
    detalii: `Penalizare aplicată pentru întârziere la factura ${facturiEmiseMock[3]?.numar ?? "F-SAG-2026-00110"}.`,
  },
];
