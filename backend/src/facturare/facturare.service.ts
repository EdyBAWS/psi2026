import { Injectable } from '@nestjs/common';
import { CreateFacturareDto } from './dto/create-facturare.dto';
import { UpdateFacturareDto } from './dto/update-facturare.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class FacturareService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateFacturareDto) {
    if (!dto.iteme || !Array.isArray(dto.iteme)) {
      throw new Error('Factura trebuie să conțină cel puțin un item!');
    }
    let totalFaraTVA = 0;
    let totalTVA = 0;

    dto.iteme.forEach((item) => {
      const subtotal = item.cantitate * item.pretUnitar;
      totalFaraTVA += subtotal;
      totalTVA += subtotal * 0.19;
    });

    const totalGeneral = totalFaraTVA + totalTVA;

    return this.prisma.factura.create({
      data: {
        numar: dto.numar,
        serie: dto.serie || 'SN',
        idClient: dto.idClient,
        scadenta: new Date(dto.scadenta),
        totalFaraTVA,
        tva: totalTVA,
        totalGeneral,
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
      include: { client: true },
    });
  }

  async findOne(id: number) {
    return this.prisma.factura.findUnique({
      where: { idFactura: id },
      include: { iteme: true, client: true },
    });
  }

  update(id: number, updateFacturareDto: UpdateFacturareDto) {
    void updateFacturareDto;
    return `Această acțiune modifică factura cu ID-ul #${id}`;
  }

  remove(id: number) {
    return `Această acțiune șterge factura cu ID-ul #${id}`;
  }
}
