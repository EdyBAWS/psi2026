import type { HTMLAttributes } from 'react';
import { cn } from '../../lib/cn';

// Card-urile sunt blocurile vizuale de bază ale interfeței.
// În loc să rescriem aceleași clase Tailwind pentru fiecare secțiune,
// centralizăm aici structura comună: container, header, titlu, descriere și conținut.
export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'rounded-2xl border border-slate-100 bg-white shadow-sm',
        className,
      )}
      {...props}
    />
  );
}

// Subcomponentele de mai jos sunt opționale.
// Le folosim doar când vrem o structură mai clară în interiorul unui card.
export function CardHeader({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('p-6', className)} {...props} />;
}

export function CardTitle({
  className,
  ...props
}: HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h2 className={cn('text-2xl font-bold tracking-tight text-slate-800', className)} {...props} />
  );
}

export function CardDescription({
  className,
  ...props
}: HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cn('mt-1 text-sm text-slate-500', className)} {...props} />;
}

export function CardContent({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('px-6 pb-6', className)} {...props} />;
}

