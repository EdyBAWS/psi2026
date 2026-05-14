import { Controller, Delete } from '@nestjs/common';
import { DemoService } from './demo.service';

@Controller('demo')
export class DemoController {
  constructor(private readonly demoService: DemoService) {}

  @Delete('cleanup')
  async cleanup() {
    return this.demoService.cleanupDatabase();
  }
}
