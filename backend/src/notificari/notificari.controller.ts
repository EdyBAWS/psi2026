import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { NotificariService } from './notificari.service';
import { CreateNotificareDto, UpdateNotificareDto } from './dto/notificari.dto';

@Controller('notificari')
export class NotificariController {
  constructor(private readonly notificariService: NotificariService) {}

  @Get()
  findAll() {
    return this.notificariService.findAll();
  }

  @Post()
  create(@Body() data: CreateNotificareDto) {
    return this.notificariService.create(data);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() data: UpdateNotificareDto,
  ) {
    return this.notificariService.update(id, data);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.notificariService.remove(id);
  }
}
