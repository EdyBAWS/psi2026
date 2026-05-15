# Backend Service Auto G

Backend-ul este un API `NestJS` pentru aplicația `Service Auto G`. El expune endpoint-uri pentru catalog, entități, operațional, facturare, încasări și notificări și persistă datele prin `Prisma` într-o bază `PostgreSQL` / Neon.

## Stack

- NestJS
- TypeScript
- Prisma Client
- PostgreSQL / Neon
- `class-validator`
- Jest

## Ce înseamnă stack-ul backend

### NestJS

NestJS este framework-ul care organizează API-ul. El ne ajută să separăm codul în bucăți clare:

- `module.ts`: grupează controller-ul și service-ul unei zone
- `controller.ts`: expune rutele HTTP
- `service.ts`: conține logica aplicației
- `dto/*.dto.ts`: definește și validează datele primite

Exemplu:

```text
GET /operational/comenzi
  -> OperationalController.getComenzi()
  -> OperationalService.getComenzi()
  -> prisma.comanda.findMany()
```

### Prisma

Prisma este ORM-ul proiectului. ORM înseamnă că lucrăm cu baza de date prin obiecte TypeScript, nu prin SQL scris manual peste tot.

Schema este în:

```text
prisma/schema.prisma
```

Dacă acolo există:

```prisma
model Comanda {
  idComanda    Int    @id @default(autoincrement())
  numarComanda String @unique
}
```

în cod putem folosi:

```ts
prisma.comanda.findMany()
prisma.comanda.create()
```

După modificări în `schema.prisma`, rulează `npx prisma generate` ca Prisma Client să știe noile modele.

### PostgreSQL și Neon

PostgreSQL este baza de date relațională. Neon este serviciul cloud unde este găzduită baza PostgreSQL.

Backend-ul se conectează la DB prin:

```text
DATABASE_URL=...
```

din `backend/.env`.

Relațiile importante sunt definite în Prisma, dar sunt aplicate în PostgreSQL prin migrații.

### Migrații

Migrațiile sunt fișiere SQL generate de Prisma când structura bazei se schimbă. Ele trăiesc în:

```text
prisma/migrations/
```

Nu edita baza manual pentru schimbări de structură. Schimbă `schema.prisma`, creează migrare, apoi rulează `generate`.

### DTO, class-validator și ValidationPipe

DTO-urile sunt contractul request-urilor. Ele spun ce câmpuri acceptă API-ul și ce tipuri trebuie să aibă.

`class-validator` oferă decoratori precum:

```ts
@IsString()
@IsNumber()
@IsEnum(StatusGeneral)
```

`ValidationPipe` aplică aceste reguli global. Cu `whitelist: true`, câmpurile care nu sunt în DTO sunt ignorate.

### Seed data

Seed-ul creează date demo în baza de date:

```text
prisma/seedData.ts
```

Comandă:

```bash
npm run seed
```

Seed-ul este util după resetări sau când vrei să testezi frontend-ul cu date suficiente.

Ce include seed-ul curent:

- 7 asiguratori;
- 9 angajați;
- 10 clienți PF/PJ;
- 16 piese;
- 12 manopere;
- 10 vehicule;
- 7 dosare de daună;
- 8 comenzi de service;
- 6 facturi cu stări diferite;
- 2 încasări alocate pe facturi;
- 8 notificări inițiale.

Notificările seed-uite acoperă cazuri utile pentru UI:

- factură emisă;
- factură restantă;
- plată parțială;
- încasare înregistrată;
- comandă operațională;
- stoc critic.

Rulează seed-ul când vrei să vezi aplicația cu date complete:

```bash
npm run seed
```

Atenție: seed-ul șterge datele demo existente și le recreează.

### Jest

Jest rulează testele backend. Pentru proiectul acesta, testele sunt folosite ca verificări rapide că modulele, controller-ele și service-urile nu s-au rupt.

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
(Include suport pentru câmpul `esteInspector` pentru roluri multiple)

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

La creare, service-ul calculează automat:

- **total fără TVA** (suma brută a articolelor)
- **valoare discount și penalizare** (procente aplicate la subtotal)
- **baza impozabilă** (subtotal - discount + penalizare)
- **TVA (19%)** aplicat la baza impozabilă
- **total general** (baza impozabilă + TVA)

### `incasari`

Gestionează plăți și alocarea sumelor pe facturi.

```text
GET  /incasari
GET  /incasari/facturi-restante
POST /incasari
```

La salvarea unei încasări, backend-ul:

- verifică dacă facturile există;
- verifică dacă facturile aparțin clientului selectat;
- verifică să nu se aloce mai mult decât restul de plată;
- marchează factura ca `Platita` când restul ajunge la zero;
- creează notificare de succes.

### `notificari`

Gestionează notificările persistate în PostgreSQL.

```text
GET    /notificari
POST   /notificari
PATCH  /notificari/:id
DELETE /notificari/:id
```

`GET /notificari` sincronizează și facturile restante: dacă există facturi scadente cu rest de plată, backend-ul creează notificări de avertizare.

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
- `Incasare`
- `IncasareAlocare`
- `Notificare`

Relații importante:

- `Client -> Vehicul`
- `Client -> DosarDauna`
- `Vehicul -> DosarDauna`
- `DosarDauna -> Comanda`
- `Comanda -> Factura`
- `Factura -> FacturaItem`
- `Factura -> IncasareAlocare -> Incasare`
- `Factura -> Notificare`
- `Comanda -> Notificare`

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
