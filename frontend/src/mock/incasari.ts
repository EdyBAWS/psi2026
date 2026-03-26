// Încasările folosesc aceleași facturi emise ca facturarea. Asta nu înseamnă
// că avem sincronizare live, dar înseamnă că utilizatorul recunoaște aceleași
// documente și aceleași sume pe ecrane diferite.
import { facturiEmiseMock } from './facturare';
import type { FacturaMock, IncasareMock } from './types';

export const facturiRestanteMock: FacturaMock[] = facturiEmiseMock.filter(
  (factura) => factura.restDePlata > 0,
);

export const incasariMock: IncasareMock[] = [
  {
    idIncasare: 1,
    idFactura: 9001,
    dataIncasare: '2026-03-25',
    suma: 515.27,
    modalitate: 'Transfer Bancar',
  },
];
