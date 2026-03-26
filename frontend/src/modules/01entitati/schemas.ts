import { z } from 'zod';

// Schemele `zod` țin validarea structurii formularului într-un singur loc.
// Avantajul este că JSX-ul rămâne mai curat, iar regulile pot fi citite separat
// de interfața vizuală.
const mesajEmail = 'Introdu o adresă de email validă.';
const mesajTelefon = 'Introdu un număr de telefon valid.';

// Pentru client verificăm atât câmpurile de bază,
// cât și câmpurile condiționale în funcție de tipul PF/PJ.
export const clientSchema = z
  .object({
    tipClient: z.enum(['PF', 'PJ']),
    nume: z.string().min(2, 'Numele trebuie să aibă minim 2 caractere'),      
    prenume: z.string().optional(),
    telefon: z.string().trim().min(6, mesajTelefon),
    email: z.string().trim().email(mesajEmail),
    adresa: z.string().trim().min(4, 'Adresa este obligatorie.'),
    soldDebitor: z.number().min(0, 'Soldul debitor nu poate fi negativ.'),
    CNP: z.string().trim().optional(),
    serieCI: z.string().trim().optional(),
    CUI: z.string().trim().optional(),
    IBAN: z.string().trim().optional(),
    nrRegCom: z.string().trim().optional(),
  })
  .superRefine((data, ctx) => {
    // `superRefine` este util când regula depinde de combinația mai multor câmpuri,
    // nu doar de validarea unuia singur.
    if (data.tipClient === 'PF') {
      if (!data.CNP) {
        ctx.addIssue({
          code: 'custom',
          message: 'CNP este obligatoriu pentru persoane fizice.',
          path: ['CNP'],
        });
      }
      if (!data.serieCI) {
        ctx.addIssue({
          code: 'custom',
          message: 'Seria CI este obligatorie pentru persoane fizice.',
          path: ['serieCI'],
        });
      }
    }

    if (data.tipClient === 'PJ') {
      if (!data.CUI) {
        ctx.addIssue({
          code: 'custom',
          message: 'CUI este obligatoriu pentru persoane juridice.',
          path: ['CUI'],
        });
      }
      if (!data.nrRegCom) {
        ctx.addIssue({
          code: 'custom',
          message: 'Numărul de Registrul Comerțului este obligatoriu.',
          path: ['nrRegCom'],
        });
      }
    }
  });

// La angajați, rolul ales influențează ce câmpuri devin obligatorii.
export const angajatSchema = z
  .object({
    nume: z.string().trim().min(2, 'Numele este obligatoriu.'),
    prenume: z.string().trim().min(2, 'Prenumele este obligatoriu.'),
    CNP: z.string().trim().min(13, 'CNP-ul trebuie să aibă 13 caractere.'),
    telefon: z.string().trim().min(6, mesajTelefon),
    email: z.string().trim().email(mesajEmail),
    tipAngajat: z.enum(['Manager', 'Mecanic', 'Receptioner']),
    departament: z.string().trim().optional(),
    sporConducere: z.number().min(0).optional(),
    specializare: z.string().trim().optional(),
    costOrar: z.number().min(0).optional(),
    nrBirou: z.string().trim().optional(),
    tura: z.string().trim().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.tipAngajat === 'Manager' && !data.departament) {
      ctx.addIssue({
        code: 'custom',
        message: 'Departamentul este obligatoriu pentru manager.',
        path: ['departament'],
      });
    }
    if (data.tipAngajat === 'Mecanic' && !data.specializare) {
      ctx.addIssue({
        code: 'custom',
        message: 'Specializarea este obligatorie pentru mecanic.',
        path: ['specializare'],
      });
    }
    if (data.tipAngajat === 'Receptioner' && !data.nrBirou) {
      ctx.addIssue({
        code: 'custom',
        message: 'Numărul de birou este obligatoriu pentru recepționer.',
        path: ['nrBirou'],
      });
    }
  });

// Asiguratorul are nevoie doar de o validare simplă de bază.
export const asiguratorSchema = z.object({
  denumire: z.string().trim().min(2, 'Denumirea este obligatorie.'),
  CUI: z.string().trim().min(2, 'CUI este obligatoriu.'),
  telefon: z.string().trim().min(6, mesajTelefon),
});

// `z.infer` ne ajută să derivăm automat tipurile TypeScript din scheme,
// ca să nu dublăm aceeași definiție în două locuri.
export type ClientFormValues = z.infer<typeof clientSchema>;
export type AngajatFormValues = z.infer<typeof angajatSchema>;
export type AsiguratorFormValues = z.infer<typeof asiguratorSchema>;
