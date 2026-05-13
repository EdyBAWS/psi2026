// src/modules/04incasari/incasari.service.ts
import { apiJson } from '../../lib/api';
import type { FacturaMock } from '../../mock/types';

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
  async fetchFacturiRestante(): Promise<FacturaMock[]> {
    return apiJson('/incasari/facturi-restante');
  },
  
  async fetchIncasariIstoric() {
    const incasari = await apiJson<any[]>('/incasari');

    return incasari.map((incasare) => ({
      idIncasare: incasare.idIncasare,
      idFactura: incasare.alocari?.[0]?.idFactura ?? 0,
      dataIncasare: incasare.data,
      suma: incasare.suma,
      modalitate: modalitateFromBackend[incasare.modalitate] ?? incasare.modalitate,
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
