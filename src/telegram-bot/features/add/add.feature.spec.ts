import { Test, TestingModule } from '@nestjs/testing';

import { of } from 'rxjs';

import * as TelegramBot from 'node-telegram-bot-api';

import { NpmStatsService } from '../../../core/npm-stats/npm-stats.service';
jest.mock('../../../core/npm-stats/npm-stats.service');
import { NpmStatsService as NpmStatsServiceMock } from '../../../core/npm-stats/__mocks__/npm-stats.service';
import { UsersService } from '../../../core/users/service/users.service';
jest.mock('../../../core/users/service/users.service');
import { BotService } from '../../core/bot/bot.service';
jest.mock('../../core/bot/bot.service');

import { AddFeature } from './add.feature';

import { BaseCommand as BaseCommandMock } from '../__mocks__/base.command';
jest.mock('../base.command');

import { sendMessage } from '../../common';
jest.mock('../../common/utils/utils');
import { Template } from './common';
import {
  generateTelegramBotMessage,
  generateUserWithNPackage,
} from '../../../__mocks__/data';

describe('AddFeature', () => {
  let feature: AddFeature;

  let botService: BotService;
  let npmStatsService: NpmStatsService;
  let usersService: UsersService;
  // Telegram bot instance
  let bot;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AddFeature, BotService, NpmStatsService, UsersService],
    }).compile();

    botService = module.get<BotService>(BotService);
    npmStatsService = module.get<NpmStatsService>(NpmStatsService);
    usersService = module.get<UsersService>(UsersService);

    bot = botService.bot;
    feature = module.get<AddFeature>(AddFeature);
  });

  it('should be defined', () => {
    expect(feature).toBeDefined();
  });

  describe('Command', () => {
    const buildMessageReceived = (msg: string) =>
      generateTelegramBotMessage(`/add ${msg}`);

    it('should init base command with the right parameters', () => {
      expect(((feature as unknown) as BaseCommandMock).bot).toEqual(bot);
      expect(((feature as unknown) as BaseCommandMock).COMMAND).toEqual(
        AddFeature.COMMAND,
      );
    });

    describe('Add indicating package', () => {
      let slug: string;
      let msg: TelegramBot.Message;

      beforeEach(() => {
        slug = '@angular/cli';
        msg = buildMessageReceived(slug);

        ((feature as unknown) as BaseCommandMock).triggerCommand(msg);
      });

      describe('Adding the Package', () => {
        describe('Invalid Slug', () => {
          it("should send that the package wrong, it wasn't found", () => {
            ((npmStatsService as unknown) as NpmStatsServiceMock).validateSlugFalse();

            expect(sendMessage).toHaveBeenCalledWith(
              bot,
              msg.chat.id,
              Template.packageNotFound(slug),
              msg.message_id,
            );
          });
        });

        describe('Valid Slug', () => {
          beforeEach(() => {
            jest
              .spyOn(usersService, 'addPackage')
              .mockImplementation((chatId: number, packageSlug: string) => {
                const randomUser = generateUserWithNPackage(4, chatId);
                randomUser.addPackage({ npmSlug: packageSlug });

                return of(randomUser);
              });

            ((npmStatsService as unknown) as NpmStatsServiceMock).validateSlugSuccess();
          });

          it('should add the package', () => {
            expect(usersService.addPackage).toHaveBeenCalledWith(
              msg.chat.id,
              slug,
            );
          });

          it('should send the success message', () => {
            expect(sendMessage).toHaveBeenCalledWith(
              bot,
              msg.chat.id,
              Template.success(slug),
              msg.message_id,
            );
          });
        });
      });
    });

    describe('Add without indicating package', () => {
      let slug: string;
      let principalMsg: TelegramBot.Message;
      let replyMsg: TelegramBot.Message;

      beforeEach(() => {
        slug = '@angular/cli';
        principalMsg = buildMessageReceived('');
        replyMsg = generateTelegramBotMessage(slug, 988766544312);

        ((sendMessage as unknown) as jest.SpyInstance).mockImplementation(() =>
          of(replyMsg),
        );

        ((feature as unknown) as BaseCommandMock).triggerCommand(principalMsg);
      });

      it('should ask for the package', () => {
        expect(sendMessage).toHaveBeenCalledWith(
          bot,
          principalMsg.chat.id,
          Template.tellMeThePackage,
          principalMsg.message_id,
          null,
          true,
        );
      });

      describe('Adding The package on Reply', () => {
        beforeEach(() => {
          bot.onReplyToMessageNotify(replyMsg);
        });

        describe('Invalid Slug', () => {
          it("should send that the package wrong, it wasn't found", () => {
            ((npmStatsService as unknown) as NpmStatsServiceMock).validateSlugFalse();

            expect(sendMessage).toHaveBeenCalledWith(
              bot,
              replyMsg.chat.id,
              Template.packageNotFound(slug),
              replyMsg.message_id,
            );
          });
        });

        describe('Valid Slug', () => {
          beforeEach(() => {
            jest
              .spyOn(usersService, 'addPackage')
              .mockImplementation((chatId: number, packageSlug: string) => {
                const randomUser = generateUserWithNPackage(4, chatId);
                randomUser.addPackage({ npmSlug: packageSlug });

                return of(randomUser);
              });

            ((npmStatsService as unknown) as NpmStatsServiceMock).validateSlugSuccess();
          });

          it('should add the package', () => {
            expect(usersService.addPackage).toHaveBeenCalledWith(
              replyMsg.chat.id,
              slug,
            );
          });

          it('should send the success message', () => {
            expect(sendMessage).toHaveBeenCalledWith(
              bot,
              replyMsg.chat.id,
              Template.success(slug),
              replyMsg.message_id,
            );
          });
        });
      });
    });
  });
});
