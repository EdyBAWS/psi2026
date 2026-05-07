# Frontend Service Auto G

Acest folder conține frontend-ul aplicației `Service Auto G`, construit cu `React + TypeScript + Vite + Tailwind CSS`.

Frontend-ul face parte acum dintr-un proiect full-stack. Backend-ul NestJS este în `backend/` și expune API-uri reale pentru catalog, entități, operațional și facturare. Unele zone de frontend încă păstrează date demo/mock sau stare locală pentru onboarding și dezvoltare incrementală, deci integrarea live nu este complet uniformă în toate modulele.

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
- `sessionStorage` pentru persistența unor filtre/stări de pagină în sesiunea curentă
- `ConfirmDialog` pentru confirmări UI în loc de `window.confirm`

Observații importante:

- `react-router-dom` este instalat, dar nu este folosit în implementarea actuală
- aplicația nu are store global de stare (`Redux`, `Zustand`, `Context` de business etc.)
- navigația și majoritatea datelor sunt încă gestionate local, la nivel de modul sau componentă
- backend-ul local rulează pe `http://127.0.0.1:3000`

## Cum rulezi și verifici proiectul

Din root-ul repo-ului, pentru full-stack:

```bash
npm run dev
```

Din directorul `frontend/`, doar pentru frontend:

```bash
npm install
npm run dev
npm run build
npm run lint
npm run preview
```

Pe scurt:

- `npm install`: instalează dependențele
- `npm run dev`: pornește serverul local de dezvoltare
- `npm run build`: verifică TypeScript și generează build-ul de producție
- `npm run lint`: verifică regulile ESLint
- `npm run preview`: rulează local build-ul generat

Verificările minime recomandate înainte de commit:

```bash
npm run lint
npm run build
```

Observație:

- `vite build` poate afișa un warning despre chunk-uri mari; în starea actuală a proiectului acesta este cunoscut și nu blochează build-ul
- în starea actuală, `npm run build` trece; dacă reapare o eroare de tipuri, verifică mai întâi alinierea dintre câmpurile frontend și cele din `backend/prisma/schema.prisma`

## Structură importantă

```text
frontend/
├── package.json
├── vite.config.ts
├── tsconfig.json
├── README.md
├── src/
│   ├── main.tsx
│   ├── App.tsx
│   ├── index.css
│   ├── componente/
│   │   ├── Sidebar.tsx
│   │   └── ui/
│   ├── lib/
│   │   ├── cn.ts
│   │   └── pageState.ts
│   ├── mock/
│   │   ├── catalog.ts
│   │   ├── entitati.ts
│   │   ├── operational.ts
│   │   ├── facturare.ts
│   │   ├── incasari.ts
│   │   ├── notificari.ts
│   │   └── types.ts
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

## Arhitectura reală a frontend-ului

### Shell-ul aplicației

Fișierele principale sunt:

- `src/main.tsx`
- `src/App.tsx`
- `src/componente/Sidebar.tsx`

Rolurile lor:

- `main.tsx` montează aplicația și montează global și `Toaster` din `sonner`
- `App.tsx` păstrează `paginaCurenta` în `useState<string>` și decide manual ce pagină se afișează
- `Sidebar.tsx` este meniul lateral care schimbă `paginaCurenta`

Concluzie importantă:

- aplicația nu folosește router activ
- nu există URL-uri reale pentru pagini
- schimbarea paginii se face exclusiv prin stare locală în `App.tsx`

### Componente container vs componente de prezentare

În proiect apar două stiluri de componente:

- componente container
  - țin starea
  - fac derivări și validări
  - conectează helperi, mock-uri și subcomponente
- componente de prezentare
  - afișează datele primite
  - emit evenimente înapoi prin props
  - nu decid singure logica de business

Exemple:

- `PreluareAuto.tsx` este componentă container
- `PreluareAutoHeader.tsx`, `PreluareAutoContext.tsx`, `SelectorVehicul.tsx` sunt în principal componente de UI/control local

### Helperi și logică extrasă

În loc să lăsăm toată logica direct în JSX, proiectul încearcă să separe:

- helperi de calcul
- validări
- tipuri
- stare de formular

Exemple utile:

- `lib/cn.ts` pentru compunerea claselor Tailwind
- `lib/pageState.ts` pentru citire/scriere în `sessionStorage`
- `02operational/calculations.ts` pentru totaluri și indicatori
- `02operational/validations.ts` pentru reguli de business
- `02operational/schemas.ts` pentru validări de formă

## Mock layer și date demo

### Unde este sursa comună a mock-urilor

Datele demo comune trăiesc în:

```text
src/mock/
```

Acolo sunt centralizate seed-urile pentru:

- catalog
- entități
- operațional
- facturare
- încasări
- notificări

Scopul lor este să mențină coerența demo între ecrane, chiar dacă aplicația nu are încă o sursă live de adevăr.

### Ce înseamnă „mock comun” vs „state local”

Diferența importantă este:

- `src/mock/*` furnizează datele inițiale
- modulele pot copia aceste date în `useState` local și apoi lucrează pe acea copie

Deci:

- datele pornesc dintr-o sursă comună
- dar nu există sincronizare globală reală între toate modificările făcute în runtime

### Compat layer în `02operational`

Fișierul:

- `src/modules/02operational/mockData.ts`

există în principal pentru compatibilitate și re-export. Sursa reală a datelor demo pentru modulul operațional este:

- `src/mock/operational.ts`

## Module

### `src/modules/00catalog`

Conține ecrane pentru:

- piese auto
- manoperă

Starea actuală:

- ecrane de catalog/CRUD demo
- datele pornesc din `src/mock/catalog.ts`
- feedback-ul folosește toast-uri
- fără backend
- fără integrare live cu alte module

Bun pentru:

- extindere rapidă de UI
- testare de filtre, formulare și listări

### `src/modules/01entitati`

Conține ecrane pentru:

- clienți
- angajați
- asigurători

Starea actuală:

- folosește `react-hook-form`
- folosește `zod`
- folosește componente UI comune
- folosește `ConfirmDialog` pentru acțiuni de confirmare
- folosește seed-uri comune din `src/mock/entitati.ts`
- păstrează datele editabile local în componentă

Observație importantă:

- modificările din `01entitati` nu rescriu automat datele deja folosite de `02operational`

### `src/modules/02operational`

Acesta este modulul cel mai matur și cea mai bună referință pentru un feature mai complex.

Acoperă:

- selecția vehiculului
- context client
- fluxul de daună / asigurare
- preluarea vehiculului
- deschiderea comenzii service
- poziții de deviz
- subtotal / TVA / total
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

Caracteristici importante:

- container local cu stare comună pentru comenzi, dosare și poziții
- `operational.service.ts` este stratul de integrare cu backend-ul NestJS
- comenzile sunt persistate prin backend, iar legătura cu vehiculul se face prin dosar
- pozițiile de comandă sunt păstrate local până când există model backend dedicat pentru ele
- helperi puri pentru filtrare, sortare și calcule
- subcomponente separate pentru header, context, detalii și tabel
- comentarii beginner-friendly extinse

### `src/modules/03facturare`

Conține:

- facturare comenzi
- istoric facturare
- oferte / campanii
- penalizări

Starea actuală:

- consumă mock-uri comune din `src/mock/facturare.ts`
- este coerent cu operaționalul la nivel de numere și entități demo
- folosește componente UI comune și toast-uri
- rămâne încă demo/local-state, nu flux live complet

### `src/modules/04incasari`

Conține înregistrarea încasărilor și alocarea lor pe facturi.

Starea actuală:

- consumă mock-uri comune din `src/mock/incasari.ts`
- este coerent cu facturarea la nivel de facturi demo
- folosește toast-uri
- nu este încă integrat complet live cu backend-ul și cu restul aplicației

### `src/modules/05notificari`

Conține centrul de notificări.

Starea actuală:

- consumă `src/mock/notificari.ts`
- folosește `ConfirmDialog` pentru acțiuni destructive
- folosește toast-uri
- poate direcționa utilizatorul către zone ale aplicației prin navigația state-based

## Fluxurile demo dintre module

În forma actuală, aplicația are un flux demo coerent între:

```text
02operational -> 03facturare -> 04incasari -> 05notificari
```

Dar este important să înțelegi exact ce înseamnă asta:

- modulele folosesc mock-uri comune și tipuri coerente
- numerele de comandă, dosar și factură sunt aliniate între ecrane
- datele par legate logic între module

Ce NU înseamnă:

- nu există o sursă globală live unică
- nu există store global
- backend-ul există, dar nu toate acțiunile din frontend sunt conectate încă la persistența live
- nu toate acțiunile dintr-un modul se propagă automat în celelalte în runtime

Pe scurt:

- există coerență demo
- nu există încă sincronizare reală end-to-end

## Componente UI comune și convenții

Componentele comune trăiesc în:

```text
src/componente/ui/
```

Exemple:

- `Button`
- `Card`
- `Field`
- `SelectField`
- `TextareaField`
- `PageHeader`
- `EmptyState`
- `StatCard`
- `ConfirmDialog`

Rolul lor:

- reduc duplicarea de markup și stiluri
- mențin consistența UI între module
- fac codul mai ușor de extins

Compunerea claselor Tailwind se face prin:

- `src/lib/cn.ts`

Convenții utile:

- folosim toast-uri în loc de `alert`
- folosim confirm dialog UI în loc de `window.confirm`
- folosim `EmptyState` pentru stări de tip „nu există date” sau „nu există rezultate”
- folosim `StatCard` pentru mici rezumate numerice pe pagină

## Formulare, validare și persistență

### Formulare

Strategia actuală este:

- formularele simple și medii folosesc `react-hook-form` + `zod`
- regulile de business mai complexe sunt separate de UI

Exemple:

- `01entitati` folosește `react-hook-form` + `zod`
- `02operational` separă validările de formă în `schemas.ts` și validările de business în `validations.ts`

### Validări de formă vs validări de business

Această separare este importantă:

- `schemas.ts`
  - verifică forma inputului
  - de exemplu: lungime minimă, număr pozitiv, câmp obligatoriu
- `validations.ts`
  - verifică reguli de business și condiții de flux
  - de exemplu: relația dintre tipul plății și fluxul de daună, existența pozițiilor valide, blocări la salvare

### Persistență în `sessionStorage`

Pentru unele filtre și stări de pagină, proiectul folosește:

- `src/lib/pageState.ts`

Prin `sessionStorage`:

- valorile rămân cât timp sesiunea curentă din browser este activă
- sunt utile pentru filtre și sortări per pagină
- nu reprezintă o persistență de business sau o sursă de adevăr

## Limitări cunoscute

Aceste limitări trebuie considerate reale, nu doar temporare:

- backend-ul/API-ul există, dar integrarea frontend live nu este uniformă în toate modulele
- nu există React Router activ
- majoritatea modulelor folosesc încă state local
- nu există store global
- nu există sincronizare live completă între module
- unele fluxuri sunt coerente doar la nivel de mock-uri comune
- aplicația este bună pentru demo, onboarding și iterare de UI, dar nu încă pentru un flux complet persistent de producție
- build-ul poate raporta warning de chunk mare în Vite

## Mini-ghid de onboarding pentru începători

### Ce este JSX

JSX este felul în care React descrie interfața. Arată ca HTML, dar este scris în interiorul codului JavaScript/TypeScript.

Exemplu:

```tsx
return <div>Salut</div>;
```

Aici:

- `return` înseamnă "întoarce această interfață"
- `div` este un container generic
- textul `Salut` va fi afișat în pagină

### Ce înseamnă `return (...)` într-o componentă

O componentă React este o funcție. Ce întoarce acea funcție prin `return` este interfața pe care React o afișează.

### Tag-uri HTML/JSX întâlnite des

- `div`: container generic pentru gruparea elementelor
- `span`: container mic, bun pentru texte scurte sau badge-uri inline
- `p`: paragraf de text
- `button`: buton pe care utilizatorul poate da click
- `input`: câmp în care utilizatorul scrie o valoare
- `select`: dropdown din care utilizatorul alege o opțiune
- `option`: o opțiune dintr-un `select`
- `table`: tabel pentru date pe coloane
- `thead`: capul tabelului
- `tbody`: corpul tabelului
- `tr`: un rând din tabel
- `th`: o celulă de header
- `td`: o celulă normală

Structura tipică a unui tabel este:

```tsx
<table>
  <thead>
    <tr>
      <th>Coloană</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Valoare</td>
    </tr>
  </tbody>
</table>
```

### Ce înseamnă acoladele `{ ... }` în JSX

În JSX, acoladele înseamnă: "execută aici o expresie JavaScript și afișează rezultatul".

Exemple:

```tsx
<p>{numeClient}</p>
<p>{formatSuma(total)}</p>
```

### Operatori frecvenți în cod

- `conditie ? A : B`
  - operator ternar
  - dacă condiția este adevărată, folosește `A`, altfel `B`
- `valoareA || valoareB`
  - folosește `valoareB` dacă `valoareA` este goală / falsy
- `valoareA ?? valoareB`
  - folosește `valoareB` doar dacă `valoareA` este `null` sau `undefined`
- `conditie && rezultat`
  - afișează / evaluează partea din dreapta doar dacă stânga este adevărată

### Ce face `.map(...)`

`.map(...)` este o metodă de array care transformă fiecare element dintr-o listă în altceva.

În React, este folosită foarte des pentru a genera mai multe bucăți de interfață:

```tsx
{
  pozitii.map((pozitie) => (
    <tr key={pozitie.id}>
      <td>{pozitie.nume}</td>
    </tr>
  ));
}
```

### Ce este un helper pur

Un helper pur este o funcție care:

- primește date
- calculează un rezultat
- nu modifică direct starea aplicației

Exemple bune de helperi apar în:

- `02operational/calculations.ts`
- `02operational/pages/*helpers.ts`
- `lib/pageState.ts`

Avantajul este că logica devine mai ușor de testat și mai ușor de citit decât dacă ar fi amestecată în JSX.

### Ce este o componentă container

O componentă container:

- deține starea
- apelează helperi
- face validări
- decide ce trimite copiilor prin props

O componentă de prezentare:

- primește date
- afișează UI
- trimite evenimente înapoi

### De ce folosim mock-uri comune

Dacă fiecare modul și-ar inventa singur datele demo:

- aceleași entități ar arăta diferit
- numerele de documente nu s-ar potrivi
- ar fi greu de urmărit un flux demo între ecrane

De aceea folosim `src/mock/` ca sursă comună de seed-uri.

### Ce înseamnă persistență în `sessionStorage`

`sessionStorage` înseamnă:

- date păstrate doar în browserul curent
- doar pe durata sesiunii curente
- utile pentru filtre, sortări și mici stări de UI

Nu înseamnă:

- bază de date
- sursă globală de adevăr
- persistență business

### De ce unele validări sunt în `schemas.ts` și altele în `validations.ts`

Pentru că sunt două întrebări diferite:

- „arată bine inputul?”
- „poate continua fluxul de business?”

`schemas.ts` răspunde mai ales la prima întrebare.

`validations.ts` răspunde la a doua.

Această separare este folosită mai clar în `02operational` și este o convenție bună de urmat pentru zonele noi ale aplicației.
