import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe } from '@nestjs/common';
import { CatalogService } from './catalog.service';
import { Prisma } from '@prisma/client';

@Controller('catalog')
export class CatalogController {
  constructor(private readonly catalogService: CatalogService) {}

  // ─── RUTARE PIESE ───────────────────────────────────────────────────

  @Get('piese')
  fetchPiese() {
    return this.catalogService.fetchPiese();
  }

  @Post('piese')
  createPiesa(@Body() data: Prisma.PiesaCreateInput) {
    return this.catalogService.createPiesa(data);
  }

  @Patch('piese/:id')
  updatePiesa(@Param('id', ParseIntPipe) id: number, @Body() data: Prisma.PiesaUpdateInput) {
    return this.catalogService.updatePiesa(id, data);
  }

  @Delete('piese/:id')
  deletePiesa(@Param('id', ParseIntPipe) id: number) {
    return this.catalogService.deletePiesa(id);
  }

  // ─── RUTARE MANOPERĂ ────────────────────────────────────────────────

  @Get('manopera')
  fetchManopera() {
    return this.catalogService.fetchManopera();
  }

  @Post('manopera')
  createManopera(@Body() data: Prisma.ManoperaCreateInput) {
    return this.catalogService.createManopera(data);
  }

  @Patch('manopera/:id')
  updateManopera(@Param('id', ParseIntPipe) id: number, @Body() data: Prisma.ManoperaUpdateInput) {
    return this.catalogService.updateManopera(id, data);
  }

  @Delete('manopera/:id')
  deleteManopera(@Param('id', ParseIntPipe) id: number) {
    return this.catalogService.deleteManopera(id);
  }
}