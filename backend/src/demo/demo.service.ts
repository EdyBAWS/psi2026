import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DemoService {
  constructor(private prisma: PrismaService) {}

  async cleanupDatabase() {
    // Delete in reverse order of dependencies
    await this.prisma.incasareAlocare.deleteMany({});
    await this.prisma.incasare.deleteMany({});
    await this.prisma.facturaItem.deleteMany({});
    await this.prisma.factura.deleteMany({});
    await this.prisma.comandaPozitie.deleteMany({});
    await this.prisma.comanda.deleteMany({});
    await this.prisma.dosarDauna.deleteMany({});
    await this.prisma.vehicul.deleteMany({});
    await this.prisma.client.deleteMany({});
    await this.prisma.angajat.deleteMany({});
    await this.prisma.asigurator.deleteMany({});
    await this.prisma.kitPiesaItem.deleteMany({});
    await this.prisma.kitPiese.deleteMany({});
    await this.prisma.manopera.deleteMany({});
    await this.prisma.piesa.deleteMany({});
    await this.prisma.notificare.deleteMany({});
    
    return { message: 'Database cleaned successfully' };
  }
}
