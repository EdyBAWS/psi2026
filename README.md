# Service Auto G

`Service Auto G` este o aplicație full-stack pentru administrarea unui service auto. Proiectul are:

- frontend administrativ în `React + TypeScript + Vite`
- backend API în `NestJS`
- persistență prin `Prisma`
- bază de date `PostgreSQL` găzduită în Neon

Aplicația acoperă fluxuri precum catalogul de piese și manoperă, gestiunea clienților, angajaților și asiguratorilor, recepția auto, dosare de daună, comenzi de service și facturare.

## Pornire rapidă

Cerințe:

- Node.js 20+
- npm
- acces la variabila `DATABASE_URL` în `backend/.env`

Instalare:

```bash
npm install --prefix backend
npm install --prefix frontend
```

Pornire full-stack din root:

```bash
npm run dev
```

URL-uri locale:

```text
Frontend: http://127.0.0.1:5173
Backend:  http://127.0.0.1:3000
```

Observație: când rulezi `npm run dev`, Vite afișează URL-ul frontend, apoi Nest scrie multe loguri de startup. Scriptul root reafișează URL-urile după pornire ca să fie ușor de găsit.

## Comenzi utile

Din root:

```bash
npm run dev
npm run build
npm run test
npm run lint
```

Doar backend:

```bash
npm run start:dev --prefix backend
npm run build --prefix backend
npm test --prefix backend -- --runInBand
npm run lint --prefix backend
```

Doar frontend:

```bash
npm run dev --prefix frontend -- --host 127.0.0.1
npm run build --prefix frontend
npm run lint --prefix frontend
```

Prisma / bază de date:

```bash
cd backend
npx prisma validate
npx prisma generate
npx prisma migrate status
npm run seed
```

## Stack

Frontend:

- React 19
- TypeScript
- Vite 8
- Tailwind CSS v4
- `react-hook-form` + `zod`
- `lucide-react`
- `sonner`

Backend:

- NestJS
- Prisma Client
- PostgreSQL / Neon
- `class-validator`
- Jest

## Ce face fiecare tehnologie

### React

React este biblioteca folosită pentru interfață. În loc să modificăm manual HTML-ul din browser, scriem componente. O componentă primește date prin `props`, ține stare prin `useState` / hook-uri și întoarce JSX, adică descrierea ecranului.

În acest proiect, React este folosit pentru pagini precum catalog, entități, operațional și facturare.

### TypeScript

TypeScript este JavaScript cu tipuri. Tipurile ne ajută să prindem erori înainte de rulare, de exemplu când folosim `numarComanda` greșit sau trimitem un câmp care nu există în model.

În proiect, tipurile frontend sunt în fișiere precum:

```text
frontend/src/modules/02operational/types.ts
frontend/src/types/
```

### Vite

Vite este serverul de dezvoltare și tool-ul de build pentru frontend. Când rulezi frontend-ul, Vite servește aplicația pe:

```text
http://127.0.0.1:5173
```

La `npm run build --prefix frontend`, Vite creează varianta optimizată pentru producție în `frontend/dist`.

### Tailwind CSS

Tailwind oferă clase CSS gata de folosit direct în JSX. De exemplu, `rounded-xl`, `bg-white`, `text-sm`, `flex` și `gap-4` sunt clase Tailwind.

Avantajul este că stilizarea rămâne aproape de componentă și se poate ajusta rapid fără fișiere CSS separate pentru fiecare componentă.

### NestJS

NestJS este framework-ul backend. El organizează codul în module, controllere și servicii.

Rolurile principale:

- `Module`: grupează codul unei zone, de exemplu `OperationalModule`
- `Controller`: definește rutele HTTP, de exemplu `GET /operational/comenzi`
- `Service`: conține logica reală și apelează baza de date
- `DTO`: descrie ce date acceptă un request

Exemplu simplificat:

```text
browser/front-end
  -> POST /operational/comenzi
  -> OperationalController
  -> OperationalService
  -> Prisma
  -> PostgreSQL
```

### DTO și ValidationPipe

DTO înseamnă `Data Transfer Object`. Este clasa care spune backend-ului ce formă trebuie să aibă datele primite.

`ValidationPipe` citește DTO-ul și validează request-ul. În `backend/src/main.ts`, `whitelist: true` elimină câmpurile care nu sunt definite în DTO. Asta protejează API-ul de payload-uri greșite.

Exemplu: dacă DTO-ul pentru comandă acceptă doar status `Activ` / `Inactiv`, frontend-ul nu trebuie să trimită status UI precum `In Lucru` sau `Asteapta piese`.

### Prisma

Prisma este stratul dintre codul TypeScript și baza de date. În loc să scriem SQL manual pentru fiecare operație, folosim Prisma Client:

```ts
prisma.comanda.findMany()
prisma.comanda.create()
prisma.vehicul.update()
```

Fișierul important este:

```text
backend/prisma/schema.prisma
```

Acolo sunt definite modelele, relațiile și enum-urile. După ce schimbi schema, rulezi:

```bash
npx prisma generate
```

### Migrații Prisma

O migrare este istoricul unei schimbări de bază de date. Dacă adaugi un tabel sau un câmp nou, Prisma creează un fișier SQL în:

```text
backend/prisma/migrations/
```

Migrațiile fac ca baza de date altui coleg sau a mediului de producție să poată ajunge la aceeași structură.

### PostgreSQL

PostgreSQL este baza de date relațională. Ea păstrează datele reale: clienți, vehicule, dosare, comenzi, facturi și iteme.

Relațional înseamnă că tabelele se leagă între ele. De exemplu:

```text
Client -> Vehicul -> DosarDauna -> Comanda -> Factura
```

În modulul operațional, comanda este legată de vehicul prin dosar:

```text
Comanda.idDosar -> DosarDauna.idDosar -> DosarDauna.idVehicul -> Vehicul.idVehicul
```

### Neon

Neon este serviciul cloud care găzduiește baza PostgreSQL. Aplicația se conectează la Neon prin `DATABASE_URL` din:

```text
backend/.env
```

Fără `DATABASE_URL` corect, Prisma nu poate citi sau scrie date.

### Seed data

Seed-ul populează baza cu date inițiale pentru testare și demo. În proiect, seed-ul este în:

```text
backend/prisma/seedData.ts
```

Îl rulezi cu:

```bash
npm run seed --prefix backend
```

### Jest

Jest rulează testele backend. Testele verifică rapid că modulele principale se construiesc și că metodele de bază răspund corect.

Comandă:

```bash
npm test --prefix backend -- --runInBand
```

## Cum este organizat repo-ul

```text
psi2026/
├── package.json             # scripturi root pentru full-stack
├── scripts/
│   └── dev.mjs              # pornește backend + frontend împreună
├── backend/
│   ├── README.md
│   ├── package.json
│   ├── prisma/
│   │   ├── schema.prisma
│   │   ├── migrations/
│   │   └── seedData.ts
│   └── src/
│       ├── catalog/
│       ├── entitati/
│       ├── operational/
│       ├── facturare/
│       └── prisma/
└── frontend/
    ├── README.md
    ├── package.json
    └── src/
        ├── App.tsx
        ├── componente/
        ├── mock/
        ├── modules/
        ├── lib/
        └── types/
```

## Logica backend-ului

Backend-ul folosește structura standard NestJS:

```text
Controller -> Service -> PrismaService -> PostgreSQL
```

Pe scurt:

- `Controller` definește endpoint-urile HTTP: `GET`, `POST`, `PATCH`, `DELETE`
- `DTO` definește forma datelor primite în request
- `Service` conține logica aplicației și apelează Prisma
- `PrismaService` gestionează conexiunea la baza de date
- `schema.prisma` definește tabelele, relațiile și enum-urile
- `migrations/` păstrează istoricul modificărilor de bază de date

Exemplu din modulul operațional:

```text
POST /operational/vehicule
  -> OperationalController.createVehicul()
  -> OperationalService.createVehicul()
  -> prisma.vehicul.create()
  -> tabelul Vehicul din PostgreSQL
```

Aceeași idee se repetă în modulele `catalog`, `entitati`, `operational` și `facturare`.

## Cum vorbește frontend-ul cu backend-ul

Frontend-ul trimite cereri HTTP către backend prin `fetch`. De exemplu, modulul operațional citește comenzi din:

```text
GET http://127.0.0.1:3000/operational/comenzi
```

În `02operational`, fișierul care izolează comunicarea cu backend-ul este:

```text
frontend/src/modules/02operational/operational.service.ts
```

Acest fișier face trei lucruri importante:

- apelează endpoint-urile NestJS
- transformă răspunsurile backend în tipuri pe care UI-ul le poate folosi
- traduce diferențele dintre statusurile simple din backend și statusurile mai descriptive din frontend

Pentru începători: componenta React nu ar trebui să știe toate detaliile despre Prisma sau despre forma exactă a JSON-ului din backend. De aceea există acest strat de service pe frontend.

## Module backend

### `catalog`

Gestionează:

- piese
- manoperă

Endpoint-uri utile:

```text
GET    /catalog/piese
POST   /catalog/piese
PATCH  /catalog/piese/:id
DELETE /catalog/piese/:id

GET    /catalog/manopera
POST   /catalog/manopera
PATCH  /catalog/manopera/:id
DELETE /catalog/manopera/:id
```

### `entitati`

Gestionează:

- clienți
- angajați
- asiguratori

Endpoint-uri utile:

```text
GET   /entitati/clienti
POST  /entitati/clienti
PATCH /entitati/clienti/:id
PATCH /entitati/clienti/:id/status

GET   /entitati/angajati
GET   /entitati/asiguratori
```

### `operational`

Gestionează fluxul operațional al service-ului:

- vehicule
- dosare de daună
- comenzi de service

Endpoint-uri utile:

```text
GET   /operational/vehicule
POST  /operational/vehicule
PATCH /operational/vehicule/:id
PATCH /operational/vehicule/:id/status

GET   /operational/dosare
POST  /operational/dosare
PATCH /operational/dosare/:id

GET   /operational/comenzi
POST  /operational/comenzi
PATCH /operational/comenzi/:id
```

### `facturare`

Gestionează facturi și iteme de factură.

Endpoint-uri utile:

```text
GET    /facturare
GET    /facturare/:id
POST   /facturare
PATCH  /facturare/:id
DELETE /facturare/:id
```

## Modelul de date

Schema principală este în:

```text
backend/prisma/schema.prisma
```

Modele importante:

- `Client`
- `Angajat`
- `Asigurator`
- `Vehicul`
- `DosarDauna`
- `Comanda`
- `Piesa`
- `Manopera`
- `Factura`
- `FacturaItem`

Relații importante:

- un `Client` poate avea mai multe `Vehicul`
- un `Client` poate avea mai multe `DosarDauna`
- un `Vehicul` poate apărea în mai multe `DosarDauna`
- un `DosarDauna` poate avea mai multe `Comanda`
- o `Comanda` poate avea mai multe `Factura`
- o `Factura` are mai multe `FacturaItem`

## Cum adaugi un endpoint nou

Pentru începători, cel mai simplu traseu este:

1. Verifică dacă există modelul în `backend/prisma/schema.prisma`.
2. Dacă modifici schema, creează o migrare Prisma.
3. Creează sau actualizează DTO-ul în modulul potrivit.
4. Adaugă metoda în `*.service.ts`.
5. Expune metoda prin `*.controller.ts`.
6. Adaugă un test simplu în `*.spec.ts`.
7. Rulează verificările.

Exemplu de verificări:

```bash
npm run build --prefix backend
npm test --prefix backend -- --runInBand
npm run lint --prefix backend
```

## Tips pentru începători

- În NestJS, controller-ul nu ar trebui să conțină logică grea. El doar primește request-ul și cheamă service-ul.
- Service-ul este locul potrivit pentru logica aplicației: create, update, status changes, calculări și apeluri către Prisma.
- DTO-urile descriu ce primește API-ul. Dacă un request pică pe validare, verifică DTO-ul și `ValidationPipe`.
- Prisma folosește numele modelelor din `schema.prisma`. Dacă ai `model Vehicul`, în cod vei folosi `prisma.vehicul`.
- După schimbări în `schema.prisma`, rulează `npx prisma generate`.
- Dacă baza de date nu răspunde, verifică `DATABASE_URL` din `backend/.env` și conexiunea la Neon.
- Pentru erori de port ocupat, oprește procesul vechi sau schimbă portul.
- Nu comita `node_modules`, `dist`, cache-uri sau fișiere `.env` cu secrete.
- Rulează build și test înainte de commit. Un endpoint care pare să meargă manual poate rupe TypeScript sau testele.

## Starea validată

Backend-ul a fost verificat cu:

```bash
npx prisma validate
npx prisma generate
npx prisma migrate status
npm run build --prefix backend
npm test --prefix backend -- --runInBand
npm run lint --prefix backend
```

Au fost testate și endpoint-uri reale pentru:

- catalog
- entități
- operațional
- facturare

Pentru modulul operațional s-a verificat și un flux temporar `POST/PATCH` pentru vehicul, dosar și comandă, urmat de cleanup în baza de date.

Stare frontend:

- aplicația pornește local prin Vite
- `npm run build --prefix frontend` trece
- `02operational` folosește backend real pentru vehicule, dosare, comenzi, clienți, mecanici, asiguratori, piese și manoperă
- unele zone frontend păstrează încă state local sau mock-uri pentru fluxuri demo care nu au încă model backend complet

## Documentație detaliată

- [backend/README.md](backend/README.md)
- [frontend/README.md](frontend/README.md)
