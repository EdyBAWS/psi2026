import { z } from 'zod';

export const detaliiPreluareSchema = z.object({
  kilometrajPreluare: z.union([
    z.number().positive('Completează kilometrajul de preluare.'),
    z.literal(''),
  ]),
  nivelCombustibil: z.enum(['Rezerva', '1/4', '1/2', '3/4', 'Plin']),
  simptomeReclamate: z
    .string()
    .trim()
    .min(10, 'Descrie simptomele reclamate în minimum 10 caractere.'),
  observatiiPreluare: z.string(),
  observatiiCaroserie: z.string(),
  accesoriiPredate: z.string(),
  termenPromis: z.string().min(1, 'Setează un termen promis pentru livrare.'),
  prioritate: z.enum(['Scazuta', 'Normala', 'Ridicata', 'Urgenta']),
  tipPlata: z.enum(['Client Direct', 'Asigurare', 'Flota']),
});

export const dosarNouSchema = z.object({
  idAsigurator: z.number().nullable().refine((value) => value !== null, {
    message: 'Selectează asiguratorul pentru dosarul nou.',
  }),
  numarReferintaAsigurator: z
    .string()
    .trim()
    .min(1, 'Numărul de referință al asiguratorului este obligatoriu.'),
  tipPolita: z.enum(['RCA', 'CASCO']),
  dataConstatare: z.string().min(1, 'Data constatării este obligatorie.'),
  sumaAprobata: z.union([
    z.number().positive('Suma aprobată trebuie să fie mai mare decât 0.'),
    z.literal(''),
  ]),
  franciza: z.union([
    z.number().min(0, 'Franciza nu poate fi negativă.'),
    z.literal(''),
  ]),
  statusAprobare: z.enum([
    'Deschis',
    'In analiza',
    'Aprobat partial',
    'Aprobat',
    'Respins',
  ]),
  inspectorDauna: z.string().trim().min(1, 'Inspectorul de daună este obligatoriu.'),
  observatiiDauna: z.string(),
});
