import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config'; // <-- Adaugă asta
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { CatalogModule } from './catalog/catalog.module';
import { EntitatiModule } from './entitati/entitati.module';
import { FacturareModule } from './facturare/facturare.module';
import { OperationalModule } from './operational/operational.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }), // <-- Adaugă asta prima
    PrismaModule,
    CatalogModule,
    EntitatiModule,
    FacturareModule,
    OperationalModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}