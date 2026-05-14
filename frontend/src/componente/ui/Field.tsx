import type { InputHTMLAttributes } from 'react';
import { cn } from '../../lib/cn';

// `Field` standardizează câmpurile simple de input.
// Componenta știe să afișeze:
// - eticheta
// - input-ul propriu-zis
// - eroarea de validare
// - un hint, dacă nu există eroare
// Astfel, formularele din aplicație rămân mai coerente și mai ușor de citit.
interface FieldProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: string;
  hint?: string;
  label: string;
  wrapperClassName?: string;
}

export function Field({
  className,
  error,
  hint,
  label,
  type = 'text',
  wrapperClassName,
  ...props
}: FieldProps) {
  return (
    <div className={cn('space-y-1.5', wrapperClassName)}>
      {/* Eticheta este păstrată în componentă pentru a evita repetarea
          aceluiași pattern în toate formularele. */}
      <label className="block text-sm font-semibold text-slate-700">{label}</label>
      <input
        type={type}
        className={cn(
          'w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-slate-900 outline-none transition-all placeholder:text-slate-400 focus:border-indigo-300 focus:ring-2 focus:ring-indigo-500',
          error && 'border-rose-300 focus:border-rose-300 focus:ring-rose-500',
          className,
        )}
        {...props}
      />
      {/* Afișăm ori eroarea, ori hint-ul.
          Nu le arătăm simultan pentru a nu încărca inutil formularul. */}
      {error ? <p className="text-xs font-medium text-rose-600">{error}</p> : null}
      {!error && hint ? <p className="text-xs text-slate-500">{hint}</p> : null}
    </div>
  );
}

