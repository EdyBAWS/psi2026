// src/modules/03facturare/facturare.service.ts
import {
  obtineComenziFacturabileDinMock,
  obtineLiniiFacturaDinComandaMock,
  istoricFacturareMock,
  facturiEmiseMock,
  obtineLiniiFacturaEmisaDinMock
} from '../../mock/facturare';
import { facturiRestanteMock } from '../../mock/incasari';
import { mockClienti } from '../../mock/operational';

// Funcție utilitară pentru a simula latența unui API real
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const FacturareService = {
  // --- FACTURARE COMENZI ---
  async fetchComenziFacturabile() {
    await delay(300);
    return obtineComenziFacturabileDinMock();
  },
  async fetchLiniiFactura(idComanda: number) {
    await delay(200);
    return obtineLiniiFacturaDinComandaMock(idComanda);
  },
  async emiteFactura(_idComanda: number, _dateFactura: any) {
    await delay(500);
    // Când va exista un backend: axios.post('/api/facturi', { idComanda, ...dateFactura })
    return { success: true, id: Math.random() };
  },

  // --- ISTORIC FACTURARE ---
  async fetchIstoric() {
    await delay(300);
    return [...istoricFacturareMock];
  },

  // --- OFERTE / STORNO ---
  async fetchFacturiEmise() {
    await delay(300);
    return [...facturiEmiseMock];
  },
  async fetchLiniiFacturaEmisa(idFactura: number) {
    await delay(200);
    return obtineLiniiFacturaEmisaDinMock(idFactura);
  },
  async salveazaAjustare(_data: any) {
    await delay(400);
    return { success: true };
  },

  // --- PENALIZARI ---
  async fetchFacturiRestante() {
    await delay(300);
    return [...facturiRestanteMock];
  },
  async fetchClienti() {
    await delay(300);
    return [...mockClienti];
  },
  async emitePenalizare(_data: any) {
    await delay(500);
    return { success: true };
  }
};
