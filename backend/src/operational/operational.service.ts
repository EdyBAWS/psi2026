import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateVehiculDto,
  UpdateVehiculDto,
  CreateDosarDaunaDto,
  UpdateDosarDaunaDto,
  CreateComandaDto,
  UpdateComandaDto,
} from './dto/operational.dto';
import { StatusGeneral } from '@prisma/client';
import { TipNotificare } from '@prisma/client';
import { NotificariService } from '../notificari/notificari.service';

@Injectable()
export class OperationalService {
  constructor(
    private prisma: PrismaService,
    private notificariService: NotificariService,
  ) {}

  // ===================== VEHICULE =====================
  async getVehicule() {
    return this.prisma.vehicul.findMany({
      include: { client: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async createVehicul(data: CreateVehiculDto) {
    return this.prisma.vehicul.create({ data });
  }

  async updateVehicul(id: number, data: UpdateVehiculDto) {
    return this.prisma.vehicul.update({ where: { idVehicul: id }, data });
  }

  async schimbaStatusVehicul(id: number, status: StatusGeneral) {
    return this.prisma.vehicul.update({
      where: { idVehicul: id },
      data: { status },
    });
  }

  // ===================== DOSARE DAUNĂ =====================
  async getDosare() {
    return this.prisma.dosarDauna.findMany({
      include: { client: true, vehicul: true, asigurator: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async createDosar(data: CreateDosarDaunaDto) {
    return this.prisma.dosarDauna.create({ data });
  }

  async updateDosar(id: number, data: UpdateDosarDaunaDto) {
    return this.prisma.dosarDauna.update({
      where: { idDosar: id },
      data,
    });
  }

  // ===================== COMENZI =====================
  async getComenzi() {
    return this.prisma.comanda.findMany({
      include: {
        angajat: true,
        dosar: {
          include: {
            vehicul: true,
            client: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async createComanda(data: CreateComandaDto) {
    const comanda = await this.prisma.comanda.create({
      data: {
        ...data,
        dataPreconizata: data.dataPreconizata
          ? new Date(data.dataPreconizata)
          : null,
      },
    });

    await this.notificariService.create({
      tip: TipNotificare.Info,
      mesaj: `Comanda ${comanda.numarComanda} a fost deschisă în service.`,
      paginaDestinatie: 'operational-comenzi',
      sursaModul: 'Operațional',
      textActiune: 'Deschide comenzi',
      idComanda: comanda.idComanda,
      metadata: { event: 'comanda-creata' },
    });

    return comanda;
  }

  async updateComanda(id: number, data: UpdateComandaDto) {
    const comanda = await this.prisma.comanda.update({
      where: { idComanda: id },
      data: {
        ...data,
        dataPreconizata: data.dataPreconizata
          ? new Date(data.dataPreconizata)
          : undefined,
      },
    });

    await this.notificariService.create({
      tip:
        data.status === StatusGeneral.Inactiv
          ? TipNotificare.Avertizare
          : TipNotificare.Info,
      mesaj: `Comanda ${comanda.numarComanda} a fost actualizată.`,
      paginaDestinatie: 'operational-comenzi',
      sursaModul: 'Operațional',
      textActiune: 'Deschide comenzi',
      idComanda: comanda.idComanda,
      metadata: { event: 'comanda-actualizata' },
    });

    return comanda;
  }
}
