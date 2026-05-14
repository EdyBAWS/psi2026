import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  ParseIntPipe,
} from '@nestjs/common';
import { OperationalService } from './operational.service';
import {
  CreateVehiculDto,
  UpdateVehiculDto,
  CreateDosarDaunaDto,
  UpdateDosarDaunaDto,
  CreateComandaDto,
  UpdateComandaDto,
} from './dto/operational.dto';
import { StatusGeneral } from '@prisma/client';

@Controller('operational')
export class OperationalController {
  constructor(private readonly operationalService: OperationalService) {}

  // --- VEHICULE ---
  @Get('vehicule')
  getVehicule() {
    return this.operationalService.getVehicule();
  }

  @Post('vehicule')
  createVehicul(@Body() data: CreateVehiculDto) {
    return this.operationalService.createVehicul(data);
  }

  @Patch('vehicule/:id')
  updateVehicul(
    @Param('id', ParseIntPipe) id: number,
    @Body() data: UpdateVehiculDto,
  ) {
    return this.operationalService.updateVehicul(id, data);
  }

  @Patch('vehicule/:id/status')
  schimbaStatusVehicul(
    @Param('id', ParseIntPipe) id: number,
    @Body('status') status: StatusGeneral,
  ) {
    return this.operationalService.schimbaStatusVehicul(id, status);
  }

  // --- DOSARE DAUNĂ ---
  @Get('dosare')
  getDosare() {
    return this.operationalService.getDosare();
  }

  @Get('dosare/next-number')
  getNextDosarNumber() {
    return this.operationalService.getNextNumarDosar();
  }

  @Post('dosare')
  createDosar(@Body() data: CreateDosarDaunaDto) {
    return this.operationalService.createDosar(data);
  }

  @Patch('dosare/:id')
  updateDosar(
    @Param('id', ParseIntPipe) id: number,
    @Body() data: UpdateDosarDaunaDto,
  ) {
    return this.operationalService.updateDosar(id, data);
  }

  // --- COMENZI ---
  @Get('comenzi')
  getComenzi() {
    return this.operationalService.getComenzi();
  }

  @Get('comenzi/next-number')
  getNextNumber() {
    return this.operationalService.getNextNumarComanda();
  }

  @Post('comenzi')
  createComanda(@Body() data: CreateComandaDto) {
    return this.operationalService.createComanda(data);
  }

  @Patch('comenzi/:id')
  updateComanda(
    @Param('id', ParseIntPipe) id: number,
    @Body() data: UpdateComandaDto,
  ) {
    return this.operationalService.updateComanda(id, data);
  }

  // --- POZIȚII COMANDĂ ---
  @Get('comenzi/:id/pozitii')
  getPozitiiByComanda(@Param('id', ParseIntPipe) id: number) {
    return this.operationalService.getPozitiiByComanda(id);
  }

  @Get('comenzi-pozitii')
  getAllPozitii() {
    return this.operationalService.getAllPozitii();
  }

  @Post('comenzi/:id/pozitii')
  updatePozitiiComanda(
    @Param('id', ParseIntPipe) id: number,
    @Body() pozitii: any[],
  ) {
    return this.operationalService.updatePozitiiComanda(id, pozitii);
  }
}
