import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('health')
  healthCheck(): any {
    for ( let i = 0, j = 0; i < 10; i++) {
      j = i;
    }

    return this.appService.getHealthCheck()
  }
}
