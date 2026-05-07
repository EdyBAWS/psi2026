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
- unele module folosesc încă mock-uri și tipuri vechi
- `npm run build --prefix frontend` poate eșua până când toate mock-urile frontend sunt aliniate la câmpurile backend noi, de exemplu `numarComanda`, `numarInmatriculare`, `numarDosar`

## Documentație detaliată

- [backend/README.md](backend/README.md)
- [frontend/README.md](frontend/README.md)
