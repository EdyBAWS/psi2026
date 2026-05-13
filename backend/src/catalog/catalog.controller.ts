import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
} from '@nestjs/common';
import { CatalogService } from './catalog.service';
import { CreateManoperaDto, CreatePiesaDto, CreateKitDto } from './dto/create-catalog.dto';
import { UpdateManoperaDto, UpdatePiesaDto, UpdateKitDto } from './dto/update-catalog.dto';

@Controller('catalog')
export class CatalogController {
  constructor(private readonly catalogService: CatalogService) {}

  // ─── RUTARE PIESE ───────────────────────────────────────────────────

  @Get('piese')
  fetchPiese() {
    return this.catalogService.fetchPiese();
  }

  @Get('piese/:id/istoric')
  fetchIstoricPiesa(@Param('id', ParseIntPipe) id: number) {
    return this.catalogService.fetchIstoricPiesa(id);
  }

  @Post('piese')
  createPiesa(@Body() data: CreatePiesaDto) {
    return this.catalogService.createPiesa(data);
  }

  @Patch('piese/:id')
  updatePiesa(
    @Param('id', ParseIntPipe) id: number,
    @Body() data: UpdatePiesaDto,
  ) {
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
  createManopera(@Body() data: CreateManoperaDto) {
    return this.catalogService.createManopera(data);
  }

  @Patch('manopera/:id')
  updateManopera(
    @Param('id', ParseIntPipe) id: number,
    @Body() data: UpdateManoperaDto,
  ) {
    return this.catalogService.updateManopera(id, data);
  }

  @Delete('manopera/:id')
  deleteManopera(@Param('id', ParseIntPipe) id: number) {
    return this.catalogService.deleteManopera(id);
  }

  // ─── RUTARE KITURI ────────────────────────────────────────────────────

  @Get('kituri')
  fetchKituri() {
    return this.catalogService.fetchKituri();
  }

  @Post('kituri')
  createKit(@Body() data: CreateKitDto) {
    return this.catalogService.createKit(data);
  }

  @Patch('kituri/:id')
  updateKit(
    @Param('id', ParseIntPipe) id: number,
    @Body() data: UpdateKitDto,
  ) {
    return this.catalogService.updateKit(id, data);
  }

  @Delete('kituri/:id')
  deleteKit(@Param('id', ParseIntPipe) id: number) {
    return this.catalogService.deleteKit(id);
  }
}
