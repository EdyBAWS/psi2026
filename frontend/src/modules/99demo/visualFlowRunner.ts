export async function wait(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export async function simulateClick(selector: string) {
  const el = document.querySelector(selector) as HTMLElement;
  if (!el) {
    console.warn(`Element not found for selector: ${selector}`);
    return false;
  }
  
  // Visual feedback
  const originalOutline = el.style.outline;
  el.style.outline = '4px solid #4f46e5';
  el.style.outlineOffset = '2px';
  await wait(300);
  el.click();
  el.style.outline = originalOutline;
  return true;
}

export async function simulateTyping(selector: string, text: string) {
  const el = document.querySelector(selector) as HTMLInputElement;
  if (!el) {
    console.warn(`Input not found for selector: ${selector}`);
    return false;
  }
  
  el.focus();
  const originalBg = el.style.backgroundColor;
  el.style.backgroundColor = '#f5f3ff';
  el.value = '';
  
  for (const char of text) {
    el.value += char;
    el.dispatchEvent(new Event('input', { bubbles: true }));
    el.dispatchEvent(new Event('change', { bubbles: true }));
    await wait(Math.random() * 40 + 20);
  }
  
  el.style.backgroundColor = originalBg;
  await wait(150);
  return true;
}

export async function runVisualScript(onStep: (msg: string) => void, navigate: (path: string) => void) {
  try {
    // --- 1. CATALOG ---
    onStep("Navigăm la Catalog pentru a adăuga o manoperă nouă...");
    navigate('catalog-manopera');
    await wait(1500);
    
    onStep("Definim o normă de lucru: 'Revizie Generală'...");
    await simulateClick('#btn-add-manopera');
    await wait(800);
    await simulateTyping('#input-cod-manopera', 'MAN-REV-GEN');
    await simulateTyping('#input-denumire-manopera', 'Revizie Generala (Demo Visual)');
    await simulateTyping('#input-durata-manopera', '2.5');
    await wait(500);
    await simulateClick('#btn-save-manopera');
    await wait(1500);

    // --- 2. OPERATIONAL - RECEPTIE ---
    onStep("Flux de Recepție: Identificăm vehiculul după numărul de înmatriculare...");
    navigate('operational-receptie');
    await wait(2000);
    
    onStep("Căutăm 'B-101-SIM' în baza de date CRM...");
    await simulateTyping('#input-search-vehicul', 'B-101-SIM');
    await wait(1000);
    await simulateClick('#btn-select-vehicul-0');
    await wait(2000);

    onStep("Completăm datele de recepție: Kilometraj și Simptome...");
    await simulateTyping('#input-kilometraj-preluare', '155400');
    await simulateTyping('#input-simptome-reclamate', 'Zgomot suspect punte fata, se solicita revizie generala si verificare frane.');
    
    onStep("Asignăm echipa tehnică pentru această lucrare...");
    await simulateClick('#select-mecanic-preluare');
    await wait(500);
    
    onStep("Deschidem comanda în sistem...");
    await simulateClick('#btn-save-preluare');
    await wait(2500);

    // --- 3. OPERATIONAL - GESTIUNE ---
    onStep("Monitorizăm fluxul de lucru în timp real...");
    navigate('operational-comenzi');
    await wait(2000);

    // --- 4. FACTURARE ---
    onStep("Lucrarea a fost finalizată. Trecem la procesul de facturare...");
    navigate('facturare-comenzi');
    await wait(2000);

    onStep("Selectăm comanda nou creată pentru a genera factura fiscală...");
    await simulateClick('#btn-open-factura-0');
    await wait(1500);
    
    onStep("Confirmăm datele fiscale și emitem factura...");
    await simulateTyping('#input-serie-factura', 'F-SIM');
    await simulateTyping('#input-numar-factura', '2026001');
    await wait(1000);
    await simulateClick('#btn-save-factura');
    await wait(2500);

    // --- 5. INCASARI ---
    onStep("Finalizăm tranzacția prin înregistrarea plății...");
    navigate('incasari');
    await wait(2000);

    onStep("Căutăm clientul pentru a stinge datoria curentă...");
    await simulateTyping('#input-search-client-incasare', 'Client Test 1');
    await wait(1000);
    
    // Simulare selectare din dropdown
    const dropdownItem = document.querySelector('li.cursor-pointer') as HTMLElement;
    if (dropdownItem) dropdownItem.click();
    await wait(1500);

    onStep("Repartizăm suma încasată pe facturile restante...");
    await simulateClick('#btn-pay-all-0');
    await wait(800);
    await simulateTyping('#input-referinta-incasare', 'SIM-OP-1002');
    await wait(1000);
    
    onStep("Validăm plata și actualizăm soldul în timp real...");
    await simulateClick('#btn-save-incasare');
    await wait(2000);

    onStep("Simularea completă a parcurs cu succes toate modulele: Catalog -> Recepție -> Facturare -> Încasare.");
    return true;
  } catch (error) {
    console.error("Visual script failed:", error);
    return false;
  }
}
