import 'dotenv/config';
import {
  PrismaClient,
  TipClient,
  StatusGeneral,
  TipAngajat,
  TipPiesa,
  StatusFactura,
} from '@prisma/client';

// Folosim inițializarea clasică a Prisma
const prisma = new PrismaClient();

async function main() {
  console.log('Curățăm baza de date...');

  // Trebuie să ștergem și datele din tabelele noi adăugate anterior pentru a nu avea erori de Foreign Key
  await prisma.facturaItem.deleteMany();
  await prisma.factura.deleteMany();
  await prisma.comanda.deleteMany();
  await prisma.dosarDauna.deleteMany();
  await prisma.vehicul.deleteMany();

  // Ștergem tabelele originale
  await prisma.piesa.deleteMany();
  await prisma.manopera.deleteMany();
  await prisma.client.deleteMany();
  await prisma.angajat.deleteMany();
  await prisma.asigurator.deleteMany();

  console.log('Populăm baza de date...');

  // ─── ASIGURĂTORI ───
  await prisma.asigurator.createMany({
    data: [
      {
        denumire: 'Allianz-Țiriac Asigurări',
        CUI: 'RO6120740',
        nrRegCom: 'J40/15882/1994',
        telefon: '021 208 22 22',
        emailDaune: 'daune@allianztiriac.ro',
        IBAN: 'RO12INGB0000000000011111',
        termenPlataZile: 15,
        adresa: 'Str. Căderea Bastiliei 80-84, București',
        status: StatusGeneral.Activ,
      },
      {
        denumire: 'Groupama Asigurări',
        CUI: 'RO6291812',
        nrRegCom: 'J40/10504/1994',
        telefon: '021 302 92 00',
        emailDaune: 'avizari@groupama.ro',
        IBAN: 'RO99BRDE0000000000022222',
        termenPlataZile: 30,
        adresa: 'Str. Mihai Eminescu 45, București',
        status: StatusGeneral.Activ,
      },
      {
        denumire: 'Omniasig Vienna Insurance Group',
        CUI: 'RO5587260',
        nrRegCom: 'J40/10454/2001',
        telefon: '021 405 74 20',
        emailDaune: 'office@omniasig.ro',
        IBAN: 'RO45BTRL0000000000033333',
        termenPlataZile: 45,
        adresa: 'Aleea Alexandru 51, București',
        status: StatusGeneral.Activ,
      },
      {
        denumire: 'Asirom Vienna Insurance Group',
        CUI: 'RO336290',
        nrRegCom: 'J40/314/1991',
        telefon: '021 9146',
        emailDaune: 'avizare.daune@asirom.ro',
        IBAN: 'RO88BCR00000000000004444',
        termenPlataZile: 30,
        adresa: 'B-dul Carol I nr. 31-33, București',
        status: StatusGeneral.Activ,
      },
      {
        denumire: 'Generali România',
        CUI: 'RO2884407',
        nrRegCom: 'J40/17484/2007',
        telefon: '021 312 36 35',
        emailDaune: 'daune.ro@generali.com',
        IBAN: 'RO22RZBR0000000000055555',
        termenPlataZile: 15,
        adresa: 'Piața Charles de Gaulle 15, București',
        status: StatusGeneral.Activ,
      },
    ],
  });
  console.log('✅ Asigurători inserați');

  // ─── ANGAJAȚI ───
  await prisma.angajat.createMany({
    data: [
      {
        nume: 'Ionescu',
        prenume: 'Mihai',
        CNP: '1820101223344',
        telefon: '0721 100 201',
        email: 'mihai.ionescu@serviceautog.ro',
        tipAngajat: TipAngajat.Mecanic,
        specializare: 'Mecanică generală',
        costOrar: 170,
        status: StatusGeneral.Activ,
      },
      {
        nume: 'Popa',
        prenume: 'Andrei',
        CNP: '1840615223344',
        telefon: '0721 100 202',
        email: 'andrei.popa@serviceautog.ro',
        tipAngajat: TipAngajat.Mecanic,
        specializare: 'Tinichigerie și vopsitorie',
        costOrar: 210,
        status: StatusGeneral.Activ,
      },
      {
        nume: 'Marin',
        prenume: 'Elena',
        CNP: '2860226223344',
        telefon: '0721 100 203',
        email: 'elena.marin@serviceautog.ro',
        tipAngajat: TipAngajat.Receptioner,
        nrBirou: 'R-02',
        tura: 'Dimineață',
        status: StatusGeneral.Activ,
      },
      {
        nume: 'Dumitrescu',
        prenume: 'Sorin',
        CNP: '1811111223344',
        telefon: '0721 100 204',
        email: 'sorin.dumitrescu@serviceautog.ro',
        tipAngajat: TipAngajat.Manager,
        departament: 'Operațional',
        sporConducere: 1500,
        status: StatusGeneral.Activ,
      },
      {
        nume: 'Neagu',
        prenume: 'Alexandra',
        CNP: '2890305223344',
        telefon: '0721 100 205',
        email: 'alexandra.neagu@serviceautog.ro',
        tipAngajat: TipAngajat.Mecanic,
        specializare: 'Electrică și AC',
        costOrar: 230,
        status: StatusGeneral.Activ,
      },
      {
        nume: 'Stoica',
        prenume: 'Lucian',
        CNP: '1791215223344',
        telefon: '0721 100 206',
        email: 'lucian.stoica@serviceautog.ro',
        tipAngajat: TipAngajat.Mecanic,
        specializare: 'Vehicule comerciale și direcție',
        costOrar: 240,
        status: StatusGeneral.Activ,
      },
      {
        nume: 'Radu',
        prenume: 'Ioana',
        CNP: '2920707223344',
        telefon: '0721 100 207',
        email: 'ioana.radu@serviceautog.ro',
        tipAngajat: TipAngajat.Receptioner,
        nrBirou: 'R-01',
        tura: 'După-amiază',
        status: StatusGeneral.Activ,
      },
    ],
  });
  console.log('✅ Angajați inserați');

  // ─── CLIENȚI ───
  await prisma.client.createMany({
    data: [
      {
        tipClient: TipClient.PF,
        nume: 'Popescu',
        prenume: 'Ion',
        telefon: '0722 445 781',
        email: 'ion.popescu@gmail.com',
        adresa: 'Str. Păcurari 18, Iași',
        CNP: '1800101223344',
        serieCI: 'MX123456',
        status: StatusGeneral.Activ,
      },
      {
        tipClient: TipClient.PJ,
        nume: 'SC Auto Fleet SRL',
        telefon: '021 440 55 90',
        email: 'service@autofleet.ro',
        adresa: 'Bd. Timișoara 101, București',
        soldDebitor: 1550,
        CUI: 'RO9876543',
        IBAN: 'RO49AAAA1B31007593840000',
        nrRegCom: 'J40/1234/2018',
        status: StatusGeneral.Activ,
      },
      {
        tipClient: TipClient.PF,
        nume: 'Marinescu',
        prenume: 'Ana',
        telefon: '0744 118 620',
        email: 'ana.marinescu@yahoo.com',
        adresa: 'Str. Observatorului 74, Cluj-Napoca',
        CNP: '2870306123456',
        serieCI: 'CJ654321',
        status: StatusGeneral.Activ,
      },
      {
        tipClient: TipClient.PJ,
        nume: 'Tehnoparts Solutions',
        telefon: '031 808 44 12',
        email: 'office@tehnoparts.ro',
        adresa: 'Șos. Industriilor 22, București',
        soldDebitor: 4200,
        CUI: 'RO44556677',
        nrRegCom: 'J40/7788/2016',
        status: StatusGeneral.Activ,
      },
      {
        tipClient: TipClient.PF,
        nume: 'Ilie',
        prenume: 'Marius',
        telefon: '0733 905 118',
        email: 'marius.ilie@gmail.com',
        adresa: 'Str. Romană 11, Piatra-Neamț',
        soldDebitor: 380,
        CNP: '1900714223345',
        serieCI: 'NT778899',
        status: StatusGeneral.Inactiv,
      },
      {
        tipClient: TipClient.PJ,
        nume: 'Nord Logistic Fleet',
        telefon: '0264 401 118',
        email: 'contabilitate@nordfleet.ro',
        adresa: 'Str. Fabricii 9, Cluj-Napoca',
        soldDebitor: 2840,
        CUI: 'RO30112244',
        nrRegCom: 'J12/4401/2017',
        status: StatusGeneral.Activ,
      },
      {
        tipClient: TipClient.PF,
        nume: 'Vasilescu',
        prenume: 'Roxana',
        telefon: '0755 320 884',
        email: 'roxana.vasilescu@gmail.com',
        adresa: 'Str. Lalelelor 14, Brașov',
        CNP: '2920415223344',
        serieCI: 'BV445566',
        status: StatusGeneral.Activ,
      },
      {
        tipClient: TipClient.PJ,
        nume: 'Construct Fleet Management SRL',
        telefon: '031 999 12 12',
        email: 'claims@constructfleet.ro',
        adresa: 'Splaiul Unirii 198, București',
        soldDebitor: 6120,
        CUI: 'RO50887712',
        IBAN: 'RO11BTRL0000000000066666',
        nrRegCom: 'J40/9012/2020',
        status: StatusGeneral.Activ,
      },
    ],
  });
  console.log('✅ Clienți inserați');

  // ─── CATALOG: PIESE ───
  await prisma.piesa.createMany({
    data: [
      {
        codPiesa: 'FIL-UL-BOSCH',
        denumire: 'Filtru Ulei',
        producator: 'Bosch',
        categorie: 'Filtre',
        pretBaza: 45.5,
        stoc: 24,
        tip: TipPiesa.NOUA,
        luniGarantie: 12,
      },
      {
        codPiesa: 'ALT-VW-GOLF',
        denumire: 'Alternator 140A',
        producator: 'Valeo',
        categorie: 'Electrice',
        pretBaza: 350,
        stoc: 0,
        tip: TipPiesa.SH,
        gradUzura: 'Ușor uzat',
      },
      {
        codPiesa: 'PL-FR-RCL',
        denumire: 'Set Plăcuțe Frână Față',
        producator: 'ATE',
        categorie: 'Frânare',
        pretBaza: 265,
        stoc: 5,
        tip: TipPiesa.NOUA,
        luniGarantie: 24,
      },
      {
        codPiesa: 'DISC-FR-RCL',
        denumire: 'Disc Frână Ventilat',
        producator: 'Textar',
        categorie: 'Frânare',
        pretBaza: 410,
        stoc: 12,
        tip: TipPiesa.NOUA,
        luniGarantie: 24,
      },
      {
        codPiesa: 'COMP-AC-FTR',
        denumire: 'Compresor AC',
        producator: 'Denso',
        categorie: 'Climatizare',
        pretBaza: 1980,
        stoc: 1,
        tip: TipPiesa.SH,
        gradUzura: 'Testat, uzură medie',
      },
      {
        codPiesa: 'BAT-70AH-VAR',
        denumire: 'Baterie 70Ah',
        producator: 'Varta',
        categorie: 'Electrice',
        pretBaza: 540,
        stoc: 8,
        tip: TipPiesa.NOUA,
        luniGarantie: 18,
      },
      {
        codPiesa: 'FIL-AER-MANN',
        denumire: 'Filtru Aer Motor',
        producator: 'MANN',
        categorie: 'Filtre',
        pretBaza: 58,
        stoc: 18,
        tip: TipPiesa.NOUA,
        luniGarantie: 12,
      },
      {
        codPiesa: 'FIL-CAB-HENG',
        denumire: 'Filtru Habitaclu Carbon',
        producator: 'Hengst',
        categorie: 'Filtre',
        pretBaza: 72,
        stoc: 16,
        tip: TipPiesa.NOUA,
        luniGarantie: 12,
      },
      {
        codPiesa: 'AMORT-FATA-SAC',
        denumire: 'Amortizor Față',
        producator: 'Sachs',
        categorie: 'Suspensie & Direcție',
        pretBaza: 385,
        stoc: 7,
        tip: TipPiesa.NOUA,
        luniGarantie: 24,
      },
      {
        codPiesa: 'BARA-F-SKO',
        denumire: 'Bară Față Skoda Octavia',
        producator: 'OE Skoda',
        categorie: 'Caroserie',
        pretBaza: 1820,
        stoc: 2,
        tip: TipPiesa.NOUA,
        luniGarantie: 24,
      },
      {
        codPiesa: 'FAR-ST-SKO',
        denumire: 'Far Stânga Skoda Octavia',
        producator: 'Hella',
        categorie: 'Electrice',
        pretBaza: 640,
        stoc: 4,
        tip: TipPiesa.NOUA,
        luniGarantie: 24,
      },
      {
        codPiesa: 'PARBR-MB-SPR',
        denumire: 'Parbriz Mercedes Sprinter',
        producator: 'Pilkington',
        categorie: 'Caroserie',
        pretBaza: 1280,
        stoc: 1,
        tip: TipPiesa.NOUA,
        luniGarantie: 12,
      },
      {
        codPiesa: 'BASC-MB-SPR',
        denumire: 'Basculă Față Mercedes Sprinter',
        producator: 'Lemforder',
        categorie: 'Suspensie & Direcție',
        pretBaza: 760,
        stoc: 3,
        tip: TipPiesa.NOUA,
        luniGarantie: 24,
      },
    ],
  });
  console.log('✅ Piese inserate');

  // ─── CATALOG: MANOPERĂ ───
  await prisma.manopera.createMany({
    data: [
      {
        codManopera: 'MAN-SCHIMB-ULEI',
        denumire: 'Schimb Ulei și Filtre',
        categorie: 'Mecanică Ușoară',
        durataStd: 0.5,
      },
      {
        codManopera: 'MAN-DISTRIBUTIE',
        denumire: 'Înlocuire Kit Distribuție',
        categorie: 'Mecanică Grea',
        durataStd: 4.0,
      },
      {
        codManopera: 'MAN-DIAGNOZA',
        denumire: 'Diagnoză Computerizată',
        categorie: 'Diagnoză',
        durataStd: 1.0,
      },
      {
        codManopera: 'MAN-FRANE-FATA',
        denumire: 'Înlocuire Plăcuțe și Discuri Față',
        categorie: 'Mecanică Ușoară',
        durataStd: 2.0,
      },
      {
        codManopera: 'MAN-TINICHIGERIE-ELEM',
        denumire: 'Vopsit și Îndreptat Element',
        categorie: 'Tinichigerie',
        durataStd: 5.5,
      },
      {
        codManopera: 'MAN-SERVICE-AC',
        denumire: 'Revizie și Încărcare Freon',
        categorie: 'Electrică',
        durataStd: 1.8,
      },
      {
        codManopera: 'MAN-REVIZIE-ANUALA',
        denumire: 'Revizie Anuală Completă',
        categorie: 'Mecanică Ușoară',
        durataStd: 1.5,
      },
      {
        codManopera: 'MAN-SCHIMB-AMORT',
        denumire: 'Înlocuire Amortizoare Față',
        categorie: 'Mecanică Ușoară',
        durataStd: 2.6,
      },
      {
        codManopera: 'MAN-PARBRIZ',
        denumire: 'Înlocuire Parbriz și Calibrare Senzori',
        categorie: 'Caroserie',
        durataStd: 3.0,
        pretOra: 260,
      },
      {
        codManopera: 'MAN-DIRECTIE',
        denumire: 'Verificare și Reglaj Direcție',
        categorie: 'Suspensie & Direcție',
        durataStd: 1.2,
        pretOra: 220,
      },
    ],
  });
  console.log('✅ Manopere inserate');

  const clienti = await prisma.client.findMany();
  const angajati = await prisma.angajat.findMany();
  const asiguratori = await prisma.asigurator.findMany();

  function getRequired<K, V>(map: Map<K, V>, key: K, label: string): V {
    const value = map.get(key);
    if (!value) {
      throw new Error(`Seed data missing ${label}: ${String(key)}`);
    }
    return value;
  }

  const clientByCnp = new Map(
    clienti.flatMap((client) => (client.CNP ? [[client.CNP, client]] : [])),
  );
  const clientByCui = new Map(
    clienti.flatMap((client) => (client.CUI ? [[client.CUI, client]] : [])),
  );
  const angajatByCnp = new Map(
    angajati.map((angajat) => [angajat.CNP, angajat]),
  );
  const asiguratorByCui = new Map(
    asiguratori.map((asigurator) => [asigurator.CUI, asigurator]),
  );

  const popescu = getRequired(clientByCnp, '1800101223344', 'client CNP');
  const autoFleet = getRequired(clientByCui, 'RO9876543', 'client CUI');
  const marinescu = getRequired(clientByCnp, '2870306123456', 'client CNP');
  const tehnoparts = getRequired(clientByCui, 'RO44556677', 'client CUI');
  const ilie = getRequired(clientByCnp, '1900714223345', 'client CNP');
  const nordFleet = getRequired(clientByCui, 'RO30112244', 'client CUI');
  const vasilescu = getRequired(clientByCnp, '2920415223344', 'client CNP');
  const constructFleet = getRequired(clientByCui, 'RO50887712', 'client CUI');

  // ─── OPERAȚIONAL: VEHICULE ───
  await prisma.vehicul.createMany({
    data: [
      {
        numarInmatriculare: 'IS-09-SAG',
        marca: 'Dacia',
        model: 'Logan',
        vin: 'UU1LSDL4H60512345',
        idClient: popescu.idClient,
        status: StatusGeneral.Activ,
      },
      {
        numarInmatriculare: 'B-54-GAR',
        marca: 'Skoda',
        model: 'Octavia',
        vin: 'TMBJR7NX1MY102468',
        idClient: autoFleet.idClient,
        status: StatusGeneral.Activ,
      },
      {
        numarInmatriculare: 'CJ-12-AUT',
        marca: 'Volkswagen',
        model: 'Golf',
        vin: 'WVWZZZAUZFW223344',
        idClient: marinescu.idClient,
        status: StatusGeneral.Activ,
      },
      {
        numarInmatriculare: 'B-88-TPD',
        marca: 'Ford',
        model: 'Transit Custom',
        vin: 'WF0YXXTTGYLK55129',
        idClient: tehnoparts.idClient,
        status: StatusGeneral.Activ,
      },
      {
        numarInmatriculare: 'NT-07-MIL',
        marca: 'Renault',
        model: 'Clio',
        vin: 'VF15R980H63218457',
        idClient: ilie.idClient,
        status: StatusGeneral.Inactiv,
      },
      {
        numarInmatriculare: 'CJ-44-NLF',
        marca: 'Toyota',
        model: 'Proace City',
        vin: 'YAREFYHZ2GJ118903',
        idClient: nordFleet.idClient,
        status: StatusGeneral.Activ,
      },
      {
        numarInmatriculare: 'BV-21-RXV',
        marca: 'Hyundai',
        model: 'i30',
        vin: 'TMAD351UAGJ452187',
        idClient: vasilescu.idClient,
        status: StatusGeneral.Activ,
      },
      {
        numarInmatriculare: 'B-901-CFM',
        marca: 'Mercedes-Benz',
        model: 'Sprinter',
        vin: 'WDB9076331P441207',
        idClient: constructFleet.idClient,
        status: StatusGeneral.Activ,
      },
    ],
  });
  console.log('✅ Vehicule inserate');

  const vehicule = await prisma.vehicul.findMany();
  const vehiculByNr = new Map(
    vehicule.map((vehicul) => [vehicul.numarInmatriculare, vehicul]),
  );

  // ─── OPERAȚIONAL: DOSARE DAUNĂ ───
  await prisma.dosarDauna.createMany({
    data: [
      {
        numarDosar: 'DAUNA-2026-001',
        idClient: autoFleet.idClient,
        idVehicul: getRequired(vehiculByNr, 'B-54-GAR', 'vehicul').idVehicul,
        idAsigurator: getRequired(asiguratorByCui, 'RO6120740', 'asigurator')
          .idAsigurator,
        status: StatusGeneral.Activ,
      },
      {
        numarDosar: 'DAUNA-2026-002',
        idClient: marinescu.idClient,
        idVehicul: getRequired(vehiculByNr, 'CJ-12-AUT', 'vehicul').idVehicul,
        idAsigurator: getRequired(asiguratorByCui, 'RO5587260', 'asigurator')
          .idAsigurator,
        status: StatusGeneral.Activ,
      },
      {
        numarDosar: 'DAUNA-2026-003',
        idClient: tehnoparts.idClient,
        idVehicul: getRequired(vehiculByNr, 'B-88-TPD', 'vehicul').idVehicul,
        idAsigurator: getRequired(asiguratorByCui, 'RO336290', 'asigurator')
          .idAsigurator,
        status: StatusGeneral.Activ,
      },
      {
        numarDosar: 'DAUNA-2026-004',
        idClient: nordFleet.idClient,
        idVehicul: getRequired(vehiculByNr, 'CJ-44-NLF', 'vehicul').idVehicul,
        idAsigurator: getRequired(asiguratorByCui, 'RO6291812', 'asigurator')
          .idAsigurator,
        status: StatusGeneral.Activ,
      },
      {
        numarDosar: 'DAUNA-2026-005',
        idClient: constructFleet.idClient,
        idVehicul: getRequired(vehiculByNr, 'B-901-CFM', 'vehicul').idVehicul,
        idAsigurator: getRequired(asiguratorByCui, 'RO2884407', 'asigurator')
          .idAsigurator,
        status: StatusGeneral.Activ,
      },
    ],
  });
  console.log('✅ Dosare daună inserate');

  const dosare = await prisma.dosarDauna.findMany();
  const dosarByNumar = new Map(
    dosare.map((dosar) => [dosar.numarDosar, dosar]),
  );

  // ─── OPERAȚIONAL: COMENZI ───
  await prisma.comanda.createMany({
    data: [
      {
        numarComanda: 'CMD-2026-001',
        idDosar: null,
        idAngajat: getRequired(angajatByCnp, '1820101223344', 'angajat')
          .idAngajat,
        dataPreconizata: new Date('2026-05-13T15:00:00'),
        status: StatusGeneral.Activ,
      },
      {
        numarComanda: 'CMD-2026-002',
        idDosar: getRequired(dosarByNumar, 'DAUNA-2026-001', 'dosar').idDosar,
        idAngajat: getRequired(angajatByCnp, '1840615223344', 'angajat')
          .idAngajat,
        dataPreconizata: new Date('2026-05-15T16:30:00'),
        status: StatusGeneral.Activ,
      },
      {
        numarComanda: 'CMD-2026-003',
        idDosar: getRequired(dosarByNumar, 'DAUNA-2026-002', 'dosar').idDosar,
        idAngajat: getRequired(angajatByCnp, '2890305223344', 'angajat')
          .idAngajat,
        dataPreconizata: new Date('2026-05-14T12:00:00'),
        status: StatusGeneral.Activ,
      },
      {
        numarComanda: 'CMD-2026-004',
        idDosar: getRequired(dosarByNumar, 'DAUNA-2026-003', 'dosar').idDosar,
        idAngajat: getRequired(angajatByCnp, '2890305223344', 'angajat')
          .idAngajat,
        dataPreconizata: new Date('2026-05-11T17:00:00'),
        status: StatusGeneral.Activ,
      },
      {
        numarComanda: 'CMD-2026-005',
        idDosar: getRequired(dosarByNumar, 'DAUNA-2026-005', 'dosar').idDosar,
        idAngajat: getRequired(angajatByCnp, '1791215223344', 'angajat')
          .idAngajat,
        dataPreconizata: new Date('2026-05-16T17:00:00'),
        status: StatusGeneral.Activ,
      },
      {
        numarComanda: 'CMD-2026-006',
        idDosar: null,
        idAngajat: getRequired(angajatByCnp, '1820101223344', 'angajat')
          .idAngajat,
        dataPreconizata: new Date('2026-05-10T10:30:00'),
        status: StatusGeneral.Inactiv,
      },
    ],
  });
  console.log('✅ Comenzi inserate');

  const comenzi = await prisma.comanda.findMany();
  const comandaByNumar = new Map(
    comenzi.map((comanda) => [comanda.numarComanda, comanda]),
  );

  // ─── FACTURARE: FACTURI ȘI ITEME ───
  await prisma.factura.create({
    data: {
      serie: 'SAG',
      numar: 2026001,
      idClient: popescu.idClient,
      idComanda: getRequired(comandaByNumar, 'CMD-2026-001', 'comanda')
        .idComanda,
      scadenta: new Date('2026-05-22T00:00:00'),
      status: StatusFactura.Emisa,
      totalFaraTVA: 610,
      tva: 115.9,
      totalGeneral: 725.9,
      iteme: {
        create: [
          {
            descriere: 'Ulei motor 5W30',
            cantitate: 4,
            pretUnitar: 58,
            cotaTva: 19,
          },
          {
            descriere: 'Filtru ulei',
            cantitate: 1,
            pretUnitar: 95,
            cotaTva: 19,
          },
          {
            descriere: 'Schimb ulei și filtre',
            cantitate: 1,
            pretUnitar: 283,
            cotaTva: 19,
          },
        ],
      },
    },
  });

  await prisma.factura.create({
    data: {
      serie: 'SAG',
      numar: 2026002,
      idClient: tehnoparts.idClient,
      idComanda: getRequired(comandaByNumar, 'CMD-2026-004', 'comanda')
        .idComanda,
      scadenta: new Date('2026-05-25T00:00:00'),
      status: StatusFactura.Platita,
      totalFaraTVA: 2944,
      tva: 559.36,
      totalGeneral: 3503.36,
      iteme: {
        create: [
          {
            descriere: 'Compresor AC Ford Transit',
            cantitate: 1,
            pretUnitar: 1980,
            cotaTva: 19,
          },
          {
            descriere: 'Revizie și încărcare freon',
            cantitate: 2,
            pretUnitar: 230,
            cotaTva: 19,
          },
          {
            descriere: 'Diagnoză computerizată',
            cantitate: 1,
            pretUnitar: 190,
            cotaTva: 19,
          },
          {
            descriere: 'Baterie 70Ah',
            cantitate: 1,
            pretUnitar: 314,
            cotaTva: 19,
          },
        ],
      },
    },
  });

  await prisma.factura.create({
    data: {
      serie: 'SAG',
      numar: 2026003,
      idClient: constructFleet.idClient,
      idComanda: getRequired(comandaByNumar, 'CMD-2026-005', 'comanda')
        .idComanda,
      scadenta: new Date('2026-06-01T00:00:00'),
      status: StatusFactura.Emisa,
      totalFaraTVA: 2820,
      tva: 535.8,
      totalGeneral: 3355.8,
      iteme: {
        create: [
          {
            descriere: 'Parbriz Mercedes Sprinter',
            cantitate: 1,
            pretUnitar: 1280,
            cotaTva: 19,
          },
          {
            descriere: 'Basculă față Mercedes Sprinter',
            cantitate: 1,
            pretUnitar: 760,
            cotaTva: 19,
          },
          {
            descriere: 'Înlocuire parbriz și calibrare senzori',
            cantitate: 3,
            pretUnitar: 260,
            cotaTva: 19,
          },
        ],
      },
    },
  });
  console.log('✅ Facturi și iteme inserate');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
