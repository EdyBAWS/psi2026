import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class CatalogService {
  constructor(private readonly prisma: PrismaService) {}

  // ─── PIESE ──────────────────────────────────────────────────────────

  async fetchPiese() {
    return this.prisma.piesa.findMany({
      orderBy: { idPiesa: 'desc' },
    });
  }

  async createPiesa(data: Prisma.PiesaCreateInput) {
    return this.prisma.piesa.create({ data });
  }

  async updatePiesa(id: number, data: Prisma.PiesaUpdateInput) {
    return this.prisma.piesa.update({
      where: { idPiesa: id },
      data,
    });
  }

  async deletePiesa(id: number) {
    return this.prisma.piesa.delete({
      where: { idPiesa: id },
    });
  }

  // ─── MANOPERĂ ───────────────────────────────────────────────────────

  async fetchManopera() {
    return this.prisma.manopera.findMany({
      orderBy: { idManopera: 'desc' },
    });
  }

  async createManopera(data: Prisma.ManoperaCreateInput) {
    return this.prisma.manopera.create({ data });
  }

  async updateManopera(id: number, data: Prisma.ManoperaUpdateInput) {
    return this.prisma.manopera.update({
      where: { idManopera: id },
      data,
    });
  }

  async deleteManopera(id: number) {
    return this.prisma.manopera.delete({
      where: { idManopera: id },
    });
  }
}