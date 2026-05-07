import { Body, Controller, Get, Post } from '@nestjs/common';
import { IncasariService } from './incasari.service';
import { CreateIncasareDto } from './dto/incasari.dto';

@Controller('incasari')
export class IncasariController {
  constructor(private readonly incasariService: IncasariService) {}

  @Get()
  findAll() {
    return this.incasariService.findAll();
  }

  @Get('facturi-restante')
  fetchFacturiRestante() {
    return this.incasariService.fetchFacturiRestante();
  }

  @Post()
  create(@Body() dto: CreateIncasareDto) {
    return this.incasariService.create(dto);
  }
}
