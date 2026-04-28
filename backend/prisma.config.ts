import { defineConfig } from '@prisma/config';

export default defineConfig({
  datasource: {
    url: process.env.DATABASE_URL,
  },
  migrations: {
    // Schimbăm modul de rulare pentru a evita bug-ul ts-node pe Windows
    seed: 'node -r ts-node/register prisma/seedData.ts',
  },
});