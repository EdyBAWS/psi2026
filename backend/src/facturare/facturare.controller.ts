import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { FacturareService } from './facturare.service';
import { CreateFacturareDto } from './dto/create-facturare.dto';
import { UpdateFacturareDto } from './dto/update-facturare.dto';

@Controller('facturare')
export class FacturareController {
  constructor(private readonly facturareService: FacturareService) {}

  @Post()
  create(@Body() createFacturareDto: CreateFacturareDto) {
    return this.facturareService.create(createFacturareDto);
  }

  @Get()
  findAll() {
    return this.facturareService.findAll();
  }

  @Get('next-number')
  getNextNumber() {
    return this.facturareService.getNextNumber();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.facturareService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateFacturareDto: UpdateFacturareDto,
  ) {
    return this.facturareService.update(+id, updateFacturareDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.facturareService.remove(+id);
  }
}
