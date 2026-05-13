import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { cleanupDatabase } from './cleanup';
import { seedAsiguratori } from './asiguratori';
import { seedAngajati } from './angajati';
import { seedClienti } from './clienti';
import { seedPiese } from './piese';
import { seedManopere } from './manopere';
import { seedVehicule } from './vehicule';
import { seedDosareDauna } from './dosareDauna';
import { seedComenzi } from './comenzi';
import { seedFacturi } from './facturi';
import { seedIncasari } from './incasari';
import { seedNotificari } from './notificari';
import { seedKituri } from './kituri';

const prisma = new PrismaClient();
const args = process.argv.slice(2);
const moduleArg = args[0];

async function main() {
  try {
    if (!moduleArg) {
      console.log(
        '🚀 Rulăm seed-ul complet (toate modulele, în ordinea corectă)...',
      );
      await cleanupDatabase(prisma);
      await seedAsiguratori(prisma);
      await seedAngajati(prisma);
      await seedClienti(prisma);
      await seedPiese(prisma);
      await seedKituri(prisma);
      await seedManopere(prisma);
      await seedVehicule(prisma);
      await seedDosareDauna(prisma);
      await seedComenzi(prisma);
      await seedFacturi(prisma);
      await seedIncasari(prisma);
      await seedNotificari(prisma);
    } else {
      switch (moduleArg) {
        case 'cleanup':
          await cleanupDatabase(prisma);
          break;
        case 'asiguratori':
          await seedAsiguratori(prisma);
          break;
        case 'angajati':
          await seedAngajati(prisma);
          break;
        case 'clienti':
          await seedClienti(prisma);
          break;
        case 'piese':
          await seedPiese(prisma);
          break;
        case 'kituri':
          await seedKituri(prisma);
          break;
        case 'manopere':
          await seedManopere(prisma);
          break;
        case 'referinta':
          console.log('📚 Populăm datele de referință (fără date operaționale)...');
          await cleanupDatabase(prisma);
          await seedAsiguratori(prisma);
          await seedAngajati(prisma);
          await seedClienti(prisma);
          await seedPiese(prisma);
          await seedKituri(prisma);
          await seedManopere(prisma);
          await seedVehicule(prisma);
          break;
        case 'vehicule':
          await seedVehicule(prisma);
          break;
        case 'dosaredauna':
          await seedDosareDauna(prisma);
          break;
        case 'comenzi':
          await seedComenzi(prisma);
          break;
        case 'facturi':
          await seedFacturi(prisma);
          break;
        case 'incasari':
          await seedIncasari(prisma);
          break;
        case 'notificari':
          await seedNotificari(prisma);
          break;
        default:
          console.error(`❌ Modulul "${moduleArg}" nu a fost găsit.`);
          process.exit(1);
      }
    }
    console.log('\n🎉 Seed finalizat cu succes!');
  } catch (error) {
    console.error('\n❌ Eroare fatală la rularea seed-ului:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

void main();
