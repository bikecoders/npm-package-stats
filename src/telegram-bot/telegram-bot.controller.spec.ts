import { Test, TestingModule } from '@nestjs/testing';
import { TelegramBotController } from './telegram-bot.controller';

describe('TelegramBotController', () => {
  let controller: TelegramBotController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TelegramBotController],
    }).compile();

    controller = module.get<TelegramBotController>(TelegramBotController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
