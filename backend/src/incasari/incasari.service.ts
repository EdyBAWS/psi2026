import { BadRequestException, Injectable } from '@nestjs/common';
import {
  ModalitateIncasare,
  StatusFactura,
  TipNotificare,
} from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { NotificariService } from '../notificari/notificari.service';
import { CreateIncasareDto } from './dto/incasari.dto';

@Injectable()
export class IncasariService {
  constructor(
    private prisma: PrismaService,
    private notificariService: NotificariService,
  ) {}

  private calculeazaRestFactura(factura: {
    totalGeneral: number;
    incasari: Array<{ sumaAlocata: number }>;
  }) {
    const totalIncasat = factura.incasari.reduce(
      (total, alocare) => total + alocare.sumaAlocata,
      0,
    );

    return Math.max(0, factura.totalGeneral - totalIncasat);
  }

  async fetchFacturiRestante() {
    const facturi = await this.prisma.factura.findMany({
      where: {
        status: { not: StatusFactura.Anulata },
      },
      include: {
        client: true,
        incasari: true,
      },
      orderBy: { scadenta: 'asc' },
    });

    return facturi
      .map((factura) => {
        const restDePlata = this.calculeazaRestFactura(factura);

        return {
          idFactura: factura.idFactura,
          idClient: factura.idClient,
          idComanda: factura.idComanda,
          idVehicul: null,
          numar: `${factura.serie}-${factura.numar}`,
          dataEmitere: factura.dataEmiterii.toISOString(),
          dataScadenta: factura.scadenta.toISOString(),
          client: factura.client.nume,
          totalInitial: factura.totalGeneral,
          restDePlata,
          status: factura.status,
        };
      })
      .filter((factura) => factura.restDePlata > 0);
  }

  async findAll() {
    return this.prisma.incasare.findMany({
      include: {
        client: true,
        alocari: {
          include: { factura: true },
        },
      },
      orderBy: { data: 'desc' },
    });
  }

  async create(dto: CreateIncasareDto) {
    if (!dto.alocari?.length) {
      throw new BadRequestException(
        'Încasarea trebuie alocată pe cel puțin o factură.',
      );
    }

    const totalAlocat = dto.alocari.reduce(
      (total, alocare) => total + alocare.sumaAlocata,
      0,
    );

    if (totalAlocat > dto.sumaIncasata) {
      throw new BadRequestException('Suma alocată depășește suma încasată.');
    }

    const facturi = await this.prisma.factura.findMany({
      where: {
        idFactura: { in: dto.alocari.map((alocare) => alocare.idFactura) },
      },
      include: { incasari: true },
    });

    if (facturi.length !== dto.alocari.length) {
      throw new BadRequestException('Una sau mai multe facturi nu există.');
    }

    for (const alocare of dto.alocari) {
      const factura = facturi.find(
        (item) => item.idFactura === alocare.idFactura,
      );

      if (!factura) continue;
      if (factura.idClient !== dto.idClient) {
        throw new BadRequestException(
          'Factura nu aparține clientului selectat.',
        );
      }

      const restDePlata = this.calculeazaRestFactura(factura);
      if (alocare.sumaAlocata > restDePlata) {
        throw new BadRequestException(
          `Suma alocată depășește restul de plată pentru factura ${factura.serie}-${factura.numar}.`,
        );
      }
    }

    const incasare = await this.prisma.incasare.create({
      data: {
        idClient: dto.idClient,
        data: new Date(dto.data),
        suma: dto.sumaIncasata,
        modalitate: dto.modalitate,
        referinta: dto.referinta,
        alocari: {
          create: dto.alocari.map((alocare) => ({
            idFactura: alocare.idFactura,
            sumaAlocata: alocare.sumaAlocata,
          })),
        },
      },
      include: {
        client: true,
        alocari: { include: { factura: true } },
      },
    });

    await Promise.all(
      dto.alocari.map(async (alocare) => {
        const factura = await this.prisma.factura.findUnique({
          where: { idFactura: alocare.idFactura },
          include: { incasari: true },
        });

        if (!factura) return;

        const restDePlata = this.calculeazaRestFactura(factura);
        if (restDePlata <= 0) {
          await this.prisma.factura.update({
            where: { idFactura: factura.idFactura },
            data: { status: StatusFactura.Platita },
          });
        }
      }),
    );

    await this.notificariService.create({
      tip: TipNotificare.Succes,
      mesaj: `Încasare de ${dto.sumaIncasata.toFixed(2)} RON înregistrată pentru ${incasare.client.nume}.`,
      paginaDestinatie: 'incasari',
      sursaModul: 'Încasări',
      textActiune: 'Deschide Încasări',
      metadata: {
        event: 'incasare-creata',
        idIncasare: incasare.idIncasare,
      },
    });

    return incasare;
  }
}

export const modalitateFrontendToBackend: Record<string, ModalitateIncasare> = {
  'Transfer Bancar': ModalitateIncasare.TransferBancar,
  POS: ModalitateIncasare.POS,
  Cash: ModalitateIncasare.Cash,
};
