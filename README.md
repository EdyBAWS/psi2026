# Service Auto G

Frontend admin pentru un service auto, construit ca aplicatie React + TypeScript + Vite. Proiectul modeleaza fluxuri uzuale dintr-un sistem intern de service: catalog de piese/manopera, entitati de baza, receptie si comenzi service, facturare, incasari si notificari.

Aplicatia este in stadiu de MVP extins:
- navigatia este deja functionala
- modulul `02operational` este cel mai matur si cel mai apropiat de un flux real
- restul modulelor sunt in mare parte ecrane demo / CRUD local, fara backend

## Stack

- React 19
- TypeScript
- Vite
- Tailwind CSS v4
- ESLint

Observatie importanta:
- pachetul `react-router-dom` exista in dependinte, dar aplicatia nu foloseste React Router in acest moment
- navigatia este bazata pe stare locala in `App.tsx`

## Pornire rapida

Cerintele minime:
- Node.js 20+
- npm

Comenzi:

```bash
cd frontend
npm install
npm run dev
```

Verificare calitate:

```bash
cd frontend
npm run lint
npm run build
```

## Cum este organizata aplicatia

Intrarea in frontend este:
- `frontend/src/main.tsx`

Shell-ul principal este:
- `frontend/src/App.tsx`
- `frontend/src/componente/Sidebar.tsx`

Aplicatia nu foloseste router. `App.tsx` tine un `paginaCurenta` in `useState` si decide ce pagina se afiseaza printr-un `switch`. `Sidebar.tsx` schimba acea stare prin `setPagina(...)`.

## Module principale

### `00catalog`
Contine ecrane simple pentru:
- piese auto
- manopera

Aceste pagini folosesc stare locala si permit adaugare / afisare de date de test.

### `01entitati`
Contine ecrane pentru:
- clienti
- angajati
- asiguratori

Sunt pagini de tip CRUD local, fara persistenta intre navigari si fara backend.

### `02operational`
Acesta este modulul central al proiectului in acest moment.

Acopera:
- preluare auto
- selectie vehicul
- context client
- dosar de dauna
- creare comanda service
- pozitii de deviz
- calcul subtotal / TVA / total
- gestiune comenzi cu filtre si panou de detalii

Structura interna:

```text
frontend/src/modules/02operational/
├── Operational.tsx
├── types.ts
├── formState.ts
├── calculations.ts
├── validations.ts
├── mockData.ts
├── components/
├── pages/
├── vehicule/
├── comenziservice/
└── daune/
```

Puncte importante:
- `Operational.tsx` este containerul modulului
- `PreluareAuto.tsx` este pagina de receptie
- `GestiuneComenzi.tsx` este pagina de listare / inspectare comenzi
- `types.ts` separa modelul de domeniu
- `formState.ts` separa starea de formular
- `calculations.ts` centralizeaza formulele financiare
- `validations.ts` centralizeaza regulile de validare pentru fluxul de preluare
- `mockData.ts` alimenteaza tot modulul cu date locale realiste

Modulul foloseste doua intrari separate in sidebar:
- `Preluare Auto`
- `Gestiune Comenzi`

### `03facturare`
Contine:
- facturare comenzi
- campanii / oferte
- penalizari de intarziere

`Facturare.tsx` este deja conectat la lista de comenzi transmisa din `App.tsx`, dar inca functioneaza pe date locale, fara backend.

### `04incasari`
Contine ecranul de inregistrare a incasarilor si alocare pe facturi restante.

### `05notificari`
Contine un centru simplu de notificari, bazat pe date mock.

## Ce este implementat mai bine acum

Zona cea mai avansata este `02operational`. Acolo exista deja:
- modelare clara a tipurilor
- separare intre date finale si draft-uri de UI
- validari de business
- date mock coerente
- comentarii explicative pentru colegi mai incepatori
- separare intre logica de calcul, validare si componente de UI

Cateva reguli operationale deja implementate:
- nu poti deschide o comanda noua daca vehiculul are deja o comanda activa
- fluxul de asigurare forteaza tipul de plata la `Asigurare`
- lipsa stocului pe o pozitie poate schimba statusul initial in `Asteapta piese`
- totalurile financiare sunt calculate centralizat

## Starea curenta a datelor

In prezent, aplicatia este frontend-only:
- nu exista backend
- nu exista API calls
- majoritatea modulelor folosesc `useState` local
- `02operational` foloseste mock data mai structurata

Asta inseamna:
- datele nu se persista dupa refresh
- unele module nu impart inca aceeasi sursa de adevar
- proiectul este potrivit pentru demo, prototipare si clarificare de fluxuri

## Observatii pentru dezvoltare

- codul este scris in principal in romana
- naming-ul modulelor urmareste zone functionale de business
- `02operational` poate fi folosit ca model de organizare pentru modulele care vor deveni mai complexe
- daca adaugi pagini noi, trebuie actualizate manual:
  - `App.tsx`
  - `Sidebar.tsx`

## Structura pe scurt

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
        └── types/
```

## Directie urmatoare recomandata

Daca proiectul continua, urmatorii pasi logici sunt:
- legarea modulelor la o sursa comuna de date
- unificarea treptata a tipurilor comune dintre `types/entitati.ts` si `02operational/types.ts`
- extinderea modulelor non-operational la acelasi nivel de structura ca `02operational`
- adaugarea unui backend sau a unui strat de persistenta

