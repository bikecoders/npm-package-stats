import { Test, TestingModule } from '@nestjs/testing';
import TelegramBot = require('node-telegram-bot-api');
import { of } from 'rxjs';

import { RemoveFeature } from './remove-package.feature';

import { UsersService } from '../../../core/users/service/users.service';
jest.mock('../../../core/users/service/users.service');
import { InlineResponsesService } from '../../core/inline-responses/inline-responses.service';
import { InlineResponsesService as InlineResponsesServiceMock } from '../../core/inline-responses/__mocks__/inline-responses.service';
jest.mock('../../core/inline-responses/inline-responses.service');
import { BotService } from '../../core/bot/bot.service';
jest.mock('../../core/bot/bot.service');
import { BaseCommand as BaseCommandMock } from '../__mocks__/base.command';
jest.mock('../base.command');
import {
  generateTelegramBotMessage,
  generateUserWithNPackage,
  generateUserWithEmptyPackages,
  generatePackage,
  generateCallbackQueryMessage,
} from '../../../__mocks__/data';
import { sendMessage } from '../../common';
jest.mock('../../common');
import { Template } from './common';
import { KeyBoardEventsKeys } from '../../../telegram-bot/core/inline-responses/common';
import { IPackage, User } from '../../../core/users/shared/models';

describe('Remove Package Feature', () => {
  let feature: RemoveFeature;

  let botService: BotService;
  let usersService: UsersService;
  let inlineResponsesService: InlineResponsesServiceMock;
  // Telegram bot instance
  let bot;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RemoveFeature,
        BotService,
        UsersService,
        InlineResponsesService,
      ],
    }).compile();

    botService = module.get<BotService>(BotService);
    usersService = module.get<UsersService>(UsersService);
    inlineResponsesService = (module.get<InlineResponsesService>(
      InlineResponsesService,
    ) as unknown) as InlineResponsesServiceMock;

    bot = botService.bot;
    feature = module.get<RemoveFeature>(RemoveFeature);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(feature).toBeDefined();
  });

  describe('Command', () => {
    let messageReceived: TelegramBot.Message;

    const triggerCommand = () => {
      ((feature as unknown) as BaseCommandMock).triggerCommand(messageReceived);
    };

    beforeEach(() => {
      ((sendMessage as unknown) as jest.SpyInstance).mockImplementation(() =>
        of({}),
      );
      messageReceived = generateTelegramBotMessage('/remove_package');
    });

    it('should init base command with the right parameters', () => {
      expect(((feature as unknown) as BaseCommandMock).bot).toEqual(bot);
      expect(((feature as unknown) as BaseCommandMock).COMMAND).toEqual(
        RemoveFeature.COMMAND,
      );
    });

    it("should send the right message when the user doesn't have packages", () => {
      jest
        .spyOn(usersService, 'getUser')
        .mockImplementation(() => of(generateUserWithEmptyPackages()));

      triggerCommand();

      expect(sendMessage).toHaveBeenCalledWith(
        botService.bot,
        messageReceived.chat.id,
        Template.noPackage,
      );
    });

    it('should send the right message when the user have packages', () => {
      jest
        .spyOn(usersService, 'getUser')
        .mockImplementation(() => of(generateUserWithNPackage(4)));

      triggerCommand();

      expect(sendMessage).toHaveBeenCalledWith(
        botService.bot,
        messageReceived.chat.id,
        Template.selectPackageToDelete,
        messageReceived.message_id,
        jasmine.any(Array),
      );
    });

    describe('On Keyboard Response', () => {
      let user: User;

      let packageToDelete: IPackage;
      let callbackQuerySent: TelegramBot.CallbackQuery;

      const triggerKeyboardResponse = (
        metadata: any,
        callbackQuery: TelegramBot.CallbackQuery,
      ) => {
        inlineResponsesService.triggerCallbackQuery(
          KeyBoardEventsKeys.DELETE_PACKAGE,
          metadata,
          callbackQuery,
        );
      };

      beforeEach(() => {
        packageToDelete = generatePackage();

        callbackQuerySent = generateCallbackQueryMessage(
          KeyBoardEventsKeys.DELETE_PACKAGE,
          packageToDelete.npmSlug,
        );
      });

      describe('User has the package', () => {
        let removePackageSpy: jest.Mock;

        beforeEach(() => {
          user = generateUserWithNPackage(4);
          user.addPackage(packageToDelete);

          jest
            .spyOn(usersService, 'getUser')
            .mockImplementation(() => of(user));

          removePackageSpy = jest
            .fn()
            .mockImplementation((_, npmPackageSlug: string) => {
              const newUser = User.toClass(user.toJson());
              newUser.removePackage(npmPackageSlug);

              return of(newUser);
            });
          jest
            .spyOn(usersService, 'removePackage')
            .mockImplementation(removePackageSpy);
        });

        it('should delete the package form the user package list', () => {
          triggerKeyboardResponse(packageToDelete.npmSlug, callbackQuerySent);

          expect(removePackageSpy).toHaveBeenCalledWith(
            callbackQuerySent.message.chat.id,
            packageToDelete.npmSlug,
          );
        });

        it('should answer the keyboard query', () => {
          triggerKeyboardResponse(packageToDelete.npmSlug, callbackQuerySent);

          expect(bot.answerCallbackQuery).toHaveBeenCalledWith({
            callback_query_id: callbackQuerySent.id,
            show_alert: true,
            text: Template.packageRemoved(packageToDelete.npmSlug),
          } as TelegramBot.AnswerCallbackQueryOptions);
        });

        describe('Update Messages After Delete', () => {
          beforeEach(() => {
            user = generateUserWithEmptyPackages();
            user.addPackage(packageToDelete);
          });

          it('should indicate that there is no packages left when the last package was deleted', () => {
            triggerKeyboardResponse(packageToDelete.npmSlug, callbackQuerySent);

            expect(bot.editMessageText).toHaveBeenCalledWith(
              Template.noPackage,
              {
                chat_id: callbackQuerySent.message.chat.id,
                message_id: callbackQuerySent.message.message_id,
              },
            );
          });
        });
      });

      describe('User has NOT the package', () => {
        beforeEach(() => {
          user = generateUserWithEmptyPackages();

          jest
            .spyOn(usersService, 'getUser')
            .mockImplementation(() => of(user));
        });

        it('should send the right message', () => {
          triggerKeyboardResponse(packageToDelete.npmSlug, callbackQuerySent);

          expect(bot.answerCallbackQuery).toHaveBeenCalledWith({
            callback_query_id: callbackQuerySent.id,
            show_alert: true,
            text: Template.packageNoLongerYours(packageToDelete.npmSlug),
          } as TelegramBot.AnswerCallbackQueryOptions);
        });
      });
    });
  });
});
