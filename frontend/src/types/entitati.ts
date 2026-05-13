// Aceste tipuri sunt modelul "simplu" folosit de modulele de entități.
// Ele pornesc din nucleul comun definit în `types/domain.ts`,
// iar fiecare ecran adaugă doar câmpurile specifice CRUD-ului local.
import type {
  AngajatCore,
  AsiguratorCore,
  ClientCoreBase,
  TipClientCrud,
} from './domain';

export interface Client extends ClientCoreBase {
  tipClient: TipClientCrud;
  adresa: string;
  soldDebitor: number;
  CNP?: string;
  serieCI?: string;
  CUI?: string;
  IBAN?: string;
  nrRegCom?: string;
}

export interface Angajat extends AngajatCore {
  departament?: string;
  sporConducere?: number;
  specializare?: string;
  costOrar?: number;
  nrBirou?: string;
  tura?: string;
}

export type Asigurator = AsiguratorCore;

export interface Vehicul {
  idVehicul: number;
  idClient: number;
  numarInmatriculare: string;
  marca: string;
  model: string;
  anFabricatie: number;
  vin: string;
  status: 'Activ' | 'Inactiv';
}
