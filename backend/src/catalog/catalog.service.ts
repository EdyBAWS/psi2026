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

  async fetchIstoricPiesa(id: number) {
    await this.prisma.piesa.findUniqueOrThrow({
      where: { idPiesa: id },
      select: { idPiesa: true },
    });

    return [];
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

  // ─── KITURI ─────────────────────────────────────────────────────────

  async fetchKituri() {
    return this.prisma.kitPiese.findMany({
      include: {
        piese: {
          include: {
            piesa: true,
          },
        },
      },
      orderBy: { idKit: 'desc' },
    });
  }

  async createKit(data: { codKit: string; denumire: string; reducere?: number; piese: { idPiesa: number; cantitate: number }[] }) {
    return this.prisma.kitPiese.create({
      data: {
        codKit: data.codKit,
        denumire: data.denumire,
        reducere: data.reducere,
        piese: {
          create: data.piese.map(p => ({
            idPiesa: p.idPiesa,
            cantitate: p.cantitate,
          })),
        },
      },
      include: { piese: { include: { piesa: true } } },
    });
  }

  async updateKit(id: number, data: { codKit?: string; denumire?: string; reducere?: number; piese?: { idPiesa: number; cantitate: number }[] }) {
    const updateData: Prisma.KitPieseUpdateInput = {};
    if (data.codKit !== undefined) updateData.codKit = data.codKit;
    if (data.denumire !== undefined) updateData.denumire = data.denumire;
    if (data.reducere !== undefined) updateData.reducere = data.reducere;

    if (data.piese) {
      updateData.piese = {
        deleteMany: {},
        create: data.piese.map(p => ({
          idPiesa: p.idPiesa,
          cantitate: p.cantitate,
        })),
      };
    }

    return this.prisma.kitPiese.update({
      where: { idKit: id },
      data: updateData,
      include: { piese: { include: { piesa: true } } },
    });
  }

  async deleteKit(id: number) {
    return this.prisma.kitPiese.delete({
      where: { idKit: id },
    });
  }
}
