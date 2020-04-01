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
import { generateTelegramBotMessage } from '../../../__mocks__/data/telegram-bot-message.mock-data';

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

    describe('PackageSlug Parameter', () => {
      it('should validate the package slug', () => {
        const slug = 'angular';
        const msg = buildMessageReceived(`     ${slug}`);

        ((feature as unknown) as BaseCommandMock).triggerCommand(msg);

        expect(
          ((npmStatsService as unknown) as NpmStatsServiceMock).slugToValidate,
        ).toEqual([slug]);
      });

      it('should indicate that the command is malformed', () => {
        const msg = buildMessageReceived('');

        ((feature as unknown) as BaseCommandMock).triggerCommand(msg);

        expect(sendMessage).toHaveBeenCalledWith(
          bot,
          msg.chat.id,
          Template.wrongCommand,
          msg.message_id,
        );
      });
    });

    describe('Check package', () => {
      let slug: string;
      let msg: TelegramBot.Message;

      beforeEach(() => {
        slug = 'angular';
        msg = buildMessageReceived(slug);

        ((feature as unknown) as BaseCommandMock).triggerCommand(msg);
      });

      describe('Valid Package', () => {
        let spyAddPackageSpy: jasmine.Spy;

        beforeEach(() => {
          spyAddPackageSpy = spyOn(usersService, 'addPackage').and.returnValue(
            of({}),
          );
        });

        it('should store in the DB the package', () => {
          ((npmStatsService as unknown) as NpmStatsServiceMock).validateSlugSuccess();

          expect(spyAddPackageSpy).toHaveBeenCalledWith(msg.chat.id, slug);
        });

        it('should send that the package is valid after write on DB', () => {
          ((npmStatsService as unknown) as NpmStatsServiceMock).validateSlugSuccess();

          expect(sendMessage).toHaveBeenCalledWith(
            bot,
            msg.chat.id,
            Template.success(slug),
            msg.message_id,
          );
        });
      });

      describe('Invalid Package', () => {
        it('should send that the package wrong, was not found', () => {
          ((npmStatsService as unknown) as NpmStatsServiceMock).validateSlugFalse();

          expect(sendMessage).toHaveBeenCalledWith(
            bot,
            msg.chat.id,
            Template.packageNotFound(slug),
            msg.message_id,
          );
        });
      });
    });
  });
});
