import { Test, TestingModule } from '@nestjs/testing';
import { BotService } from './bot.service';

describe('BotService', () => {
  let service: BotService;
  let tokenBot: string;
  // bot instance in service
  let bot: any;

  beforeEach(() => {
    tokenBot = 'random';
    process.env.TELEGRAM_BOT_KEY = tokenBot;
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [BotService],
    }).compile();

    service = module.get<BotService>(BotService);
    bot = service.bot;
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should init the bot', () => {
    expect(bot).toBeDefined();
    expect(bot.token).toEqual(tokenBot);
  });
});
