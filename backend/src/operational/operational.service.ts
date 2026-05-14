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

  async getNextNumarDosar(): Promise<string> {
    const an = new Date().getFullYear();
    const prefix = `DAUNA-${an}-`;
    const dosare = await this.prisma.dosarDauna.findMany({
      where: { numarDosar: { startsWith: prefix } },
      select: { numarDosar: true },
    });
    let maxNr = 0;
    for (const d of dosare) {
      const nrStr = d.numarDosar.replace(prefix, '');
      const nr = parseInt(nrStr, 10);
      if (!isNaN(nr) && nr > maxNr) maxNr = nr;
    }
    return `${prefix}${String(maxNr + 1).padStart(3, '0')}`;
  }

  async createDosar(data: CreateDosarDaunaDto) {
    const numarDosar = await this.getNextNumarDosar();
    const { idInspector, ...rest } = data;
    return this.prisma.dosarDauna.create({ 
      data: {
        ...rest,
        numarDosar,
        idInspector: idInspector ?? undefined,
      } 
    });
  }

  async updateDosar(id: number, data: UpdateDosarDaunaDto) {
    const { idInspector, ...rest } = data;
    return this.prisma.dosarDauna.update({ 
      where: { idDosar: id }, 
      data: {
        ...rest,
        idInspector: idInspector ?? undefined,
      }
    });
  }



  // --- COMENZI ---
  async getComenzi() {
    const comenzi = await this.prisma.comanda.findMany({
      include: {
        client: true,
        vehicul: true,
        dosar: { include: { client: true, vehicul: true, inspector: true } },
        creator: true,
        mecanici: true,
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

  async getNextNumarComanda(): Promise<string> {
    // Cautam toate comenzile din anul curent pentru a gasi cel mai mare numar
    const an = new Date().getFullYear();
    const prefix = `CMD-${an}-`;
    
    const comenzi = await this.prisma.comanda.findMany({
      where: {
        numarComanda: {
          startsWith: prefix,
        },
      },
      select: {
        numarComanda: true,
      },
    });

    let maxNr = 0;
    for (const c of comenzi) {
      const nrStr = c.numarComanda.replace(prefix, '');
      const nr = parseInt(nrStr, 10);
      if (!isNaN(nr) && nr > maxNr) {
        maxNr = nr;
      }
    }

    const nextId = maxNr + 1;
    return `${prefix}${String(nextId).padStart(3, '0')}`;
  }

  async createComanda(data: CreateComandaDto) {
    const numarComanda = await this.getNextNumarComanda();
    const { idMecanici, ...rest } = data;
    
    return this.prisma.comanda.create({
      data: {
        ...rest,
        numarComanda,
        dataPreconizata: data.dataPreconizata ? new Date(data.dataPreconizata) : null,
        mecanici: idMecanici ? {
          connect: idMecanici.map(id => ({ idAngajat: id }))
        } : undefined
      },
      include: { mecanici: true }
    });
  }

  async updateComanda(id: number, data: UpdateComandaDto) {
    // Verificăm dacă este deja facturată în baza de date
    const comandaExistenta = await this.prisma.comanda.findUnique({ where: { idComanda: id } });
    
    if (comandaExistenta?.status === StatusReparatie.FACTURAT) {
      throw new BadRequestException('Comanda este deja facturată și nu mai poate fi modificată.');
    }

    const { idMecanici, ...rest } = data;
    
    const comanda = await this.prisma.comanda.update({
      where: { idComanda: id },
      data: {
        ...rest,
        dataPreconizata: data.dataPreconizata ? new Date(data.dataPreconizata) : undefined,
        mecanici: idMecanici ? {
          set: idMecanici.map(id => ({ idAngajat: id }))
        } : undefined
      },
      include: { mecanici: true }
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

  // --- POZIȚII COMANDĂ (DEVIZ) ---
  async getPozitiiByComanda(idComanda: number) {
    return this.prisma.comandaPozitie.findMany({
      where: { idComanda },
      orderBy: { idPozitie: 'asc' },
    });
  }

  async getAllPozitii() {
    return this.prisma.comandaPozitie.findMany({
      orderBy: { idPozitie: 'asc' },
    });
  }

  async updatePozitiiComanda(idComanda: number, pozitii: any[]) {
    // Folosim o tranzacție pentru a asigura atomicitatea (ștergem tot și recreăm)
    return this.prisma.$transaction(async (tx) => {
      // 1. Ștergem pozițiile existente pentru această comandă
      await tx.comandaPozitie.deleteMany({
        where: { idComanda },
      });

      // 2. Creăm noile poziții
      const created = await Promise.all(
        pozitii.map((p) =>
          tx.comandaPozitie.create({
            data: {
              idComanda,
              tipArticol: p.tipArticol || p.tipPozitie?.toUpperCase() || 'PIESA',
              idArticol: p.idArticol || p.catalogId || null,
              idKit: p.idKit || (p.tipPozitie === 'Kit' ? p.catalogId : null),
              codArticol: p.codArticol,
              descriere: p.descriere || '',
              unitateMasura: p.unitateMasura,
              cantitate: Number(p.cantitate) || 0,
              pretUnitar: Number(p.pretUnitar || p.pretVanzare) || 0,
              discount: Number(p.discount || p.discountProcent) || 0,
              cotaTva: Number(p.cotaTva || p.cotaTVA) || 19,
              observatii: p.observatii || p.observatiiPozitie || null,
            },
          }),
        ),
      );

      return created;
    });
  }
}