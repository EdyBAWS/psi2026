import type { SelectHTMLAttributes } from 'react';
import { cn } from '../../lib/cn';

// `SelectField` este varianta comună pentru dropdown-uri.
// Ideea este aceeași ca la `Field`: UI-ul pentru label, eroare și hint
// să fie uniform în toate formularele, indiferent de modul.
interface SelectOption {
  label: string;
  value: string;
}

interface SelectFieldProps extends SelectHTMLAttributes<HTMLSelectElement> {
  error?: string;
  hint?: string;
  label: string;
  options: SelectOption[];
  placeholder?: string;
  wrapperClassName?: string;
}

export function SelectField({
  className,
  error,
  hint,
  label,
  options,
  placeholder,
  wrapperClassName,
  ...props
}: SelectFieldProps) {
  return (
    <div className={cn('space-y-1.5', wrapperClassName)}>
      <label className="block text-sm font-semibold text-slate-700">{label}</label>
      <select
        className={cn(
          'w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-slate-900 outline-none transition-all focus:border-indigo-300 focus:ring-2 focus:ring-indigo-500',
          error && 'border-rose-300 focus:border-rose-300 focus:ring-rose-500',
          className,
        )}
        {...props}
      >
        {/* Placeholder-ul este util când vrem să forțăm o alegere explicită
            și nu vrem ca primul element real să fie selectat automat. */}
        {placeholder ? <option value="">{placeholder}</option> : null}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error ? <p className="text-xs font-medium text-rose-600">{error}</p> : null}
      {!error && hint ? <p className="text-xs text-slate-500">{hint}</p> : null}
    </div>
  );
}

