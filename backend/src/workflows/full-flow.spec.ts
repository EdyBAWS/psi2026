/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-argument, @typescript-eslint/require-await */
import { ModalitateIncasare, StatusFactura } from '@prisma/client';
import { FacturareService } from '../facturare/facturare.service';
import { IncasariService } from '../incasari/incasari.service';
import { NotificariService } from '../notificari/notificari.service';
import { OperationalService } from '../operational/operational.service';

describe('workflow operational -> facturare -> incasari -> notificari', () => {
  it('creates persistent notifications and closes the invoice after payment', async () => {
    const notificari: any[] = [];
    const facturi: any[] = [];
    const alocari: any[] = [];

    const prisma: any = {
      comanda: {
        create: jest.fn(async ({ data }) => ({
          idComanda: 10,
          ...data,
        })),
      },
      notificare: {
        create: jest.fn(async ({ data }) => {
          const notificare = {
            idNotificare: notificari.length + 1,
            data: new Date(),
            citit: false,
            arhivata: false,
            stearsa: false,
            ...data,
          };
          notificari.push(notificare);
          return notificare;
        }),
        findFirst: jest.fn(async ({ where }) =>
          notificari.find(
            (notificare) =>
              notificare.idFactura === where.idFactura &&
              notificare.sursaModul === where.sursaModul &&
              notificare.textActiune === where.textActiune,
          ),
        ),
        findMany: jest.fn(async () =>
          notificari.filter((notificare) => !notificare.stearsa),
        ),
      },
      factura: {
        create: jest.fn(async ({ data }) => {
          const factura = {
            idFactura: 20,
            dataEmiterii: new Date('2026-05-01T00:00:00.000Z'),
            status: StatusFactura.Emisa,
            client: { idClient: data.idClient, nume: 'Client Test' },
            incasari: [],
            ...data,
          };
          facturi.push(factura);
          return factura;
        }),
        findMany: jest.fn(async () => facturi),
        findUnique: jest.fn(async ({ where }) => {
          const factura = facturi.find(
            (item) => item.idFactura === where.idFactura,
          );
          if (!factura) return null;

          return {
            ...factura,
            incasari: alocari.filter(
              (alocare) => alocare.idFactura === factura.idFactura,
            ),
          };
        }),
        update: jest.fn(async ({ where, data }) => {
          const factura = facturi.find(
            (item) => item.idFactura === where.idFactura,
          );
          Object.assign(factura, data);
          return factura;
        }),
      },
      incasare: {
        create: jest.fn(async ({ data }) => {
          const incasare = {
            idIncasare: 30,
            idClient: data.idClient,
            suma: data.suma,
            data: data.data,
            modalitate: data.modalitate,
            referinta: data.referinta,
            client: { idClient: data.idClient, nume: 'Client Test' },
            alocari: data.alocari.create.map((alocare, index) => ({
              idAlocare: index + 1,
              ...alocare,
            })),
          };

          alocari.push(...incasare.alocari);
          return incasare;
        }),
      },
    };

    const notificariService = new NotificariService(prisma);
    const operationalService = new OperationalService(
      prisma,
      notificariService,
    );
    const facturareService = new FacturareService(prisma, notificariService);
    const incasariService = new IncasariService(prisma, notificariService);

    const comanda = await operationalService.createComanda({
      numarComanda: 'CMD-WORKFLOW-1',
      dataPreconizata: '2026-05-10T00:00:00.000Z',
    });

    const factura = await facturareService.create({
      numar: 9001,
      serie: 'WF',
      idClient: 1,
      idComanda: comanda.idComanda,
      scadenta: new Date('2026-05-01T00:00:00.000Z'),
      iteme: [{ descriere: 'Reparatie test', cantitate: 1, pretUnitar: 100 }],
    });

    await notificariService.findAll();

    await incasariService.create({
      idClient: 1,
      sumaIncasata: 119,
      modalitate: ModalitateIncasare.TransferBancar,
      referinta: 'OP-WORKFLOW-1',
      data: '2026-05-08T00:00:00.000Z',
      alocari: [{ idFactura: factura.idFactura, sumaAlocata: 119 }],
    });

    expect(prisma.factura.update).toHaveBeenCalledWith({
      where: { idFactura: factura.idFactura },
      data: { status: StatusFactura.Platita },
    });
    expect(notificari.map((notificare) => notificare.metadata?.event)).toEqual(
      expect.arrayContaining([
        'comanda-creata',
        'factura-creata',
        'factura-restanta',
        'incasare-creata',
      ]),
    );
  });
});
