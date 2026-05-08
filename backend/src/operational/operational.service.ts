import { Injectable, BadRequestException } from '@nestjs/common';
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

  // --- VEHICULE ---
  async getVehicule() {
    return this.prisma.vehicul.findMany({
      include: { 
        client: true,
        comenzi: { orderBy: { createdAt: 'desc' } },
        dosareDauna: {
          include: { comenzi: { orderBy: { createdAt: 'desc' } } }
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

  // --- DOSARE ---
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
    return this.prisma.dosarDauna.update({ where: { idDosar: id }, data });
  }

  // --- COMENZI ---
  async getComenzi() {
    const comenzi = await this.prisma.comanda.findMany({
      include: {
        client: true,
        vehicul: true,
        dosar: { include: { client: true, vehicul: true } },
        angajat: true,
        pozitii: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return comenzi.map((c) => {
      const totalEstimat = c.pozitii?.reduce((sum, poz) => sum + (poz.cantitate * poz.pretUnitar), 0) || 0;
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
    return this.prisma.comanda.create({
      data: {
        ...data,
        dataPreconizata: data.dataPreconizata ? new Date(data.dataPreconizata) : null,
      },
    });
  }

  async updateComanda(id: number, data: UpdateComandaDto) {
    // Verificăm dacă este deja facturată în baza de date
    const comandaExistenta = await this.prisma.comanda.findUnique({ where: { idComanda: id } });
    
    if (comandaExistenta?.status === StatusReparatie.FACTURAT) {
      throw new BadRequestException('Comanda este deja facturată și nu mai poate fi modificată.');
    }

    const comanda = await this.prisma.comanda.update({
      where: { idComanda: id },
      data: {
        ...data,
        dataPreconizata: data.dataPreconizata ? new Date(data.dataPreconizata) : undefined,
      },
    });

    if (data.status === StatusReparatie.ANULAT) {
      await this.notificariService.create({
        tip: TipNotificare.Avertizare,
        mesaj: `Comanda ${comanda.numarComanda} a fost anulată.`,
        paginaDestinatie: 'operational-comenzi',
        sursaModul: 'Operațional',
        idComanda: comanda.idComanda,
      });
    }

    return comanda;
  }
}