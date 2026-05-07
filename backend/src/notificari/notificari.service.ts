import { Injectable } from '@nestjs/common';
import { Prisma, TipNotificare } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateNotificareDto, UpdateNotificareDto } from './dto/notificari.dto';

@Injectable()
export class NotificariService {
  constructor(private prisma: PrismaService) {}

  async create(data: CreateNotificareDto) {
    return this.prisma.notificare.create({
      data: {
        mesaj: data.mesaj,
        tip: data.tip ?? TipNotificare.Info,
        paginaDestinatie: data.paginaDestinatie,
        sursaModul: data.sursaModul,
        textActiune: data.textActiune,
        idFactura: data.idFactura,
        idComanda: data.idComanda,
        metadata: data.metadata as Prisma.InputJsonValue,
      },
    });
  }

  async createOnce(
    data: CreateNotificareDto,
    uniqueWhere: Prisma.NotificareWhereInput,
  ) {
    const existing = await this.prisma.notificare.findFirst({
      where: uniqueWhere,
      select: { idNotificare: true },
    });

    if (existing) return existing;
    return this.create(data);
  }

  async sincronizeazaFacturiRestante() {
    const now = new Date();
    const facturi = await this.prisma.factura.findMany({
      where: {
        status: 'Emisa',
        scadenta: { lt: now },
      },
      include: {
        client: true,
        incasari: true,
      },
    });

    await Promise.all(
      facturi.map(async (factura) => {
        const totalIncasat = factura.incasari.reduce(
          (total, alocare) => total + alocare.sumaAlocata,
          0,
        );
        const restDePlata = factura.totalGeneral - totalIncasat;

        if (restDePlata <= 0) return;

        await this.createOnce(
          {
            tip: TipNotificare.Avertizare,
            mesaj: `Factura ${factura.serie}-${factura.numar} este scadentă și are ${restDePlata.toFixed(2)} RON de încasat.`,
            paginaDestinatie: 'incasari',
            sursaModul: 'Încasări',
            textActiune: 'Deschide Încasări',
            idFactura: factura.idFactura,
            metadata: { event: 'factura-restanta' },
          },
          {
            idFactura: factura.idFactura,
            sursaModul: 'Încasări',
            textActiune: 'Deschide Încasări',
          },
        );
      }),
    );
  }

  async findAll() {
    await this.sincronizeazaFacturiRestante();

    return this.prisma.notificare.findMany({
      where: { stearsa: false },
      orderBy: { data: 'desc' },
    });
  }

  async update(id: number, data: UpdateNotificareDto) {
    return this.prisma.notificare.update({
      where: { idNotificare: id },
      data,
    });
  }

  async remove(id: number) {
    return this.prisma.notificare.update({
      where: { idNotificare: id },
      data: { stearsa: true },
    });
  }
}
