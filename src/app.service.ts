import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHealthCheck(): any {
    return {
      status: true,
      message: "I'm ok, thank you",
    };
  }
}
