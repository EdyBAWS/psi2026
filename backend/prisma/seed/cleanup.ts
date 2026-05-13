import { PrismaClient } from '@prisma/client';

export async function cleanupDatabase(prisma: PrismaClient) {
  console.log('🧹 Curățăm baza de date...');
  await prisma.notificare.deleteMany();
  await prisma.incasareAlocare.deleteMany();
  await prisma.incasare.deleteMany();
  await prisma.facturaItem.deleteMany();
  await prisma.factura.deleteMany();
  await prisma.comanda.deleteMany();
  await prisma.dosarDauna.deleteMany();
  await prisma.vehicul.deleteMany();
  await prisma.piesa.deleteMany();
  await prisma.manopera.deleteMany();
  await prisma.client.deleteMany();
  await prisma.angajat.deleteMany();
  await prisma.asigurator.deleteMany();
  console.log('✅ Baza de date a fost curățată.');
}
