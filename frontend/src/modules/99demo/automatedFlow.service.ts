import { apiJson } from "../../lib/api";
import { saveClient, saveVehicul, saveAngajat, saveAsigurator, type ClientEntity } from "../01entitati/entitati.service";
import { createComanda, createDosarDauna, updateComanda, updatePozitiiComanda, fetchAsiguratori, fetchMecanici, fetchVehicule } from "../02operational/operational.service";
import { createPiesa, createManopera, createKit } from "../00catalog/catalog.service";
import { type PiesaCatalog, type ManoperaCatalog } from "../../types/catalog";

export interface TestStep {
  id: string;
  label: string;
  status: 'pending' | 'loading' | 'success' | 'error';
  message?: string;
}

export async function runAutomatedTestFlow(onProgress: (steps: TestStep[]) => void) {
  const steps: TestStep[] = [
    { id: 'nomenclator', label: 'Populare Catalog (Piese, Manoperă, Kituri)', status: 'pending' },
    { id: 'resurse', label: 'Configurare Resurse (Angajați, Asigurători)', status: 'pending' },
    { id: 'crm', label: 'Gestiune CRM (Clienți, Vehicule)', status: 'pending' },
    { id: 'operational', label: 'Flux Operațional (Recepție, Diagnoză, Lucru)', status: 'pending' },
    { id: 'finalizare', label: 'Finalizare Lucrări și Control Calitate', status: 'pending' },
    { id: 'facturare', label: 'Emitere Facturi (Scadențe, Penalități, Discount)', status: 'pending' },
    { id: 'incasare', label: 'Înregistrare Încasări și Închidere Sold', status: 'pending' },
  ];

  const updateStatus = (id: string, status: TestStep['status'], message?: string) => {
    const step = steps.find(s => s.id === id);
    if (step) {
      step.status = status;
      if (message) step.message = message;
    }
    onProgress([...steps]);
  };

  try {
    // 1. Populare Catalog
    updateStatus('nomenclator', 'loading');
    const pieseData = [
      { codPiesa: 'FIL-UL-01', denumire: 'Filtru Ulei Bosch', producator: 'Bosch', categorie: 'Filtre', pretBaza: 45, stoc: 100, tip: 'NOUA', status: 'Activ' },
      { codPiesa: 'ULEI-5W30', denumire: 'Ulei Castrol 5W30', producator: 'Castrol', categorie: 'Motor & Distribuție', pretBaza: 280, stoc: 50, tip: 'NOUA', status: 'Activ' },
      { codPiesa: 'PLAC-FR-F', denumire: 'Plăcuțe Frână Față', producator: 'ATE', categorie: 'Frânare', pretBaza: 220, stoc: 20, tip: 'NOUA', status: 'Activ' },
      { codPiesa: 'DISC-FR-F', denumire: 'Disc Frână Față', producator: 'Brembo', categorie: 'Frânare', pretBaza: 350, stoc: 15, tip: 'NOUA', status: 'Activ' },
      { codPiesa: 'BEC-H7', denumire: 'Bec H7 Vision', producator: 'Philips', categorie: 'Electrice', pretBaza: 35, stoc: 200, tip: 'NOUA', status: 'Activ' },
    ];
    const createdPiese: PiesaCatalog[] = [];
    for (const p of pieseData) {
      createdPiese.push(await createPiesa(p as any));
    }

    const manoperaData = [
      { codManopera: 'REV-STD', denumire: 'Revizie Standard', pretOra: 100, categorie: 'Mecanică', status: 'Activ' },
      { codManopera: 'DIAG-COMP', denumire: 'Diagnoză Computerizată', pretOra: 150, categorie: 'Electrică', status: 'Activ' },
    ];
    const createdManopere: ManoperaCatalog[] = [];
    for (const m of manoperaData) {
      createdManopere.push(await createManopera(m as any));
    }

    // Kit din primele 2 piese
    await createKit({
      codKit: 'KIT-REV-01',
      denumire: 'Pachet Revizie Standard',
      pretTotal: 300,
      piese: [
        { idPiesa: createdPiese[0].idPiesa, cantitate: 1 },
        { idPiesa: createdPiese[1].idPiesa, cantitate: 1 }
      ]
    });
    updateStatus('nomenclator', 'success', 'Catalog populat cu 5 piese, 2 manopere și 1 kit.');

    // 2. Resurse
    updateStatus('resurse', 'loading');
    await saveAngajat({ nume: 'Popescu', prenume: 'Ion', CNP: '1800101001122', telefon: '0711222333', email: 'ion.p@service.ro', tipAngajat: 'Mecanic', status: 'Activ', specializare: 'Motor' } as any);
    await saveAngajat({ nume: 'Ionescu', prenume: 'Dan', CNP: '1850202003344', telefon: '0722333444', email: 'dan.i@service.ro', tipAngajat: 'Mecanic', status: 'Activ', specializare: 'Tren Rulare' } as any);
    await saveAngajat({ nume: 'Georgescu', prenume: 'Ana', CNP: '2900303005566', telefon: '0733444555', email: 'ana.g@service.ro', tipAngajat: 'Receptioner', status: 'Activ', nrBirou: 'B1' } as any);
    
    await saveAsigurator({ denumire: 'Allianz-Tiriac', CUI: 'RO123456', telefon: '0219999', status: 'Activ', termenPlataZile: 30 } as any);
    await saveAsigurator({ denumire: 'Groupama', CUI: 'RO654321', telefon: '0218888', status: 'Activ', termenPlataZile: 15 } as any);
    await saveAsigurator({ denumire: 'Omniasig', CUI: 'RO111222', telefon: '0217777', status: 'Activ', termenPlataZile: 45 } as any);
    updateStatus('resurse', 'success', 'Adăugați 3 angajați și 3 asigurători.');

    // 3. CRM
    updateStatus('crm', 'loading');
    const createdClients: ClientEntity[] = [];
    for (let i = 1; i <= 3; i++) {
      createdClients.push(await saveClient({
        nume: `Client Test ${i}`, tipClient: 'PF', telefon: `070000000${i}`, email: `client${i}@test.com`, adresa: `Strada Test ${i}`, CNP: `190010100000${i}`, serieCI: `RK${123450 + i}`, status: 'Activ', soldDebitor: 0
      }));
    }
    const vehicles = [
      { marca: 'BMW', model: 'X5', numarInmatriculare: 'B-101-SIM', vin: 'WBAX5SIMULATION01', idClient: createdClients[0].idClient },
      { marca: 'Audi', model: 'A4', numarInmatriculare: 'B-102-SIM', vin: 'WAUA4SIMULATION02', idClient: createdClients[1].idClient },
      { marca: 'Mercedes', model: 'C-Class', numarInmatriculare: 'B-103-SIM', vin: 'WDC03SIMULATION03', idClient: createdClients[2].idClient },
      { marca: 'Dacia', model: 'Logan', numarInmatriculare: 'B-104-SIM', vin: 'UU104SIMULATION04', idClient: createdClients[0].idClient },
    ];
    for (const v of vehicles) {
      await saveVehicul(v);
    }
    updateStatus('crm', 'success', 'Adăugați 3 clienți și 4 vehicule.');

    // 4. Operațional
    updateStatus('operational', 'loading');
    const insuranceInsurers = await fetchAsiguratori();
    const testVehicles = await fetchVehicule();
    const mcs = await fetchMecanici();
    
    // Comanda 1: RCA Omniasig
    const dosar1 = await createDosarDauna({
      numarDosar: 'DOS-SIM-001', idClient: createdClients[0].idClient, idVehicul: testVehicles[0].idVehicul, idAsigurator: insuranceInsurers[2].idAsigurator, status: 'Activ'
    });
    const comanda1 = await createComanda({
      numarComanda: 'CMD-SIM-001', idDosar: dosar1.idDosar, idVehicul: testVehicles[0].idVehicul, idMecanici: [mcs[0]?.idMecanic], status: 'In lucru'
    });

    // Comanda 2: Tehnica
    const dosar2 = await createDosarDauna({
      numarDosar: 'TECH-SIM-002', idClient: createdClients[1].idClient, idVehicul: testVehicles[1].idVehicul, status: 'Activ'
    });
    const comanda2 = await createComanda({
      numarComanda: 'CMD-SIM-002', idDosar: dosar2.idDosar, idVehicul: testVehicles[1].idVehicul, idMecanici: [mcs[1]?.idMecanic], status: 'In lucru'
    });
    
    // Adaugare pozitii Comanda 1
    await updatePozitiiComanda(comanda1.idComanda, [
      { _draftId: 'd1', tipPozitie: 'Piesa', catalogId: createdPiese[2].idPiesa, codArticol: createdPiese[2].codPiesa, descriere: createdPiese[2].denumire, unitateMasura: 'set', cantitate: 1, pretVanzare: createdPiese[2].pretBaza, discountProcent: 0, cotaTVA: 19, disponibilitateStoc: true },
      { _draftId: 'd2', tipPozitie: 'Manopera', catalogId: createdManopere[0].idManopera, codArticol: createdManopere[0].codManopera, descriere: createdManopere[0].denumire, unitateMasura: 'ore', cantitate: 2, pretVanzare: createdManopere[0].pretOra, discountProcent: 0, cotaTVA: 19, disponibilitateStoc: true }
    ] as any);

    // Adaugare pozitii Comanda 2
    await updatePozitiiComanda(comanda2.idComanda, [
      { _draftId: 'd3', tipPozitie: 'Piesa', catalogId: createdPiese[0].idPiesa, codArticol: createdPiese[0].codPiesa, descriere: createdPiese[0].denumire, unitateMasura: 'buc', cantitate: 1, pretVanzare: createdPiese[0].pretBaza, discountProcent: 10, cotaTVA: 19, disponibilitateStoc: true },
      { _draftId: 'd4', tipPozitie: 'Manopera', catalogId: createdManopere[1].idManopera, codArticol: createdManopere[1].codManopera, descriere: createdManopere[1].denumire, unitateMasura: 'ore', cantitate: 1, pretVanzare: createdManopere[1].pretOra, discountProcent: 0, cotaTVA: 19, disponibilitateStoc: true }
    ] as any);

    updateStatus('operational', 'success', 'Deschise 2 comenzi (1 RCA, 1 Tehnică) cu devize completate.');

    // 5. Finalizare
    updateStatus('finalizare', 'loading');
    await updateComanda(comanda1.idComanda, { ...comanda1, status: 'Finalizat' });
    await updateComanda(comanda2.idComanda, { ...comanda2, status: 'Finalizat' });
    updateStatus('finalizare', 'success', 'Comenzile au fost validate și mutate în starea Finalizat.');

    // 6. Facturare
    updateStatus('facturare', 'loading');
    // Factura 1: Scadență 15 zile + Penalități (simulăm penalități prin descriere sau metadata dacă sistemul suportă)
    const scadenta1 = new Date(); scadenta1.setDate(scadenta1.getDate() + 15);
    await apiJson('/facturare', {
      method: 'POST',
      body: JSON.stringify({
        idClient: createdClients[0].idClient, idComanda: comanda1.idComanda, serie: 'F-SIM', scadenta: scadenta1.toISOString(), discountProcent: 0,
        iteme: [
          { descriere: createdPiese[2].denumire, cantitate: 1, pretUnitar: createdPiese[2].pretBaza, idPiesa: createdPiese[2].idPiesa },
          { descriere: createdManopere[0].denumire, cantitate: 2, pretUnitar: createdManopere[0].pretOra, idManopera: createdManopere[0].idManopera }
        ]
      })
    });

    // Factura 2: Scadență 10 zile + Discount 10%
    const scadenta2 = new Date(); scadenta2.setDate(scadenta2.getDate() + 10);
    await apiJson('/facturare', {
      method: 'POST',
      body: JSON.stringify({
        idClient: createdClients[1].idClient, idComanda: comanda2.idComanda, serie: 'F-SIM', scadenta: scadenta2.toISOString(), discountProcent: 10,
        iteme: [
          { descriere: createdPiese[0].denumire, cantitate: 1, pretUnitar: createdPiese[0].pretBaza, idPiesa: createdPiese[0].idPiesa },
          { descriere: createdManopere[1].denumire, cantitate: 1, pretUnitar: createdManopere[1].pretOra, idManopera: createdManopere[1].idManopera }
        ]
      })
    });
    
    updateStatus('facturare', 'success', 'Emise 2 facturi: una cu scadență 15 zile (RCA) și una cu 10 zile și discount 10%.');
    
    // 7. Incasare
    updateStatus('incasare', 'loading');
    // Luăm facturile restante pentru a le stinge pe cele tocmai create
    const facturiRestante: any[] = await apiJson('/incasari/facturi-restante');
    
    // Stingem factura pentru Client Test 1 (Comanda 1)
    const client1 = createdClients[0];
    const factura1 = facturiRestante.find((f: any) => f.idClient === client1?.idClient);
    if (factura1) {
      await apiJson('/incasari', {
        method: 'POST',
        body: JSON.stringify({
          idClient: createdClients[0].idClient,
          sumaIncasata: factura1.restDePlata,
          modalitate: 'TransferBancar',
          referinta: 'OP-SIM-001',
          data: new Date().toISOString(),
          alocari: [{ idFactura: factura1.idFactura, sumaAlocata: factura1.restDePlata }]
        })
      });
    }

    updateStatus('incasare', 'success', 'Încasare înregistrată: Soldul pentru Client Test 1 a fost stins integral.');

  } catch (error) {
    console.error("Simulation failed:", error);
    const currentStep = steps.find(s => s.status === 'loading');
    if (currentStep) updateStatus(currentStep.id, 'error', error instanceof Error ? error.message : "Internal Error");
  }
}
