// Validările pentru fluxul de preluare sunt separate aici pentru ca regulile
// de business să fie mai ușor de citit și testat decât dacă ar rămâne în JSX.
// Pagina `PreluareAuto` trimite starea curentă, iar acest fișier întoarce
// rezultatul într-o formă ușor de afișat în interfață.
import type { ComandaService, PozitieComandaDraft, Vehicul } from "../types";
import type { DetaliiPreluareForm, StareDosarAsigurare } from "./formState";
import { dosarNouSchema } from "./schemas";

export interface ValidarePreluareInput {
  comandaActivaExistenta: ComandaService | null;
  detaliiPreluare: DetaliiPreluareForm;
  esteLucrareAsigurare: boolean;
  idMecanicSelectat: number | null;
  pozitiiDraft: PozitieComandaDraft[];
  stareDosar: StareDosarAsigurare;
  totalEstimat: number;
  vehiculSelectat: Vehicul | null;
}

export interface ValidarePreluareResult {
  dosarValid: boolean;
  mesajeAvertizare: string[];
  mesajeBlocare: string[];
  poateSalva: boolean;
}

// `number | ''` permite câmpul gol în input-urile controlate.
// În validare avem nevoie să știm dacă utilizatorul a introdus deja o valoare numerică reală.
const esteNumarCompletat = (valoare: number | ""): valoare is number =>
  valoare !== "";

// O poziție este considerată validă doar dacă are articol selectat și valori financiare minime.
export const suntPozitiiValide = (pozitiiDraft: PozitieComandaDraft[]) =>
  pozitiiDraft.length > 0 &&
  pozitiiDraft.every(
    (pozitie) =>
      pozitie.catalogId !== null &&
      pozitie.descriere.trim() !== "" &&
      pozitie.codArticol.trim() !== "" &&
      pozitie.cantitate > 0 &&
      pozitie.pretVanzare > 0 &&
      pozitie.discountProcent >= 0 &&
      pozitie.discountProcent <= 100 &&
      pozitie.cotaTVA >= 0,
  );

// Dosarul este valid fie dacă nu suntem în flux de asigurare, fie dacă modul ales
// are toate câmpurile obligatorii completate.
const dosarEsteValid = (
  esteLucrareAsigurare: boolean,
  stareDosar: StareDosarAsigurare,
) => {
  if (!esteLucrareAsigurare) {
    return true;
  }

  if (stareDosar.mod === "existent") {
    return stareDosar.idDosarSelectat !== null;
  }

  return dosarNouSchema.safeParse(stareDosar).success;
};

export function valideazaPreluare({
  comandaActivaExistenta,
  detaliiPreluare,
  esteLucrareAsigurare,
  idMecanicSelectat,
  pozitiiDraft,
  stareDosar,
  totalEstimat,
  vehiculSelectat,
}: ValidarePreluareInput): ValidarePreluareResult {
  // Separăm rezultatul în două categorii:
  // - blocări: utilizatorul nu poate salva
  // - avertizări: utilizatorul poate salva, dar merită atenționat
  const dosarValid = dosarEsteValid(esteLucrareAsigurare, stareDosar);
  const mesajeBlocare: string[] = [];

  // Validările de mai jos combină reguli de structură cu reguli de business.
  // De exemplu, schema știe dacă un text este prea scurt,
  // dar aici decidem dacă lipsa lui chiar blochează salvarea fluxului.
  if (!vehiculSelectat) {
    mesajeBlocare.push("Selectează un vehicul înainte de a continua fluxul.");
  }
  if (comandaActivaExistenta) {
    mesajeBlocare.push(
      `Vehiculul are deja o comandă activă (${comandaActivaExistenta.numarComanda}).`,
    );
  }
  if (idMecanicSelectat === null) {
    mesajeBlocare.push("Alege mecanicul responsabil pentru lucrare.");
  }
  if (
    !esteNumarCompletat(detaliiPreluare.kilometrajPreluare) ||
    detaliiPreluare.kilometrajPreluare <= 0
  ) {
    mesajeBlocare.push("Completează kilometrajul de preluare.");
  }
  if (detaliiPreluare.simptomeReclamate.trim().length < 10) {
    mesajeBlocare.push("Descrie simptomele reclamate în minimum 10 caractere.");
  }
  if (detaliiPreluare.termenPromis === "") {
    mesajeBlocare.push("Setează un termen promis pentru livrare.");
  }
  if (
    detaliiPreluare.termenPromis !== "" &&
    new Date(detaliiPreluare.termenPromis).getTime() <
      new Date().setHours(0, 0, 0, 0)
  ) {
    mesajeBlocare.push("Termenul promis nu poate fi în trecut.");
  }
  if (esteLucrareAsigurare && detaliiPreluare.tipPlata !== "Asigurare") {
    mesajeBlocare.push(
      "Pentru lucrările pe asigurare, tipul de plată trebuie să fie Asigurare.",
    );
  }
  if (!esteLucrareAsigurare && detaliiPreluare.tipPlata === "Asigurare") {
    mesajeBlocare.push(
      "Activează fluxul de daună dacă plata este prin asigurare.",
    );
  }
  if (!suntPozitiiValide(pozitiiDraft)) {
    mesajeBlocare.push(
      "Completează toate pozițiile și selectează articole din catalog.",
    );
  }
  if (!dosarValid) {
    mesajeBlocare.push("Completează corect datele dosarului de daună.");
  }

  const mesajeAvertizare: string[] = [];
  if (pozitiiDraft.some((pozitie) => !pozitie.disponibilitateStoc)) {
    // Lipsa de stoc nu blochează deschiderea comenzii,
    // dar este important să semnalăm riscul din timp.
    mesajeAvertizare.push(
      "Există poziții fără stoc local. Comanda poate fi salvată, dar va intra cel mai probabil în status Așteaptă piese.",
    );
  }

  if (
    esteLucrareAsigurare &&
    stareDosar.mod === "nou" &&
    esteNumarCompletat(stareDosar.sumaAprobata) &&
    stareDosar.sumaAprobata < totalEstimat
  ) {
    mesajeAvertizare.push(
      "Suma aprobată în dosar este mai mică decât devizul estimat și va necesita suplimentare.",
    );
  }

  return {
    dosarValid,
    mesajeAvertizare,
    mesajeBlocare,
    poateSalva: mesajeBlocare.length === 0,
  };
}
