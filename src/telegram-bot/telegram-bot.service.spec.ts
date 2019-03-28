import { Test, TestingModule } from '@nestjs/testing';
import { TelegramBotService } from './telegram-bot.service';

import { NEVER, of } from 'rxjs';

import * as TelegramBot from 'node-telegram-bot-api';

import * as Messages from '../shared/messages.template';
import { User } from '../models/user.interface';
import { UsersService } from '../users/users.service';

jest.mock('../users/users.service');

describe('TelegramBotService', () => {
  let service: TelegramBotService;
  let userService: UsersService;

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
        TelegramBotService,
        UsersService,
      ],
    }).compile();

    service = module.get<TelegramBotService>(TelegramBotService);
    userService = module.get<UsersService>(UsersService);
    bot = service.bot;
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should init the bot', () => {
    expect(bot).toBeDefined();
    expect(bot.token).toEqual(tokenBot);
  });

  describe('Command Listeners', () => {
    describe('Start', () => {
      let newUserId;
      let messageReceived: TelegramBot.Message;

      beforeEach(() => {
        newUserId = 123;
        messageReceived = {
          chat: {
            id: newUserId,
          },
        } as TelegramBot.Message;
      });

      it('should attach start listener', () => {
        expect(bot.getOnTexts(service.startCommand)).toBeTruthy();
      });

      it('should try create the user', () => {
        const createSpy = spyOn(userService, 'create').and.returnValue(NEVER);
        bot.triggerCallbackOnText(service.startCommand, messageReceived);

        expect(createSpy).toHaveBeenCalledWith({ chatId: newUserId.toString() } as User);
      });

      it('should reply welcome message', () => {
        spyOn(userService, 'create').and.returnValue(of({}));
        const botSendMessageSpy = spyOn(bot, 'sendMessage');

        bot.triggerCallbackOnText(service.startCommand, messageReceived);

        expect(botSendMessageSpy).toHaveBeenCalledWith(
          messageReceived.chat.id,
          Messages.welcome,
          { parse_mode: 'Markdown' },
        );
      });
    });
  });

});
