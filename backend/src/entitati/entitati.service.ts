import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma, StatusGeneral } from '@prisma/client';

@Injectable()
export class EntitatiService {
  constructor(private readonly prisma: PrismaService) {}

  // ─── CLIENȚI ────────────────────────────────────────────────────────

  async fetchClienti() {
    return this.prisma.client.findMany({
      orderBy: { idClient: 'desc' },
    });
  }

  async saveClient(data: Prisma.ClientCreateInput) {
    return this.prisma.client.create({ data });
  }

  async updateClient(id: number, data: Prisma.ClientUpdateInput) {
    return this.prisma.client.update({
      where: { idClient: id },
      data,
    });
  }

  async schimbaStatusClient(id: number, status: StatusGeneral) {
    return this.prisma.client.update({
      where: { idClient: id },
      data: { status },
    });
  }

  // ─── ANGAJAȚI ───────────────────────────────────────────────────────

  async fetchAngajati() {
    return this.prisma.angajat.findMany({
      orderBy: { idAngajat: 'desc' },
    });
  }

  async saveAngajat(data: Prisma.AngajatCreateInput) {
    return this.prisma.angajat.create({ data });
  }

  async updateAngajat(id: number, data: Prisma.AngajatUpdateInput) {
    return this.prisma.angajat.update({
      where: { idAngajat: id },
      data,
    });
  }

  async schimbaStatusAngajat(id: number, status: StatusGeneral) {
    return this.prisma.angajat.update({
      where: { idAngajat: id },
      data: { status },
    });
  }

  // ─── ASIGURĂTORI ────────────────────────────────────────────────────

  async fetchAsiguratori() {
    return this.prisma.asigurator.findMany({
      orderBy: { idAsigurator: 'desc' },
    });
  }

  async saveAsigurator(data: Prisma.AsiguratorCreateInput) {
    return this.prisma.asigurator.create({ data });
  }

  async updateAsigurator(id: number, data: Prisma.AsiguratorUpdateInput) {
    return this.prisma.asigurator.update({
      where: { idAsigurator: id },
      data,
    });
  }

  async schimbaStatusAsigurator(id: number, status: StatusGeneral) {
    return this.prisma.asigurator.update({
      where: { idAsigurator: id },
      data: { status },
    });
  }
}