import { useEffect, useState } from 'react';

export function citesteStarePersistataPagina<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') {
    return fallback;
  }

  const valoare = window.sessionStorage.getItem(key);
  if (!valoare) {
    return fallback;
  }

  try {
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
  const [value, setValue] = useState<T>(() => citesteStarePersistataPagina(key, fallback));

  useEffect(() => {
    salveazaStarePersistataPagina(key, value);
  }, [key, value]);

  return [value, setValue] as const;
}
