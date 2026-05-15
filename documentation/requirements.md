# Specificații de Cerințe (Requirements) - Sistemul Creanțelor „Service Auto G”

Acest document descrie cerințele funcționale și non-funcționale, actorii sistemului și arhitectura tehnică pentru aplicația **Service Auto G**, un sistem integrat de gestiune a fluxurilor operaționale și a creanțelor (facturare, penalizări, încasări) pentru un service auto.

---

## 1. Descrierea Sistemului
Aplicația este un **Single Page Application (SPA)** dezvoltată pentru a digitaliza și optimiza procesele dintr-un service auto. Sistemul acționează ca un integrator care preia entitățile (Clienți, Vehicule) și rezultatele operaționale (Devize, Comenzi de Service) pentru a genera, urmări și stinge obligații de plată (creanțe), reducând erorile umane prin validări stricte și automatizări financiare.

---

## 2. Arhitectură și Stack Tehnologic

Aplicația folosește o **arhitectură pe trei straturi (3-tier layered architecture)** combinată cu un **MVC adaptat (Headless/API-first pe backend și React Hooks pe frontend)**.

* **Frontend (Stratul de Prezentare):**
    * **Tehnologii:** React 19, TypeScript, Vite.
    * **Stilizare:** Tailwind CSS v4.
    * **Validare & Formulare:** Zod + react-hook-form.
    * **Stare:** Gestiune locală prin `useState`, `useReducer` și `usePageSessionState` pentru sincronizarea cu `sessionStorage`.
* **Backend (Stratul de Logică):**
    * **Tehnologii:** NestJS (Node.js framework).
    * **Validare:** `class-validator` (DTO-uri).
* **Bază de Date (Stratul de Acces la Date):**
    * **Tehnologii:** PostgreSQL (Neon Cloud) + Prisma ORM.

---

## 3. Actorii Sistemului (Utilizatori)

Aplicația diferențiază funcționalitățile și fluxurile în funcție de rolurile din cadrul service-ului:
1.  **Manager:** Acces complet la rapoarte financiare, gestiunea personalului, definirea tarifelor și aplicarea de oferte comerciale/stornări.
2.  **Recepționer (Consilier Service):** Preia clienții, înregistrează vehiculele, deschide comenzi de service, încasează sume și gestionează notificările curente.
3.  **Mecanic:** Actor pasiv în sistem (desemnat din nomenclator), ale cărui date (specializare, cost orar) impactează direct valoarea devizelor estimative.

---

## 4. Cerințe Funcționale

Sistemul este împărțit în **6 module principale independente**, fiecare cu propriile reguli de business și fluxuri de date.

### 4.1. Modulul Nomenclatoare (Catalog)
* **Gestiune Piese Auto:** Adăugare/editare piese (noi cu luni de garanție sau SH cu grad de uzură), stabilire preț de bază, actualizare stoc și avertizări de stoc critic/epuizat.
* **Gestiune Manoperă:** Definirea normelor de lucru, a categoriilor (ex. Mecanică Ușoară) și a timpilor tehnologici.
* **Gestiune Kituri:** Gruparea logică a pieselor pentru operațiuni recurente (ex. Kit Distribuție).

### 4.2. Modulul Entități (Clienți, Vehicule, Angajați, Asiguratori)
* **Gestiune Clienți:** Formulare dinamice (Conditional Rendering) pentru Persoane Fizice (CNP, CI) și Persoane Juridice (CUI, IBAN, Nr. Reg. Comerțului). Posibilitate de soft-delete (arhivare logică).
* **Gestiune Vehicule:** Asocierea strictă a unui autovehicul cu un client (proprietar). Introducere rapidă („Quick Add”) din ecranul de recepție.
* **Gestiune Angajați:** Înrolare mecanic, manager sau recepționer cu câmpuri condiționate (ex. cost orar pentru mecanici).
* **Asiguratori:** Gestiunea partenerilor pentru decontări și dosare de daună.

### 4.3. Modulul Operațional (Recepție & Comenzi)
* **Recepție Vehicul:** Inițierea unei comenzi de service, completarea stării autovehiculului (kilometraj, combustibil via slider interactiv, simptome reclamate).
* **Deviz Estimativ:** Adăugarea de linii de piese și manoperă, calcularea automată a subtotalurilor, TVA-ului și a *Totalului Estimat* în timp real.
* **Gestiune Stări Comandă:** Tranziții de status (ex: „În așteptare diagnoză”, „Așteaptă piese”, „Gata de livrare”).

### 4.4. Modulul Facturare, Oferte și Penalizări
* **Emitere Factură:** Transformarea comenzilor de service finalizate în creanțe fiscale exigibile, cu generarea scadenței și actualizarea soldului debitor al clientului.
* **Ajustări Financiare:** Aplicarea de discounturi procentuale sau fixe (cu recalcularea live a taxelor). Emiterea de documente de *Storno* cu valori negative pentru retururi/corecții.
* **Calcul Penalizări:** Motor de calcul pentru aplicarea dobânzilor penalizatoare la facturile scadente neachitate și emiterea automată a unei facturi de penalizare.

### 4.5. Modulul Încasări (Stingere Creanțe)
* **Înregistrare Plăți:** Introducerea sumelor încasate (Numerar, POS, Bancă).
* **Alocare Flexibilă:** Distribuirea sumei pe una sau mai multe facturi restante ale aceluiași client. Sistemul trebuie să prevină supra-alocarea (validare vizuală imediată).
* **Actualizare Solduri:** Scăderea restului de plată (`restDePlata`) de pe facturi și a soldului debitor general al clientului, schimbând automat statusul facturii în „Achitată” dacă soldul devine 0.

### 4.6. Modulul Notificări și Rapoarte
* **Centrul de Notificări:** Sistem global de alerte pentru utilizatori (facturi scadente depășite, stoc epuizat) și notificări pentru clienți (SMS/Email la finalizarea mașinii). Funcționalități de navigare directă ("Acționabile"), citire și arhivare.
* **Raportare Financiară:**
    * *Aging Report:* Centralizatorul facturilor restante și calculul zilelor de întârziere pe clienți.
    * *Jurnal de Audit / Istoric Facturare:* Trasabilitatea tututor tranzacțiilor financiare (facturi, storno, discounturi).
    * *Cash Flow:* Sumarul încasărilor pe perioade și modalități de plată.

---

## 5. Cerințe Non-Funcționale

1.  **Ergonomie și UI/UX:**
    * Sistemul trebuie să ofere retroacțiune imediată (Immediate feedback) la introducerea datelor (ex: recalcularea instantanee a valorilor financiare).
    * Prevenirea erorilor ireversibile prin implementarea confirmărilor modale (`ConfirmDialog`) pentru operațiuni critice (stornări, dezactivări clienți).
2.  **Validarea și Integritatea Datelor:**
    * Niciun formular nu poate fi trimis (butoane `disabled`) dacă regulile de validare sintactică (Zod) sau de business (sumă alocată > sumă disponibilă) nu sunt îndeplinite.
    * Protejarea bazei de date prin strategii de "Soft Delete" pentru a menține integritatea documentelor financiare istorice.
3.  **Performanță:**
    * Utilizarea paginării în nomenclatoare și tabele mari (Data Grids).
    * Optimizare "Load-once" a filtrelor prin componentizarea stării în memoria browser-ului (`sessionStorage`).
4.  **Securitate și Trasabilitate:**
    * Rutele API backend trebuie să valideze structurile JSON primite (DTO-uri).
    * Orice diminuare de venit (Storno, Oferte Extra) trebuie auditată permanent în istoricul tranzacțiilor.