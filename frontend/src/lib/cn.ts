import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

// `cn` este un helper mic, dar folosit foarte des în proiect.
// `clsx` ne ajută să compunem clase condițional (`dacă e activ, adaugă clasa X`),
// iar `tailwind-merge` rezolvă conflictele dintre clasele Tailwind.
// Exemplu: dacă ajung simultan `px-4` și `px-6`, `tailwind-merge` o păstrează
// doar pe ultima relevantă, ca să nu avem stiluri contradictorii.
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
