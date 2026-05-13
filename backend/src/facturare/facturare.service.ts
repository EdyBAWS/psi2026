import { Injectable } from '@nestjs/common';
import { CreateFacturareDto } from './dto/create-facturare.dto';
import { UpdateFacturareDto } from './dto/update-facturare.dto';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma, TipNotificare } from '@prisma/client';
import { NotificariService } from '../notificari/notificari.service';

@Injectable()
export class FacturareService {
  constructor(
    private prisma: PrismaService,
    private notificariService: NotificariService,
  ) {}

  async getNextNumber(): Promise<number> {
    const max = await this.prisma.factura.aggregate({
      _max: {
        numar: true,
      },
    });
    return (max._max.numar || 0) + 1;
  }

  private calculeazaTotaluri(iteme: CreateFacturareDto['iteme']) {
    let totalFaraTVA = 0;
    let totalTVA = 0;

    iteme.forEach((item) => {
      const subtotal = item.cantitate * item.pretUnitar;
      totalFaraTVA += subtotal;
      totalTVA += subtotal * 0.19;
    });

    return {
      totalFaraTVA,
      tva: totalTVA,
      totalGeneral: totalFaraTVA + totalTVA,
    };
  }

  async create(dto: CreateFacturareDto) {
    if (!dto.iteme || !Array.isArray(dto.iteme) || dto.iteme.length === 0) {
      throw new Error('Factura trebuie să conțină cel puțin un item!');
    }

    const totaluri = this.calculeazaTotaluri(dto.iteme);

    const factura = await this.prisma.factura.create({
      data: {
        numar: dto.numar,
        serie: dto.serie || 'SN',
        idClient: dto.idClient,
        idComanda: dto.idComanda,
        scadenta: new Date(dto.scadenta),
        ...totaluri,
        iteme: {
          create: dto.iteme.map((item) => ({
            descriere: item.descriere,
            cantitate: item.cantitate,
            pretUnitar: item.pretUnitar,
            idPiesa: item.idPiesa,
            idManopera: item.idManopera,
          })),
        },
      },
      include: {
        iteme: true,
        client: true,
      },
    });

    await this.notificariService.create({
      tip: TipNotificare.Succes,
      mesaj: `Factura ${factura.serie}-${factura.numar} a fost emisă pentru ${factura.client.nume}.`,
      paginaDestinatie: 'facturare-istoric',
      sursaModul: 'Facturare',
      textActiune: 'Vezi istoricul',
      idFactura: factura.idFactura,
      idComanda: dto.idComanda,
      metadata: { event: 'factura-creata' },
    });

    return factura;
  }

  async findAll() {
    return this.prisma.factura.findMany({
      include: { client: true, iteme: true },
      orderBy: { idFactura: 'desc' },
    });
  }

  async findOne(id: number) {
    return this.prisma.factura.findUnique({
      where: { idFactura: id },
      include: { iteme: true, client: true },
    });
  }

  async update(id: number, updateFacturareDto: UpdateFacturareDto) {
    const data: Prisma.FacturaUpdateInput = {};

    if (updateFacturareDto.numar !== undefined) {
      data.numar = updateFacturareDto.numar;
    }
    if (updateFacturareDto.serie !== undefined) {
      data.serie = updateFacturareDto.serie;
    }
    if (updateFacturareDto.idClient !== undefined) {
      data.client = { connect: { idClient: updateFacturareDto.idClient } };
    }
    if (updateFacturareDto.idComanda !== undefined) {
      data.comanda = { connect: { idComanda: updateFacturareDto.idComanda } };
    }
    if (updateFacturareDto.scadenta !== undefined) {
      data.scadenta = new Date(updateFacturareDto.scadenta);
    }
    if (updateFacturareDto.iteme !== undefined) {
      const totaluri = this.calculeazaTotaluri(updateFacturareDto.iteme);

      data.totalFaraTVA = totaluri.totalFaraTVA;
      data.tva = totaluri.tva;
      data.totalGeneral = totaluri.totalGeneral;
      data.iteme = {
        deleteMany: {},
        create: updateFacturareDto.iteme.map((item) => ({
          descriere: item.descriere,
          cantitate: item.cantitate,
          pretUnitar: item.pretUnitar,
          idPiesa: item.idPiesa,
          idManopera: item.idManopera,
        })),
      };
    }

    const factura = await this.prisma.factura.update({
      where: { idFactura: id },
      data,
      include: { iteme: true, client: true },
    });

    await this.notificariService.create({
      tip: TipNotificare.Info,
      mesaj: `Factura ${factura.serie}-${factura.numar} a fost actualizată.`,
      paginaDestinatie: 'facturare-istoric',
      sursaModul: 'Facturare',
      textActiune: 'Vezi istoricul',
      idFactura: factura.idFactura,
      metadata: { event: 'factura-actualizata' },
    });

    return factura;
  }

  async remove(id: number) {
    await this.prisma.facturaItem.deleteMany({
      where: { idFactura: id },
    });

    return this.prisma.factura.delete({
      where: { idFactura: id },
    });
  }
}
