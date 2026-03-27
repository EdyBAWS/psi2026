# Service Auto G

`Service Auto G` este un frontend administrativ pentru un service auto. Proiectul este construit ca aplicație `React + TypeScript + Vite` și modelează fluxuri interne precum catalogul de piese și manoperă, gestiunea entităților de bază, recepția auto, comenzile de service, facturarea, încasările și notificările.

În forma actuală, proiectul este un MVP frontend-only:
- nu are backend
- nu persistă datele după refresh
- folosește în principal `useState` și date mock
- are un modul operațional mai avansat decât restul aplicației

## Stack

- React 19
- TypeScript
- Vite
- Tailwind CSS v4
- ESLint
- `lucide-react` pentru iconografie
- `clsx` + `tailwind-merge` + `class-variance-authority` pentru compunerea claselor și a variantelor UI
- `react-hook-form` + `zod` pentru formularele moderne
- `sonner` pentru toast-uri

Observații:
- `react-router-dom` există în dependințe, dar aplicația nu folosește React Router în acest moment
- navigația este controlată prin stare locală în `frontend/src/App.tsx`

## Pornire rapidă

Cerințe:
- Node.js 20+
- npm

Instalare și rulare:

```bash
cd frontend
npm install
npm run dev
```

Verificări:

```bash
cd frontend
npm run lint
npm run build
```

## Arhitectură generală

Frontend-ul pornește din:
- `frontend/src/main.tsx`

Shell-ul principal este format din:
- `frontend/src/App.tsx`
- `frontend/src/componente/Sidebar.tsx`

Aplicația nu folosește router. `App.tsx` păstrează un `paginaCurenta` în `useState` și alege pagina activă printr-un `switch`. `Sidebar.tsx` doar schimbă acea stare prin `setPagina(...)`.

## Module principale

### `00catalog`
Conține ecrane pentru:
- piese auto
- manoperă

Aceste pagini sunt încă simple, locale, și folosesc date ținute în componentă. Au primit însă feedback modernizat cu toast-uri și unele elemente UI comune.

### `01entitati`
Conține ecrane pentru:
- clienți
- angajați
- asigurători

Aceste pagini folosesc acum:
- `react-hook-form`
- `zod`
- componente UI comune
- toast-uri pentru operațiile principale

În continuare, datele sunt locale și nu se păstrează între refresh-uri.

### `02operational`
Acesta este modulul cel mai matur și cel mai apropiat de un flux real de business.

Acoperă:
- preluare auto
- selecție vehicul și context client
- dosar de daună
- creare comandă service
- poziții de deviz
- calcule financiare
- validări de business
- gestiune comenzi cu filtre și panou de detalii

Structura lui internă:

```text
frontend/src/modules/02operational/
├── Operational.tsx
├── types.ts
├── formState.ts
├── calculations.ts
├── validations.ts
├── schemas.ts
├── mockData.ts
├── components/
├── pages/
├── vehicule/
├── comenziservice/
└── daune/
```

Puncte importante:
- `Operational.tsx` este containerul principal al modulului
- în sidebar există două intrări separate:
  - `Preluare Auto`
  - `Gestiune Comenzi`
- `PreluareAuto.tsx` orchestrează fluxul de recepție
- `GestiuneComenzi.tsx` este pagina de listare și inspecție
- `types.ts` definește tipurile de domeniu
- `formState.ts` definește starea de formular și draft-urile
- `calculations.ts` centralizează formulele
- `validations.ts` centralizează regulile de business
- `schemas.ts` introduce validări `zod` pentru formele relevante
- `mockData.ts` oferă date locale realiste pentru demo

### `03facturare`
Conține:
- facturare comenzi
- campanii / oferte
- penalizări

Modulul folosește acum feedback prin toast-uri și componente UI comune. `Facturare.tsx` primește comenzile prin `App.tsx`, dar în prezent acestea sunt tot date mock, nu stare comună live cu modulul operațional.

### `04incasari`
Conține un ecran pentru înregistrarea încasărilor și alocarea sumelor pe facturi. Folosește toast-uri pentru feedback și păstrează datele local.

### `05notificari`
Conține un centru simplu de notificări, bazat pe date mock și afișare locală.

## Sistem UI comun

Frontend-ul are acum o bază comună de UI în:

```text
frontend/src/componente/ui/
```

Aici există componente reutilizabile precum:
- `Button`
- `Card`
- `Field`
- `SelectField`
- `TextareaField`
- `PageHeader`
- `EmptyState`
- `StatCard`

Există și utilitarul:
- `frontend/src/lib/cn.ts`

Acesta unifică folosirea `clsx` și `tailwind-merge` pentru compunerea claselor.

## Starea actuală a aplicației

Ce este bine definit acum:
- navigația pe module este clară și funcțională
- `02operational` are structură coerentă și reguli de business separate
- formularele din `01entitati` folosesc deja `react-hook-form` și `zod`
- feedback-ul vizual a fost modernizat prin toast-uri în loc de `alert(...)`
- există o bază comună de componente UI reutilizabile

Ce rămâne de făcut mai târziu:
- unificarea surselor de date între module
- persistarea datelor
- conectarea la backend
- alinierea tuturor modulelor la nivelul de structură din `02operational`

## Structura repo-ului

```text
psi2026/
├── README.md
└── frontend/
    ├── package.json
    ├── vite.config.ts
    └── src/
        ├── App.tsx
        ├── main.tsx
        ├── componente/
        ├── modules/
        ├── lib/
        └── types/
```

## Direcție recomandată

Pașii naturali pentru etapa următoare sunt:
- conectarea modulelor la o sursă comună de date
- unificarea treptată a tipurilor comune dintre `types/entitati.ts` și `02operational/types.ts`
- extinderea modulelor non-operaționale cu aceeași disciplină de structură
- adăugarea unui backend sau a unui strat de persistență
