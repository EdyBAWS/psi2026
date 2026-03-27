// Notificările demo citesc aceleași numere de documente și dosare din mock-urile
// comune, astfel încât centrul de notificări să nu mai pară rupt de restul aplicației.
import { facturiRestanteMock } from './incasari';
import { mockComenzi, mockDosareDauna } from './operational';
import type { NotificareMock } from './types';

const comandaGataDeFacturare = mockComenzi.find((comanda) => comanda.status === 'Gata de livrare');
const facturaRestantaVeche = facturiRestanteMock.find((factura) => factura.dataScadenta < '2026-03-26');

export const notificariMock: NotificareMock[] = [
  {
    id: 1,
    data: '2026-03-26',
    ora: '09:45',
    mesaj: facturaRestantaVeche
      ? `Factura ${facturaRestantaVeche.numar} a depășit scadența și are încă ${facturaRestantaVeche.restDePlata.toFixed(2)} RON de încasat.`
      : 'Există facturi emise care necesită urmărire la încasare.',
    paginaDestinatie: 'incasari',
    sursaModul: 'Încasări',
    textActiune: 'Deschide Încasări',
    tip: 'Avertizare',
  },
  {
    id: 2,
    data: '2026-03-25',
    ora: '14:10',
    mesaj: comandaGataDeFacturare
      ? `Comanda ${comandaGataDeFacturare.nrComanda} este gata de livrare și poate intra în fluxul de facturare.`
      : 'Există comenzi finalizate care pot fi pregătite pentru facturare.',
    paginaDestinatie: 'facturare-comenzi',
    sursaModul: 'Facturare',
    textActiune: 'Mergi la Facturare',
    tip: 'Info',
  },
  {
    id: 3,
    data: '2026-03-24',
    ora: '11:20',
    mesaj: `A fost actualizat dosarul de daună ${mockDosareDauna[3]?.nrDosar ?? 'DAUNA-2026-004'} pentru vehiculul de flotă aflat în analiză.`,
    paginaDestinatie: 'operational-comenzi',
    sursaModul: 'Operațional',
    textActiune: 'Deschide Gestiune Comenzi',
    tip: 'Info',
  },
];
