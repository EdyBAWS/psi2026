import { z } from 'zod';

export const clientSchema = z.object({
  tipClient: z.enum(['PF', 'PJ']),
  status: z.enum(['Activ', 'Inactiv']),
  nume: z.string().min(2, 'Numele / Denumirea trebuie să aibă minim 2 caractere'),
  prenume: z.string().optional(),
  telefon: z.string().min(10, 'Numărul de telefon este obligatoriu'),
  email: z.string().email('Format email invalid').or(z.literal('')),
  adresa: z.string().min(3, 'Adresa este obligatorie'),
  soldDebitor: z.number(),
  CNP: z.string().optional(),
  serieCI: z.string().optional(),
  CUI: z.string().optional(),
  IBAN: z.string().optional(),
  nrRegCom: z.string().optional(),
});

export type ClientFormValues = z.infer<typeof clientSchema>;

export const angajatSchema = z.object({
  status: z.enum(['Activ', 'Inactiv']),
  nume: z.string().min(2, 'Obligatoriu'),
  prenume: z.string().min(2, 'Obligatoriu'),
  CNP: z.string().length(13, 'CNP-ul trebuie să aibă 13 cifre'),
  telefon: z.string().min(10, 'Obligatoriu'),
  email: z.string().email('Invalid').or(z.literal('')),
  tipAngajat: z.enum(['Manager', 'Mecanic', 'Receptioner']),
  departament: z.string().optional(),
  sporConducere: z.number().optional(),
  specializare: z.string().optional(),
  costOrar: z.number().optional(),
  nrBirou: z.string().optional(),
  tura: z.string().optional(),
});
export type AngajatFormValues = z.infer<typeof angajatSchema>;

export const asiguratorSchema = z.object({
  status: z.enum(['Activ', 'Inactiv']),
  denumire: z.string().min(2, 'Obligatoriu'),
  CUI: z.string().min(5, 'Obligatoriu'),
  telefon: z.string().min(10, 'Obligatoriu'),
});
export type AsiguratorFormValues = z.infer<typeof asiguratorSchema>;