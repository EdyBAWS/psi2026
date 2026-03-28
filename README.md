# Service Auto G

`Service Auto G` este, în starea actuală a repo-ului, în principal frontend-ul administrativ al unei aplicații pentru service auto. Proiectul modelează fluxuri precum catalogul de piese și manoperă, gestiunea entităților de bază, recepția auto, comenzile de service, facturarea, încasările și notificările.

În forma actuală, proiectul este un MVP tehnic `frontend-only`:

- nu are backend real
- nu are API integrat
- nu persistă datele de business după refresh
- folosește date demo/mock și stare locală în multe zone
- are deja o structură suficient de matură pentru iterare și extindere incrementală

## Stack

- React 19
- TypeScript
- Vite 8
- Tailwind CSS v4
- ESLint
- `lucide-react` pentru iconuri
- `clsx`, `tailwind-merge`, `class-variance-authority` pentru compunerea claselor UI
- `react-hook-form` + `zod` pentru formulare și validare
- `sonner` pentru toast-uri

Observații importante:

- `react-router-dom` este instalat, dar nu este folosit în implementarea actuală
- navigația este state-based în `frontend/src/App.tsx`
- nu există store global de stare

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

Verificări standard:

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

Aplicația nu folosește router activ. `App.tsx` păstrează `paginaCurenta` într-un `useState` și decide pagina afișată printr-un `switch`. `Sidebar.tsx` schimbă această stare.

În practică:

- repo-ul conține în principal frontend-ul
- frontend-ul este modularizat pe domenii funcționale
- documentația detaliată pentru implementarea frontend-ului este în `frontend/README.md`

## Module principale

### `00catalog`

- piese auto
- manoperă

Ecrane demo/CRUD care pornesc din mock-uri comune și folosesc feedback prin toast-uri.

### `01entitati`

- clienți
- angajați
- asigurători

Folosește `react-hook-form`, `zod`, componente UI comune și confirmări UI.

### `02operational`

Modulul cel mai matur și cea mai bună referință pentru logică de business mai complexă.

Acoperă:

- preluare auto
- selecție vehicul și context client
- flux de daună / asigurare
- creare comandă service
- poziții de deviz
- calcule și validări
- gestiune comenzi

### `03facturare`

- facturare comenzi
- istoric facturare
- oferte / campanii
- penalizări

### `04incasari`

- înregistrarea încasărilor
- alocarea sumelor pe facturi

### `05notificari`

- centru de notificări

## Date demo și stare actuală

Proiectul are acum un mock layer comun în:

```text
frontend/src/mock/
```

Asta înseamnă:

- modulele importante consumă seed-uri coerente între ele
- există coerență demo pentru documente, clienți, comenzi și facturi
- nu există încă o sursă globală live de adevăr

Pe scurt:

- există mock-uri comune
- există coerență demo între module
- dar nu există sincronizare live completă între toate ecranele

## Sistem UI comun

Frontend-ul are o bază comună de UI în:

```text
frontend/src/componente/ui/
```

Și un utilitar pentru compunerea claselor în:

```text
frontend/src/lib/cn.ts
```

Acestea ajută la:

- consistență vizuală
- reducerea duplicării
- extinderea mai ușoară a modulelor

Pentru convențiile detaliate de UI, validare, toast-uri, `ConfirmDialog`, `sessionStorage` și helperi, vezi `frontend/README.md`.

## Starea actuală și limitări

Ce este deja bine definit:

- navigația pe module este clară și funcțională
- `02operational` are structură coerentă și separare bună între UI, calcule și validări
- `01entitati` folosește formulare moderne cu `react-hook-form` + `zod`
- există componente UI comune și un mock layer comun
- există coerență demo între `02operational`, `03facturare`, `04incasari` și `05notificari`

Ce rămâne limitare reală:

- nu există backend
- nu există persistență reală de business
- nu există React Router activ
- nu există store global
- fluxurile dintre module sunt coerente la nivel de mock-uri, nu complet live-sync

## Structura repo-ului

```text
psi2026/
├── README.md
└── frontend/
    ├── README.md
    ├── package.json
    ├── vite.config.ts
    └── src/
        ├── App.tsx
        ├── main.tsx
        ├── componente/
        ├── mock/
        ├── modules/
        ├── lib/
        └── types/
```

## Documentație detaliată

Pentru detalii tehnice complete despre frontend, vezi:

- [frontend/README.md](frontend/README.md)

Acolo sunt documentate în detaliu:

- mock layer-ul comun
- arhitectura reală a frontend-ului
- convențiile UI și helperii comuni
- fluxurile demo dintre module
- formularele, validările și persistența în `sessionStorage`
- onboarding-ul React/JSX/TypeScript pentru colegii începători
- limitările curente ale aplicației
