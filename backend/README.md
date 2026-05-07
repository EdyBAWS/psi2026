# Backend Service Auto G

Backend-ul este un API `NestJS` pentru aplicația `Service Auto G`. El expune endpoint-uri pentru catalog, entități, operațional și facturare și persistă datele prin `Prisma` într-o bază `PostgreSQL` / Neon.

## Stack

- NestJS
- TypeScript
- Prisma Client
- PostgreSQL / Neon
- `class-validator`
- Jest

## Pornire

Din `backend/`:

```bash
npm install
npm run start:dev
```

Din root-ul repo-ului:

```bash
npm run dev
```

URL local:

```text
http://127.0.0.1:3000
```

## Comenzi utile

```bash
npm run start:dev
npm run build
npm run lint
npm test -- --runInBand
```

Prisma:

```bash
npx prisma validate
npx prisma generate
npx prisma migrate status
npm run seed
```

## Configurare DB

Backend-ul citește conexiunea la baza de date din:

```text
backend/.env
```

Variabila importantă:

```text
DATABASE_URL=...
```

Nu comita `.env` dacă include credențiale reale.

## Arhitectură

Fluxul standard este:

```text
HTTP request
  -> Controller
  -> DTO / ValidationPipe
  -> Service
  -> PrismaService
  -> PostgreSQL
```

Roluri:

- `controller.ts`: definește rutele HTTP
- `dto/*.dto.ts`: definește forma request-urilor
- `service.ts`: conține logica aplicației și interogările Prisma
- `module.ts`: leagă controller-ul și service-ul în Nest
- `prisma.service.ts`: gestionează conexiunea Prisma
- `schema.prisma`: definește modelele și relațiile DB

## Module

### `catalog`

Gestionează piese și manoperă.

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

Gestionează clienți, angajați și asiguratori.

```text
GET   /entitati/clienti
POST  /entitati/clienti
PATCH /entitati/clienti/:id
PATCH /entitati/clienti/:id/status

GET   /entitati/angajati
POST  /entitati/angajati
PATCH /entitati/angajati/:id
PATCH /entitati/angajati/:id/status

GET   /entitati/asiguratori
POST  /entitati/asiguratori
PATCH /entitati/asiguratori/:id
PATCH /entitati/asiguratori/:id/status
```

### `operational`

Gestionează vehicule, dosare de daună și comenzi.

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

Exemplu de logică:

```text
POST /operational/comenzi
  -> OperationalController.createComanda()
  -> OperationalService.createComanda()
  -> prisma.comanda.create()
```

În service, `dataPreconizata` este convertită din string în `Date`, deoarece Prisma așteaptă un `DateTime`.

### `facturare`

Gestionează facturi și iteme de factură.

```text
GET    /facturare
GET    /facturare/:id
POST   /facturare
PATCH  /facturare/:id
DELETE /facturare/:id
```

La creare, service-ul calculează:

- total fără TVA
- TVA
- total general

## Modelul de date

Schema este în:

```text
prisma/schema.prisma
```

Modele principale:

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

- `Client -> Vehicul`
- `Client -> DosarDauna`
- `Vehicul -> DosarDauna`
- `DosarDauna -> Comanda`
- `Comanda -> Factura`
- `Factura -> FacturaItem`

## Cum adaugi un model nou

Pași recomandați:

1. Adaugă modelul în `prisma/schema.prisma`.
2. Creează migrarea Prisma.
3. Rulează `npx prisma generate`.
4. Creează modulul Nest sau extinde unul existent.
5. Adaugă DTO-uri pentru request-uri.
6. Adaugă metode în service.
7. Expune endpoint-uri în controller.
8. Adaugă teste.
9. Rulează build, lint și test.

Comenzi:

```bash
npx prisma migrate dev --name nume_migrare
npx prisma generate
npm run build
npm test -- --runInBand
npm run lint
```

## Tips pentru începători

- Dacă vezi `Cannot find name describe/it/expect`, verifică `types: ["node", "jest"]` în `tsconfig.json`.
- Dacă Nest spune că nu poate rezolva o dependență în test, adaugă provider mock pentru service-ul respectiv.
- Dacă Prisma nu găsește câmpul sau modelul, rulează `npx prisma generate`.
- Dacă `migrate status` pică, verifică `DATABASE_URL` și conexiunea la DB.
- Dacă un endpoint primește string pentru dată, convertește în `new Date(...)` înainte de Prisma.
- Dacă adaugi o metodă în controller, adaugă metoda corespondentă în service.
- Dacă schimbi schema DB, nu edita manual baza de date: folosește migrații Prisma.
- În testele de smoke, nu conecta baza reală; folosește mock pentru `PrismaService`.

## Verificări recomandate înainte de commit

```bash
npx prisma validate
npm run build
npm test -- --runInBand
npm run lint
```
