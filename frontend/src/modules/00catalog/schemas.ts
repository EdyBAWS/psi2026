import { z } from 'zod';

export const piesaSchema = z.object({
  codPiesa: z.string().trim().min(2, 'Codul este obligatoriu.'),
  denumire: z.string().trim().min(3, 'Denumirea este obligatorie.'),
  producator: z.string().trim().min(2, 'Producătorul este obligatoriu.'),
  categorie: z.string().min(1, 'Selectează o categorie.'),
  pretBaza: z.number({ 
    message: 'Prețul este obligatoriu și trebuie să fie un număr.',
  }).min(0.01, 'Prețul este obligatoriu.'),
  stoc: z.number({
    message: 'Stocul trebuie să fie un număr.',
  }).min(0, 'Stocul nu poate fi negativ.').default(0),
  tip: z.enum(['NOUA', 'SH'], {
    message: 'Selectează tipul piesei (Nouă/SH).'
  }),
  luniGarantie: z.number().optional().nullable(),
  gradUzura: z.string().optional().nullable(),
}).superRefine((data, ctx) => {
  if (data.tip === 'NOUA' && (data.luniGarantie === undefined || data.luniGarantie === null || data.luniGarantie <= 0)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Garanția este obligatorie pentru piesele noi.',
      path: ['luniGarantie'],
    });
  }
  if (data.tip === 'SH' && (!data.gradUzura || data.gradUzura.trim().length === 0)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Gradul de uzură este obligatoriu pentru piesele SH.',
      path: ['gradUzura'],
    });
  }
});

export const manoperaSchema = z.object({
  codManopera: z.string().trim().min(2, 'Codul este obligatoriu.'),
  denumire: z.string().trim().min(3, 'Denumirea este obligatorie.'),
  categorie: z.string().min(1, 'Selectează o categorie.'),
  durataStd: z.number().min(0.1, 'Durata minimă este 0.1 ore.'),
});

export type PiesaFormValues = z.infer<typeof piesaSchema>;
export type ManoperaFormValues = z.infer<typeof manoperaSchema>;
