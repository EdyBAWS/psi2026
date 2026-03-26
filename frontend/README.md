# Frontend Service Auto G

Acest folder conține frontend-ul aplicației `Service Auto G`, construit cu `React + TypeScript + Vite + Tailwind CSS`.

Aplicația este organizată pe module funcționale și rulează ca un SPA administrativ cu navigație bazată pe stare locală, nu pe router.

## Stack și biblioteci folosite

- React 19
- TypeScript
- Vite 8
- Tailwind CSS v4
- ESLint
- `lucide-react` pentru iconuri
- `clsx`, `tailwind-merge`, `class-variance-authority` pentru compunerea claselor și variantelor UI
- `react-hook-form` pentru gestionarea formularelor
- `zod` și `@hookform/resolvers` pentru validare
- `sonner` pentru toast-uri

Observație:
- `react-router-dom` este instalat, dar nu este folosit în implementarea actuală

## Scripturi disponibile

Din directorul `frontend/`:

```bash
npm install
npm run dev
npm run build
npm run lint
npm run preview
```

## Structură importantă

```text
frontend/
├── package.json
├── vite.config.ts
├── tsconfig.json
├── src/
│   ├── main.tsx
│   ├── App.tsx
│   ├── index.css
│   ├── componente/
│   │   ├── Sidebar.tsx
│   │   └── ui/
│   ├── lib/
│   │   └── cn.ts
│   ├── modules/
│   │   ├── 00catalog/
│   │   ├── 01entitati/
│   │   ├── 02operational/
│   │   ├── 03facturare/
│   │   ├── 04incasari/
│   │   └── 05notificari/
│   └── types/
└── dist/
```

## Cum funcționează navigația

Navigația este controlată de:
- `src/App.tsx`
- `src/componente/Sidebar.tsx`

`App.tsx` păstrează `paginaCurenta` într-un `useState<string>` și alege ecranul activ printr-un `switch`.

`Sidebar.tsx` este meniul lateral care schimbă această stare. În prezent, categoria `Operațional` are două intrări separate:
- `Preluare Auto`
- `Gestiune Comenzi`

Nu se folosește React Router.

## Module

### `src/modules/00catalog`
Conține ecrane simple pentru:
- piese auto
- manoperă

Sunt module locale, fără backend, bune pentru CRUD demo și populare rapidă a interfeței.

### `src/modules/01entitati`
Conține ecrane pentru:
- clienți
- angajați
- asigurători

Acestea folosesc:
- `react-hook-form`
- `zod`
- componente UI comune
- toast-uri pentru confirmări

Datele sunt gestionate local în componentă.

### `src/modules/02operational`
Acesta este cel mai avansat modul din aplicație.

Rolul lui:
- recepție auto
- selecție vehicul
- context client
- flux de daună / asigurare
- creare comandă service
- gestionare poziții de deviz
- calcul subtotal / TVA / total
- listare și detalii comenzi

Fișiere importante:
- `Operational.tsx` pentru containerul modulului
- `pages/PreluareAuto.tsx`
- `pages/GestiuneComenzi.tsx`
- `types.ts`
- `formState.ts`
- `calculations.ts`
- `validations.ts`
- `schemas.ts`
- `mockData.ts`

Acest modul este referința cea mai bună pentru organizarea unui feature mai complex în aplicație.

### `src/modules/03facturare`
Conține:
- facturare comenzi
- oferte / campanii
- penalizări

Folosește componente UI comune și toast-uri, dar funcționează tot pe date locale/mock.

### `src/modules/04incasari`
Conține înregistrarea încasărilor și alocarea lor pe facturi.

### `src/modules/05notificari`
Conține un ecran simplu de notificări.

## Componente UI comune

Pentru a evita repetarea aceleiași structuri vizuale, proiectul are o bază comună de componente în:

```text
src/componente/ui/
```

Aceste componente sunt folosite treptat în module:
- `Button`
- `Card`
- `Field`
- `SelectField`
- `TextareaField`
- `PageHeader`
- `EmptyState`
- `StatCard`

Compunerea claselor se face prin:
- `src/lib/cn.ts`

## Formulare și validare

Strategia actuală este:
- formularele simple și medii folosesc `react-hook-form` + `zod`
- regulile de business mai complexe rămân separate de UI

Exemplu:
- în `02operational`, validările de business sunt în `validations.ts`
- validările de structură și input pot folosi `schemas.ts`

Această separare permite cod mai clar și mai ușor de testat.

## Feedback în UI

Proiectul folosește `sonner` pentru feedback non-blocant:
- succes la salvare
- confirmări operaționale
- erori și avertizări simple

Scopul este înlocuirea treptată a vechilor `alert(...)` cu toast-uri mai potrivite pentru un UI admin.

## Limitări actuale

În starea curentă:
- nu există backend
- datele nu se persistă după refresh
- majoritatea modulelor nu împart încă o stare comună live
- `02operational` este mai avansat decât restul codului

Acest lucru este acceptabil pentru faza actuală de prototip și demo, dar trebuie avut în vedere pentru următoarele etape.

## Direcție recomandată

Pași rezonabili pentru evoluția frontend-ului:
- unificarea treptată a tipurilor comune
- împărțirea unei surse comune de date între modulele care au dependențe reale
- extinderea folosirii componentelor UI comune
- conectarea la backend atunci când fluxurile sunt suficient de stabile
