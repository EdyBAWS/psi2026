import { Injectable } from '@nestjs/common';
import { CreateFacturareDto } from './dto/create-facturare.dto';
import { UpdateFacturareDto } from './dto/update-facturare.dto';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class FacturareService {
  constructor(private prisma: PrismaService) {}

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

    return this.prisma.factura.create({
      data: {
        numar: dto.numar,
        serie: dto.serie || 'SN',
        idClient: dto.idClient,
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

    return this.prisma.factura.update({
      where: { idFactura: id },
      data,
      include: { iteme: true, client: true },
    });
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
