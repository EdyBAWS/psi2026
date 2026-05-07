// src/modules/04incasari/incasari.service.ts
import { facturiRestanteMock, incasariMock } from '../../mock/incasari';
import type { FacturaMock } from '../../mock/types';

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const IncasariService = {
  async fetchFacturiRestante(): Promise<FacturaMock[]> {
    await delay(300);
    return [...facturiRestanteMock];
  },
  
  async fetchIncasariIstoric() {
    await delay(200);
    return [...incasariMock];
  },

  async salveazaIncasare(_dateIncasare: any) {
    await delay(500);
    // Endpoint viitor: POST /api/incasari
    return { success: true, idIncasare: Date.now() };
  }
};
