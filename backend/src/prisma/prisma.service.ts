import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  constructor() {
    // Verificăm doar dacă variabila de mediu există
    if (!process.env.DATABASE_URL) {
      throw new Error('DATABASE_URL is not defined in .env file');
    }

    // Apelăm constructorul de bază al PrismaClient
    super();
  }

  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
