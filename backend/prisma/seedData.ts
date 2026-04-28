import 'dotenv/config';
import { PrismaClient, TipClient, StatusGeneral, TipAngajat, TipPiesa } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Curățăm baza de date...');
  // Ștergem tot pentru a nu avea duplicate la rulări multiple
  await prisma.piesa.deleteMany();
  await prisma.manopera.deleteMany();
  await prisma.client.deleteMany();
  await prisma.angajat.deleteMany();
  await prisma.asigurator.deleteMany();

  console.log('Populăm baza de date...');

  // ─── ASIGURĂTORI ───
  await prisma.asigurator.createMany({
    data: [
      { denumire: "Allianz-Țiriac Asigurări", CUI: "RO6120740", telefon: "021 208 22 22", status: StatusGeneral.Activ },
      { denumire: "Groupama Asigurări", CUI: "RO6291812", telefon: "021 302 92 00", status: StatusGeneral.Activ },
      { denumire: "Omniasig Vienna Insurance Group", CUI: "RO5587260", telefon: "021 405 74 20", status: StatusGeneral.Activ },
      { denumire: "Asirom Vienna Insurance Group", CUI: "RO336290", telefon: "021 9146", status: StatusGeneral.Activ },
      { denumire: "Generali România", CUI: "RO2884407", telefon: "021 312 36 35", status: StatusGeneral.Activ },
    ]
  });
  console.log('✅ Asigurători inserați');

  // ─── ANGAJAȚI ───
  await prisma.angajat.createMany({
    data: [
      { nume: "Ionescu", prenume: "Mihai", CNP: "1820101223344", telefon: "0721 100 201", email: "mihai.ionescu@serviceautog.ro", tipAngajat: TipAngajat.Mecanic, specializare: "Mecanică generală", costOrar: 170, status: StatusGeneral.Activ },
      { nume: "Popa", prenume: "Andrei", CNP: "1840615223344", telefon: "0721 100 202", email: "andrei.popa@serviceautog.ro", tipAngajat: TipAngajat.Mecanic, specializare: "Tinichigerie și vopsitorie", costOrar: 210, status: StatusGeneral.Activ },
      { nume: "Marin", prenume: "Elena", CNP: "2860226223344", telefon: "0721 100 203", email: "elena.marin@serviceautog.ro", tipAngajat: TipAngajat.Receptioner, nrBirou: "R-02", tura: "Dimineață", status: StatusGeneral.Activ },
      { nume: "Dumitrescu", prenume: "Sorin", CNP: "1811111223344", telefon: "0721 100 204", email: "sorin.dumitrescu@serviceautog.ro", tipAngajat: TipAngajat.Manager, departament: "Operațional", sporConducere: 1500, status: StatusGeneral.Activ },
      { nume: "Neagu", prenume: "Alexandra", CNP: "2890305223344", telefon: "0721 100 205", email: "alexandra.neagu@serviceautog.ro", tipAngajat: TipAngajat.Mecanic, specializare: "Electrică și AC", costOrar: 230, status: StatusGeneral.Activ },
    ]
  });
  console.log('✅ Angajați inserați');

  // ─── CLIENȚI ───
  await prisma.client.createMany({
    data: [
      { tipClient: TipClient.PF, nume: "Popescu", prenume: "Ion", telefon: "0722 445 781", email: "ion.popescu@gmail.com", adresa: "Str. Păcurari 18, Iași", CNP: "1800101223344", serieCI: "MX123456", status: StatusGeneral.Activ },
      { tipClient: TipClient.PJ, nume: "SC Auto Fleet SRL", telefon: "021 440 55 90", email: "service@autofleet.ro", adresa: "Bd. Timișoara 101, București", soldDebitor: 1550, CUI: "RO9876543", IBAN: "RO49AAAA1B31007593840000", nrRegCom: "J40/1234/2018", status: StatusGeneral.Activ },
      { tipClient: TipClient.PF, nume: "Marinescu", prenume: "Ana", telefon: "0744 118 620", email: "ana.marinescu@yahoo.com", adresa: "Str. Observatorului 74, Cluj-Napoca", CNP: "2870306123456", serieCI: "CJ654321", status: StatusGeneral.Activ },
      { tipClient: TipClient.PJ, nume: "Tehnoparts Solutions", telefon: "031 808 44 12", email: "office@tehnoparts.ro", adresa: "Șos. Industriilor 22, București", soldDebitor: 4200, CUI: "RO44556677", nrRegCom: "J40/7788/2016", status: StatusGeneral.Activ },
      { tipClient: TipClient.PF, nume: "Ilie", prenume: "Marius", telefon: "0733 905 118", email: "marius.ilie@gmail.com", adresa: "Str. Romană 11, Piatra-Neamț", soldDebitor: 380, CNP: "1900714223345", serieCI: "NT778899", status: StatusGeneral.Inactiv },
      { tipClient: TipClient.PJ, nume: "Nord Logistic Fleet", telefon: "0264 401 118", email: "contabilitate@nordfleet.ro", adresa: "Str. Fabricii 9, Cluj-Napoca", soldDebitor: 2840, CUI: "RO30112244", nrRegCom: "J12/4401/2017", status: StatusGeneral.Activ },
    ]
  });
  console.log('✅ Clienți inserați');

  // ─── CATALOG: PIESE ───
  await prisma.piesa.createMany({
    data: [
      { codPiesa: "FIL-UL-BOSCH", denumire: "Filtru Ulei", producator: "Bosch", categorie: "Filtre", pretBaza: 45.5, stoc: 24, tip: TipPiesa.NOUA, luniGarantie: 12 },
      { codPiesa: "ALT-VW-GOLF", denumire: "Alternator 140A", producator: "Valeo", categorie: "Electrice", pretBaza: 350, stoc: 0, tip: TipPiesa.SH, gradUzura: "Ușor uzat" },
      { codPiesa: "PL-FR-RCL", denumire: "Set Plăcuțe Frână Față", producator: "ATE", categorie: "Frânare", pretBaza: 265, stoc: 5, tip: TipPiesa.NOUA, luniGarantie: 24 },
      { codPiesa: "DISC-FR-RCL", denumire: "Disc Frână Ventilat", producator: "Textar", categorie: "Frânare", pretBaza: 410, stoc: 12, tip: TipPiesa.NOUA, luniGarantie: 24 },
      { codPiesa: "COMP-AC-FTR", denumire: "Compresor AC", producator: "Denso", categorie: "Climatizare", pretBaza: 1980, stoc: 1, tip: TipPiesa.SH, gradUzura: "Testat, uzură medie" },
      { codPiesa: "BAT-70AH-VAR", denumire: "Baterie 70Ah", producator: "Varta", categorie: "Electrice", pretBaza: 540, stoc: 8, tip: TipPiesa.NOUA, luniGarantie: 18 },
      { codPiesa: "FIL-AER-MANN", denumire: "Filtru Aer Motor", producator: "MANN", categorie: "Filtre", pretBaza: 58, stoc: 18, tip: TipPiesa.NOUA, luniGarantie: 12 },
      { codPiesa: "FIL-CAB-HENG", denumire: "Filtru Habitaclu Carbon", producator: "Hengst", categorie: "Filtre", pretBaza: 72, stoc: 16, tip: TipPiesa.NOUA, luniGarantie: 12 },
      { codPiesa: "AMORT-FATA-SAC", denumire: "Amortizor Față", producator: "Sachs", categorie: "Suspensie & Direcție", pretBaza: 385, stoc: 7, tip: TipPiesa.NOUA, luniGarantie: 24 },
    ]
  });
  console.log('✅ Piese inserate');

  // ─── CATALOG: MANOPERĂ ───
  await prisma.manopera.createMany({
    data: [
      { codManopera: "MAN-SCHIMB-ULEI", denumire: "Schimb Ulei și Filtre", categorie: "Mecanică Ușoară", durataStd: 0.5 },
      { codManopera: "MAN-DISTRIBUTIE", denumire: "Înlocuire Kit Distribuție", categorie: "Mecanică Grea", durataStd: 4.0 },
      { codManopera: "MAN-DIAGNOZA", denumire: "Diagnoză Computerizată", categorie: "Diagnoză", durataStd: 1.0 },
      { codManopera: "MAN-FRANE-FATA", denumire: "Înlocuire Plăcuțe și Discuri Față", categorie: "Mecanică Ușoară", durataStd: 2.0 },
      { codManopera: "MAN-TINICHIGERIE-ELEM", denumire: "Vopsit și Îndreptat Element", categorie: "Tinichigerie", durataStd: 5.5 },
      { codManopera: "MAN-SERVICE-AC", denumire: "Revizie și Încărcare Freon", categorie: "Electrică", durataStd: 1.8 },
      { codManopera: "MAN-REVIZIE-ANUALA", denumire: "Revizie Anuală Completă", categorie: "Mecanică Ușoară", durataStd: 1.5 },
      { codManopera: "MAN-SCHIMB-AMORT", denumire: "Înlocuire Amortizoare Față", categorie: "Mecanică Ușoară", durataStd: 2.6 },
    ]
  });
  console.log('✅ Manopere inserate');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    // Terminăm procesul pool-ului de conexiuni
    await pool.end();
  });