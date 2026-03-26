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
{pozitii.map((pozitie) => (
  <tr key={pozitie.id}>
    <td>{pozitie.nume}</td>
  </tr>
))}
```

Aici, pentru fiecare `pozitie`, React creează câte un rând de tabel.

### De ce există `key={...}` în liste

Când generăm mai multe elemente cu `.map(...)`, React are nevoie de un identificator stabil pentru fiecare element. Acesta este `key`.

Fără `key`, React nu poate actualiza lista corect și apare warning.

### Ce este `event.target.value`

Când utilizatorul schimbă un `input` sau un `select`, React trimite un `event`.

`event.target.value` este valoarea curentă din acel câmp.

Exemplu:

```tsx
onChange={(event) => setNume(event.target.value)}
```

### Ce este un callback

Un callback este o funcție trimisă altei componente, ca acea componentă să poată anunța ceva înapoi.

Exemplu:

```tsx
<SelectorVehicul onSelecteaza={setIdVehiculSelectat} />
```

Aici, `SelectorVehicul` nu decide singur ce face aplicația mai departe. El doar apelează callback-ul `onSelecteaza(...)`, iar componenta părinte decide ce actualizează.

### De ce folosim `className` și nu `class`

În React/JSX folosim `className` pentru clase CSS, deoarece `class` este un cuvânt special în JavaScript.

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
