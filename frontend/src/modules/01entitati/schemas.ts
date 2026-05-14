import { z } from 'zod';

const mesajEmail = 'Introdu o adresă de email validă.';
const mesajTelefon = 'Introdu un număr de telefon valid.';

export const clientSchema = z
  .object({
    tipClient: z.enum(['PF', 'PJ']),
    status: z.enum(['Activ', 'Inactiv']), 
    nume: z.string().trim().min(2, 'Numele / Denumirea este obligatorie.'), 
    prenume: z.string().trim().optional(), 
    telefon: z.string().trim().min(6, mesajTelefon),
    email: z.string().trim().email(mesajEmail).or(z.literal('')),
    adresa: z.string().trim().min(5, 'Adresa este obligatorie.'),
    soldDebitor: z.number().min(0, 'Soldul debitor nu poate fi negativ.'),
    CNP: z.string().trim().optional(),
    serieCI: z.string().trim().optional(),
    CUI: z.string().trim().optional(),
    IBAN: z.string().trim().optional(),
    nrRegCom: z.string().trim().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.tipClient === 'PF') {
      if (!data.CNP) {
        ctx.addIssue({ code: 'custom', message: 'CNP este obligatoriu.', path: ['CNP'] });
      }
      if (!data.serieCI) {
        ctx.addIssue({ code: 'custom', message: 'Seria CI este obligatorie.', path: ['serieCI'] });
      }
    }
    if (data.tipClient === 'PJ') {
      if (!data.CUI) {
        ctx.addIssue({ code: 'custom', message: 'CUI este obligatoriu.', path: ['CUI'] });
      }
      if (!data.nrRegCom) {
        ctx.addIssue({ code: 'custom', message: 'Nr. Reg. Com. este obligatoriu.', path: ['nrRegCom'] });
      }
    }
  });

export const angajatSchema = z
  .object({
    status: z.enum(['Activ', 'Inactiv']),
    nume: z.string().trim().min(2, 'Numele este obligatoriu.'),
    prenume: z.string().trim().min(2, 'Prenumele este obligatoriu.'),
    CNP: z.string().trim().min(13, 'CNP-ul trebuie să aibă 13 caractere.'),
    telefon: z.string().trim().min(6, mesajTelefon),
    email: z.string().trim().email(mesajEmail).or(z.literal('')),
    tipAngajat: z.enum(['Manager', 'Mecanic', 'Receptioner', 'Inspector']),
    departament: z.string().trim().optional(),
    sporConducere: z.number({ error: 'Introdu un număr valid.' }).min(0, 'Minim 0.').optional(),
    specializare: z.string().trim().optional(),
    costOrar: z.number({ error: 'Introdu un număr valid.' }).min(0, 'Minim 0.').optional(),
    nrBirou: z.string().trim().optional(),
    tura: z.string().trim().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.tipAngajat === 'Manager' && !data.departament) {
      ctx.addIssue({ code: 'custom', message: 'Obligatoriu.', path: ['departament'] });
    }
    if (data.tipAngajat === 'Mecanic' && !data.specializare) {
      ctx.addIssue({ code: 'custom', message: 'Obligatoriu.', path: ['specializare'] });
    }
    if (data.tipAngajat === 'Receptioner' && !data.nrBirou) {
      ctx.addIssue({ code: 'custom', message: 'Obligatoriu.', path: ['nrBirou'] });
    }
  });


export const asiguratorSchema = z.object({
  denumire: z.string().min(2, 'Denumirea este obligatorie'),
  CUI: z.string().min(5, 'CUI incorect'),
  telefon: z.string().optional().or(z.literal('')),
  nrRegCom: z.string().optional().or(z.literal('')),
  adresa: z.string().optional().or(z.literal('')),
  emailDaune: z.string()
    .optional()
    .refine(val => !val || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val), { message: "Format email invalid" })
    .or(z.literal('')),
  IBAN: z.string().optional().or(z.literal('')),
  
  // AM MODIFICAT AICI: Fără detalii suplimentare, doar z.number()
  termenPlataZile: z.number().min(0, 'Minim 0 zile'),
  
  // AM MODIFICAT AICI: Am șters .default('Activ') ca să se potrivească perfect tipurile
  status: z.enum(['Activ', 'Inactiv'])
});

export type ClientFormValues = z.infer<typeof clientSchema>;
export type AngajatFormValues = z.infer<typeof angajatSchema>;
export type AsiguratorFormValues = z.infer<typeof asiguratorSchema>;
