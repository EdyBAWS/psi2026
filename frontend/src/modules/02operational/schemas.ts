import { z } from 'zod';

// Aici ținem validările de "formă" pentru fluxul operațional.
// Cu alte cuvinte, schema verifică dacă datele arată corect:
// - dacă un câmp este completat
// - dacă un număr este pozitiv
// - dacă un text are lungimea minimă
// Regulile mai "de business" rămân în `validations.ts`.
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

// Schema de dosar nou validează doar cazul în care utilizatorul creează
// un dosar de daună de la zero. Pentru dosarul existent, verificarea este mai simplă
// și se face separat în flux.
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
