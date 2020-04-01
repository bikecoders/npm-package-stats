import { Test, TestingModule } from '@nestjs/testing';

import * as TelegramBot from 'node-telegram-bot-api';

import { NEVER, of } from 'rxjs';

import { Template } from './common';
import { sendMessage } from '../../common';
jest.mock('../../common/utils/utils');

import { StartFeature } from './start.feature';

jest.mock('../../../core/npm-stats/npm-stats.service');
import { UsersService } from '../../../core/users/service/users.service';
jest.mock('../../../core/users/service/users.service');
import { BotService } from '../../core/bot/bot.service';
jest.mock('../../core/bot/bot.service');
import { User } from '../../../core/users/shared/models/user.model';

import { BaseCommand as BaseCommandMock } from '../__mocks__/base.command';
jest.mock('../base.command');

describe('Start', () => {
  let feature: StartFeature;

  let botService: BotService;
  let usersService: UsersService;
  // Telegram bot instance
  let bot;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [StartFeature, BotService, UsersService],
    }).compile();

    botService = module.get<BotService>(BotService);
    usersService = module.get<UsersService>(UsersService);

    bot = botService.bot;
    feature = module.get<StartFeature>(StartFeature);
  });

  it('should be defined', () => {
    expect(feature).toBeDefined();
  });

  describe('Command', () => {
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

    it('should init base command with the right parameters', () => {
      expect(((feature as unknown) as BaseCommandMock).bot).toEqual(bot);
      expect(((feature as unknown) as BaseCommandMock).COMMAND).toEqual(
        StartFeature.COMMAND,
      );
    });

    it('should try create the user', () => {
      const createSpy = spyOn(usersService, 'create').and.returnValue(NEVER);

      ((feature as unknown) as BaseCommandMock).triggerCommand(messageReceived);

      expect(createSpy).toHaveBeenCalledWith(new User(newUserId));
    });

    it('should send the welcome message', () => {
      spyOn(usersService, 'create').and.returnValue(of({}));

      ((feature as unknown) as BaseCommandMock).triggerCommand(messageReceived);

      expect(sendMessage).toHaveBeenCalledWith(
        bot,
        messageReceived.chat.id,
        Template.welcome,
      );
    });
  });
});
