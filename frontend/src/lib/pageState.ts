import { useEffect, useState } from 'react';

// Acest fișier ne ajută să păstrăm mici bucăți de stare între navigări,
// fără să introducem un store global.
// Alegem `sessionStorage`, deci valorile rămân în sesiunea curentă din browser,
// dar nu sunt gândite ca persistență "adevărată" de lungă durată.
export function citesteStarePersistataPagina<T>(key: string, fallback: T): T {
  // În timpul build-ului sau în medii fără `window`,
  // nu avem acces la `sessionStorage`, deci folosim fallback-ul.
  if (typeof window === 'undefined') {
    return fallback;
  }

  const valoare = window.sessionStorage.getItem(key);
  if (!valoare) {
    return fallback;
  }

  try {
    // Valorile sunt salvate ca string JSON,
    // de aceea le parsăm când le citim înapoi.
    return JSON.parse(valoare) as T;
  } catch {
    return fallback;
  }
}

export function salveazaStarePersistataPagina<T>(key: string, value: T) {
  if (typeof window === 'undefined') {
    return;
  }

  window.sessionStorage.setItem(key, JSON.stringify(value));
}

export function usePageSessionState<T>(key: string, fallback: T) {
  // Hook-ul acesta se comportă asemănător cu `useState`,
  // dar sincronizează automat valoarea și în `sessionStorage`.
  const [value, setValue] = useState<T>(() => citesteStarePersistataPagina(key, fallback));

  useEffect(() => {
    salveazaStarePersistataPagina(key, value);
  }, [key, value]);

  return [value, setValue] as const;
}
