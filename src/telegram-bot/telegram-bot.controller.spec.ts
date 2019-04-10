import { Test, TestingModule } from '@nestjs/testing';
import { TelegramBotController } from './telegram-bot.controller';

import { UsersService } from '../users/service/users.service';
jest.mock('../users/service/users.service');
import { NpmStatsService } from '../shared/npm-stats/npm-stats.service';

import { AddCommand } from './commands/add/add.command';
jest.mock('./commands/add/add.command');
import { StartCommand } from './commands/start/start.command';
jest.mock('./commands/start/start.command');

describe('TelegramBotController', () => {
  let service: TelegramBotController;
  let userService: UsersService;
  let npmStatsService: NpmStatsService;

  let tokenBot: string;
  // bot instance in service
  let bot: any;

  beforeEach(() => {
    tokenBot = 'random';
    process.env.TELEGRAM_BOT_KEY = tokenBot;
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TelegramBotController,
        UsersService,
        NpmStatsService,
      ],
    }).compile();

    service = module.get<TelegramBotController>(TelegramBotController);
    bot = service.bot;

    // Services
    userService = module.get<UsersService>(UsersService);
    npmStatsService = module.get<NpmStatsService>(NpmStatsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should init the bot', () => {
    expect(bot).toBeDefined();
    expect(bot.token).toEqual(tokenBot);
  });

  describe('Command Listeners', () => {
    it('should init start command', () => {
      expect(StartCommand).toHaveBeenCalledWith(bot, userService);
    });

    it('should init add command', () => {
      expect(AddCommand).toHaveBeenCalledWith(bot, npmStatsService, userService);
    });
  });
});
