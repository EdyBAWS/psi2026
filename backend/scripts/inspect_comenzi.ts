import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
  const comenzi = await prisma.comanda.findMany({
    select: { 
      idComanda: true, 
      numarComanda: true, 
      mecanici: { select: { nume: true, prenume: true } } 
    },
    orderBy: { idComanda: 'asc' }
  });
  console.log(JSON.stringify(comenzi, null, 2));
}
main().finally(() => prisma.$disconnect());
