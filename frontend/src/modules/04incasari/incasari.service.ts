// src/modules/04incasari/incasari.service.ts
import { apiJson } from '../../lib/api';
import { type Factura, type Incasare } from '../../types/facturare';

const modalitateToBackend: Record<string, string> = {
  'Transfer Bancar': 'TransferBancar',
  POS: 'POS',
  Cash: 'Cash',
};

const modalitateFromBackend: Record<string, string> = {
  TransferBancar: 'Transfer Bancar',
  POS: 'POS',
  Cash: 'Cash',
};

export const IncasariService = {
  async fetchFacturiRestante(): Promise<Factura[]> {
    const data = await apiJson<any[]>('/incasari/facturi-restante');
    return data.map(f => ({
      idFactura: f.idFactura,
      idClient: f.idClient,
      numar: f.numar.toString(),
      dataEmitere: f.dataEmiterii,
      dataScadenta: f.scadenta,
      client: f.client?.nume || 'Client necunoscut',
      totalInitial: f.totalGeneral,
      restDePlata: f.totalGeneral - (f.incasari?.reduce((acc: number, val: any) => acc + val.sumaAlocata, 0) || 0),
      status: f.status
    }));
  },
  
  async fetchIncasariIstoric(): Promise<Incasare[]> {
    const incasari = await apiJson<any[]>('/incasari');

    return incasari.map((incasare) => ({
      idIncasare: incasare.idIncasare,
      idFactura: incasare.alocari?.[0]?.idFactura ?? 0,
      dataIncasare: incasare.data,
      suma: incasare.suma,
      modalitate: (modalitateFromBackend[incasare.modalitate] ?? 'Cash') as "Transfer Bancar" | "Cash" | "POS",
      referinta: incasare.referinta,
      // Platitorul: asiguratorul daca exista, altfel clientul beneficiar
      client: incasare.asigurator?.denumire ?? incasare.client?.nume ?? 'Necunoscut',
      tipPlatitor: incasare.asigurator ? 'asigurator' : 'client',
      numeAsigurator: incasare.asigurator?.denumire ?? null,
      numeBeneficiar: incasare.client?.nume ?? null,
      alocari: incasare.alocari?.map((a: any) => ({
        idFactura: a.idFactura,
        numar: a.factura?.numar,
        serie: a.factura?.serie,
        sumaAlocata: a.sumaAlocata,
      })) || [],
    }));
  },

  async salveazaIncasare(dateIncasare: any) {
    return apiJson('/incasari', {
      method: 'POST',
      body: JSON.stringify({
        // Daca platitorul este asigurator, trimitem idAsigurator (nu idClient)
        ...(dateIncasare.idAsigurator
          ? { idAsigurator: dateIncasare.idAsigurator }
          : { idClient: dateIncasare.idClient }
        ),
        sumaIncasata: dateIncasare.sumaIncasata,
        modalitate: modalitateToBackend[dateIncasare.metodaPlata] ?? dateIncasare.metodaPlata,
        referinta: dateIncasare.referinta,
        data: new Date(dateIncasare.data).toISOString(),
        alocari: dateIncasare.alocari.map((factura: any) => ({
          idFactura: factura.idFactura,
          sumaAlocata: Number(factura.sumaAlocata),
        })),
      }),
    });
  }
};

