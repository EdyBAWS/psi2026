import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function getNextNumarComanda(): Promise<string> {
  const an = new Date().getFullYear();
  const prefix = `CMD-${an}-`;
  
  const comenzi = await prisma.comanda.findMany({
    where: { numarComanda: { startsWith: prefix } },
    select: { numarComanda: true },
  });

  let maxNr = 0;
  for (const c of comenzi) {
    const nrStr = c.numarComanda.replace(prefix, '');
    const nr = parseInt(nrStr, 10);
    if (!isNaN(nr) && nr > maxNr) { maxNr = nr; }
  }

  const nextId = maxNr + 1;
  return `${prefix}${String(nextId).padStart(3, '0')}`;
}

async function main() {
  const next = await getNextNumarComanda();
  console.log('Urmatorul numar:', next);
}
main().finally(() => prisma.$disconnect());
