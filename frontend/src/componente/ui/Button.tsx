import { cva, type VariantProps } from 'class-variance-authority';
import type { ButtonHTMLAttributes } from 'react';
import { cn } from '../../lib/cn';

// `cva` ne permite să definim într-un singur loc "variantele" butonului:
// primary, outline, danger etc.
// Asta reduce duplicarea claselor Tailwind și face butoanele consistente
// între module diferite.
const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-xl font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-60',
  {
    variants: {
      variant: {
        primary:
          'bg-indigo-600 text-white shadow-sm shadow-indigo-600/20 hover:bg-indigo-700',
        secondary: 'bg-slate-900 text-white hover:bg-slate-800',
        outline:
          'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50',
        ghost: 'text-slate-600 hover:bg-slate-100',
        danger: 'bg-rose-600 text-white hover:bg-rose-700',
      },
      size: {
        sm: 'px-3.5 py-2 text-sm',
        md: 'px-5 py-2.5 text-sm',
        lg: 'px-6 py-3 text-sm',
      },
      fullWidth: {
        true: 'w-full',
        false: '',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
      fullWidth: false,
    },
  },
);

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof buttonVariants>;

// Componenta `Button` este un wrapper comun peste butonul HTML clasic.
// Ea păstrează toate props-urile standard ale unui buton, dar adaugă
// și variante vizuale reutilizabile prin `variant`, `size` și `fullWidth`.
export function Button({
  className,
  fullWidth,
  size,
  variant,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(buttonVariants({ variant, size, fullWidth }), className)}
      {...props}
    />
  );
}

