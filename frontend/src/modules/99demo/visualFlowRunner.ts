import { wait as helperWait, checkStop } from './demoHelper';

// --- VIRTUAL MOUSE ---
let cursor: HTMLDivElement | null = null;

function ensureCursor() {
  if (cursor) return cursor;
  cursor = document.createElement('div');
  cursor.id = 'demo-virtual-cursor';
  cursor.style.position = 'fixed';
  cursor.style.width = '24px';
  cursor.style.height = '24px';
  cursor.style.borderRadius = '50%';
  cursor.style.backgroundColor = 'rgba(99, 102, 241, 0.8)';
  cursor.style.border = '2px solid white';
  cursor.style.boxShadow = '0 0 15px rgba(99, 102, 241, 0.6)';
  cursor.style.zIndex = '999999';
  cursor.style.pointerEvents = 'none';
  cursor.style.transition = 'all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)';
  cursor.style.display = 'none';
  
  const dot = document.createElement('div');
  dot.style.width = '6px';
  dot.style.height = '6px';
  dot.style.backgroundColor = 'white';
  dot.style.borderRadius = '50%';
  dot.style.margin = '7px';
  cursor.appendChild(dot);

  document.body.appendChild(cursor);
  return cursor;
}

async function moveCursorTo(el: HTMLElement) {
  const c = ensureCursor();
  const rect = el.getBoundingClientRect();
  const targetX = rect.left + rect.width / 2 - 12;
  const targetY = rect.top + rect.height / 2 - 12;
  
  c.style.display = 'block';
  c.style.left = `${targetX}px`;
  c.style.top = `${targetY}px`;
  
  await new Promise(r => setTimeout(r, 400));
  c.style.transform = 'scale(1.3)';
  await new Promise(r => setTimeout(r, 100));
  c.style.transform = 'scale(1)';
}

// --- CORE FINDER ---
export function findElement(selector: string): HTMLElement | null {
  if (!selector) return null;
  
  // 1. By ID (Direct Match)
  let el = document.getElementById(selector);
  if (el) return el;

  // 2. Search inside active form (Strict)
  const activeForm = document.querySelector('form');
  if (activeForm) {
    try {
      el = activeForm.querySelector(`#${selector}`) ||
           activeForm.querySelector(`[name="${selector}"]`) ||
           activeForm.querySelector(`[id="${selector}"]`);
      if (el) return el as HTMLElement;
    } catch(e) {}
  }

  // 3. If it looks like an ID (starts with input- or btn-), DON'T fallback to text search
  if (selector.startsWith('input-') || selector.startsWith('btn-') || selector.startsWith('select-')) {
    return (document.querySelector(`#${selector}`) as HTMLElement) || null;
  }

  // 4. By Text (Labels, Buttons) - Only for descriptive selectors
  const all = document.querySelectorAll('button, a, label, span, p, h4');
  const search = selector.toLowerCase().trim();
  
  const found = Array.from(all).find(e => {
    const text = (e as HTMLElement).innerText || (e as HTMLElement).textContent || "";
    return text.toLowerCase().trim() === search;
  });

  if (!found) {
    // Partial match as fallback for text
    const partial = Array.from(all).find(e => {
      const text = (e as HTMLElement).innerText || (e as HTMLElement).textContent || "";
      return text.toLowerCase().includes(search);
    });
    if (partial) return partial as HTMLElement;
  }

  if (found && found.tagName === 'LABEL') {
    const forId = found.getAttribute('for');
    if (forId) return document.getElementById(forId);
    return found.parentElement?.querySelector('input, select, textarea') as HTMLElement || found;
  }

  return (found as HTMLElement) || null;
}

export async function waitForElementToDisappear(selector: string, timeout = 5000) {
  const start = Date.now();
  while (Date.now() - start < timeout) {
    const el = findElement(selector);
    if (!el || (el as HTMLElement).offsetParent === null) return true;
    await new Promise(r => setTimeout(r, 200));
  }
  return false;
}

export async function simulateClick(selector: string, speed: any, pause: any, stop: any) {
  await checkStop(stop);
  let el = findElement(selector);
  if (!el) {
    await helperWait(1000, speed, pause, stop);
    el = findElement(selector);
  }
  if (!el) return false;

  el.scrollIntoView({ behavior: 'smooth', block: 'center' });
  await moveCursorTo(el);
  await helperWait(200, speed, pause, stop);
  
  el.click();
  el.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
  el.dispatchEvent(new MouseEvent('mouseup', { bubbles: true }));
  
  return true;
}

export async function simulateTyping(selector: string, text: string, speed: any, pause: any, stop: any) {
  await checkStop(stop);
  let el = findElement(selector) as HTMLElement;
  
  if (!el) {
    await helperWait(1000, speed, pause, stop);
    el = findElement(selector) as HTMLElement;
  }

  if (el && !(el instanceof HTMLInputElement) && !(el instanceof HTMLTextAreaElement)) {
    el = (el.querySelector('input, textarea') as HTMLElement) || el;
  }

  if (!el || (!(el instanceof HTMLInputElement) && !(el instanceof HTMLTextAreaElement))) return false;

  el.scrollIntoView({ behavior: 'smooth', block: 'center' });
  await moveCursorTo(el);
  el.focus();
  
  // Goluim câmpul înainte de a începe să scriem, pentru a evita suprapunerea datelor
  const proto = el instanceof HTMLInputElement ? window.HTMLInputElement.prototype : window.HTMLTextAreaElement.prototype;
  const setter = Object.getOwnPropertyDescriptor(proto, "value")?.set;
  setter?.call(el, "");
  el.dispatchEvent(new Event('input', { bubbles: true }));
  el.dispatchEvent(new Event('change', { bubbles: true }));
  
  // Dacă este un câmp numeric, setăm valoarea direct pentru a evita problemele cu punctul zecimal
  if (el instanceof HTMLInputElement && el.type === 'number') {
    setter?.call(el, text);
    el.dispatchEvent(new Event('input', { bubbles: true }));
    el.dispatchEvent(new Event('change', { bubbles: true }));
    await helperWait(200, speed, pause, stop);
    return true;
  }

  // Pentru câmpurile de tip dată, setăm valoarea direct (typing caracter cu caracter poate invalida formatul intermediar)
  if (el instanceof HTMLInputElement && el.type === 'date') {
    setter?.call(el, text);
    el.dispatchEvent(new Event('input', { bubbles: true }));
    el.dispatchEvent(new Event('change', { bubbles: true }));
    await helperWait(200, speed, pause, stop);
    return true;
  }

  for (const char of text) {
    await checkStop(stop);
    setter?.call(el, (el as any).value + char);
    el.dispatchEvent(new Event('input', { bubbles: true }));
    el.dispatchEvent(new Event('change', { bubbles: true }));
    await helperWait(20, speed, pause, stop);
  }
  
  return true;
}

export async function simulateSelect(selector: string, value: string, speed: any, pause: any, stop: any) {
  await checkStop(stop);
  let el = findElement(selector) as HTMLElement;
  
  if (!el) {
    await helperWait(1000, speed, pause, stop);
    el = findElement(selector) as HTMLElement;
  }

  if (el && !(el instanceof HTMLSelectElement)) {
    el = (el.querySelector('select') as HTMLElement) || el;
  }

  if (!el || !(el instanceof HTMLSelectElement)) return false;

  el.scrollIntoView({ behavior: 'smooth', block: 'center' });
  await moveCursorTo(el);
  el.focus();
  
  el.value = value;
  el.dispatchEvent(new Event('change', { bubbles: true }));
  el.dispatchEvent(new Event('input', { bubbles: true }));
  
  await helperWait(300, speed, pause, stop);
  return true;
}

export async function simulateSelectByLabel(selector: string, label: string, speed: any, pause: any, stop: any) {
  await checkStop(stop);
  let el = findElement(selector) as HTMLElement;
  if (!el) {
    await helperWait(1000, speed, pause, stop);
    el = findElement(selector) as HTMLElement;
  }
  if (el && !(el instanceof HTMLSelectElement)) {
    el = (el.querySelector('select') as HTMLElement) || el;
  }
  if (!el || !(el instanceof HTMLSelectElement)) return false;

  // Așteptăm puțin să se populeze opțiunile dacă e un render nou (React sync)
  if (el.options.length <= 1) {
    await helperWait(600, speed, pause, stop);
  }

  const option = Array.from(el.options).find(opt => 
    opt.text.toLowerCase().includes(label.toLowerCase())
  );
  
  if (option) {
    return simulateSelect(selector, option.value, speed, pause, stop);
  }
  return false;
}
