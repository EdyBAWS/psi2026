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
import { StatusGeneral, StatusReparatie, TipNotificare } from '@prisma/client';
import { NotificariService } from '../notificari/notificari.service';

@Injectable()
export class OperationalService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notificariService: NotificariService,
  ) {}

  // ===================== VEHICULE =====================
  async getVehicule() {
    return this.prisma.vehicul.findMany({
      include: { 
        client: true,
        comenzi: {
          orderBy: { createdAt: 'desc' }
        },
        dosareDauna: {
          include: {
            comenzi: {
              orderBy: { createdAt: 'desc' }
            }
          }
        }
      },
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
    const comenzi = await this.prisma.comanda.findMany({
      include: {
        client: true,
        vehicul: true,
        dosar: {
          include: { client: true, vehicul: true },
        },
        angajat: true,
        pozitii: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return comenzi.map((c) => {
      const totalEstimat = c.pozitii?.reduce((sum, pozitie) => {
        return sum + (pozitie.cantitate * pozitie.pretUnitar);
      }, 0) || 0;

      const clientFinal = c.client || c.dosar?.client || null;
      const vehiculFinal = c.vehicul || c.dosar?.vehicul || null;

      return {
        ...c,
        client: clientFinal,
        vehicul: vehiculFinal,
        totalEstimat,
      };
    });
  }

  async createComanda(data: CreateComandaDto) {
    const comanda = await this.prisma.comanda.create({
      data: {
        numarComanda: data.numarComanda,
        dataPreconizata: data.dataPreconizata ? new Date(data.dataPreconizata) : null,
        idDosar: data.idDosar,
        idClient: data.idClient,
        idVehicul: data.idVehicul,
        idAngajat: data.idAngajat,
        status: data.status || StatusReparatie.IN_ASTEPTARE_DIAGNOZA,
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
        numarComanda: data.numarComanda,
        dataPreconizata: data.dataPreconizata ? new Date(data.dataPreconizata) : undefined,
        idDosar: data.idDosar,
        idClient: data.idClient,
        idVehicul: data.idVehicul,
        idAngajat: data.idAngajat,
        status: data.status,
      },
    });

    await this.notificariService.create({
      tip:
        data.status === StatusReparatie.ANULAT
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