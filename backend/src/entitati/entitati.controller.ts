import { Controller, Get, Post, Body, Patch, Param, ParseIntPipe } from '@nestjs/common';
import { EntitatiService } from './entitati.service';
import { Prisma, StatusGeneral } from '@prisma/client';

@Controller('entitati')
export class EntitatiController {
  constructor(private readonly entitatiService: EntitatiService) {}

  // ─── RUTARE CLIENȚI ─────────────────────────────────────────────────

  @Get('clienti')
  fetchClienti() {
    return this.entitatiService.fetchClienti();
  }

  @Post('clienti')
  createClient(@Body() data: Prisma.ClientCreateInput) {
    return this.entitatiService.saveClient(data);
  }

  @Patch('clienti/:id')
  updateClient(@Param('id', ParseIntPipe) id: number, @Body() data: Prisma.ClientUpdateInput) {
    return this.entitatiService.updateClient(id, data);
  }

  @Patch('clienti/:id/status')
  schimbaStatusClient(@Param('id', ParseIntPipe) id: number, @Body('status') status: StatusGeneral) {
    return this.entitatiService.schimbaStatusClient(id, status);
  }

  // ─── RUTARE ANGAJAȚI ────────────────────────────────────────────────

  @Get('angajati')
  fetchAngajati() {
    return this.entitatiService.fetchAngajati();
  }

  @Post('angajati')
  createAngajat(@Body() data: Prisma.AngajatCreateInput) {
    return this.entitatiService.saveAngajat(data);
  }

  @Patch('angajati/:id')
  updateAngajat(@Param('id', ParseIntPipe) id: number, @Body() data: Prisma.AngajatUpdateInput) {
    return this.entitatiService.updateAngajat(id, data);
  }

  @Patch('angajati/:id/status')
  schimbaStatusAngajat(@Param('id', ParseIntPipe) id: number, @Body('status') status: StatusGeneral) {
    return this.entitatiService.schimbaStatusAngajat(id, status);
  }

  // ─── RUTARE ASIGURĂTORI ─────────────────────────────────────────────

  @Get('asiguratori')
  fetchAsiguratori() {
    return this.entitatiService.fetchAsiguratori();
  }

  @Post('asiguratori')
  createAsigurator(@Body() data: Prisma.AsiguratorCreateInput) {
    return this.entitatiService.saveAsigurator(data);
  }

  @Patch('asiguratori/:id')
  updateAsigurator(@Param('id', ParseIntPipe) id: number, @Body() data: Prisma.AsiguratorUpdateInput) {
    return this.entitatiService.updateAsigurator(id, data);
  }

  @Patch('asiguratori/:id/status')
  schimbaStatusAsigurator(@Param('id', ParseIntPipe) id: number, @Body('status') status: StatusGeneral) {
    return this.entitatiService.schimbaStatusAsigurator(id, status);
  }
}