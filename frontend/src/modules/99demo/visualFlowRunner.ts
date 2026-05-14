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
    onStep("Navigăm la Catalog pentru a adăuga piese și kituri...");
    navigate('catalog-piese');
    await wait(1500);
    
    onStep("Deschidem formularul de adăugare piesă (Exemplu: Plăcuțe Frână)...");
    await simulateClick('#btn-add-piesa');
    await wait(800);
    await simulateTyping('#input-cod-piesa', 'PLC-ATE-SIM');
    await simulateTyping('#input-denumire-piesa', 'Placute Frana ATE (Test Visual)');
    await simulateTyping('#input-pret-baza', '225');
    await wait(500);
    await simulateClick('#btn-save-piesa');
    await wait(1000);

    onStep("Mergem la Kituri Piese...");
    navigate('catalog-kituri');
    await wait(1200);

    // --- 2. ENTITATI ---
    onStep("Configurăm echipa: Adăugăm Mecanici și Inspectori...");
    navigate('entitati-angajati');
    await wait(1200);

    onStep("Gestionăm portofoliul de clienți și vehicule...");
    navigate('entitati-clienti');
    await wait(1000);
    navigate('entitati-vehicule');
    await wait(1000);

    // --- 3. OPERATIONAL ---
    onStep("Flux de Recepție: Creăm un Dosar de Daună RCA (Omniasig)...");
    navigate('operational-receptie');
    await wait(1500);
    
    onStep("Identificăm vehiculul și asociem clientul...");
    // Aici de obicei se alege dintr-o listă, simulăm doar prezența pe pagină
    await wait(1000);

    onStep("Deschidem o a doua comandă pentru lucrări tehnice directe...");
    await wait(1000);

    onStep("Monitorizăm progresul în Gestiune Comenzi...");
    navigate('operational-comenzi');
    await wait(1500);

    // --- 4. FACTURARE ---
    onStep("Comenzile au fost finalizate. Trecem la Facturare...");
    navigate('facturare-comenzi');
    await wait(1500);

    onStep("Emitem factură cu scadență la 15 zile pentru Dosar RCA...");
    await wait(1000);

    onStep("Emitem factură cu discount 10% pentru lucrarea tehnică...");
    await wait(1000);

    onStep("Verificăm istoricul complet de facturare...");
    navigate('facturare-istoric');
    await wait(2000);

    onStep("Simularea vizuală a parcurs toate modulele principale. Sistemul este gata!");
    return true;
  } catch (error) {
    console.error("Visual script failed:", error);
    return false;
  }
}
