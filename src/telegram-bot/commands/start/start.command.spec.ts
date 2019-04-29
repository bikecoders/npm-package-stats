import { Test, TestingModule } from '@nestjs/testing';

import * as TelegramBot from 'node-telegram-bot-api';

import { NEVER, of } from 'rxjs';

import { Template } from './common';
import { sendMessageHTML } from '../../common';
jest.mock('../../common/utils/utils');

import { StartCommand } from './start.command';
import { UsersService } from '../../../users/service/users.service';
jest.mock('../../../users/service/users.service');
import { User } from '../../../users/shared/models';

import { BaseCommand as BaseCommandMock } from '../__mocks__/base.command';
import { BaseCommand } from '../base.command';
jest.mock('../base.command');

describe('Start', () => {
  let command: StartCommand;
  // Telegram bot instance
  let bot;
  let userService: UsersService;

  beforeEach(() => {
    beforeEach(async () => {
      const module: TestingModule = await Test.createTestingModule({
        providers: [
          UsersService,
        ],
      }).compile();

      userService = module.get<UsersService>(UsersService);
    });

    bot = new TelegramBot('randomToken');
    command = new StartCommand(bot, userService);
  });

  it('should be defined', () => {
    expect(command).toBeDefined();
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
      expect((command as unknown as BaseCommandMock).bot).toEqual(bot);
      expect((command as unknown as BaseCommandMock).COMMAND).toEqual(StartCommand.COMMAND);
    });

    it('should try create the user', () => {
      const createSpy = spyOn(userService, 'create').and.returnValue(NEVER);

      (command as unknown as BaseCommandMock).triggerCommand(messageReceived);

      expect(createSpy).toHaveBeenCalledWith(new User(newUserId));
    });

    it('should send the welcome message', () => {
      spyOn(userService, 'create').and.returnValue(of({}));

      (command as unknown as BaseCommandMock).triggerCommand(messageReceived);

      expect(sendMessageHTML).toHaveBeenCalledWith(
        bot,
        messageReceived.chat.id,
        Template.welcome,
      );
    });
  });

});
