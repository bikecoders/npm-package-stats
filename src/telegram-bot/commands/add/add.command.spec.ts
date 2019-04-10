import { Test, TestingModule } from '@nestjs/testing';

import * as TelegramBot from 'node-telegram-bot-api';

import { AddCommand } from './add.command';
import { UsersService } from '../../../users/service/users.service';
jest.mock('../../../users/service/users.service');
import { NpmStatsService } from '../../../shared/npm-stats/npm-stats.service';
import { NpmStatsService as NpmStatsServiceMock } from '../../../shared/npm-stats/__mocks__/npm-stats.service';
jest.mock('../../../shared/npm-stats/npm-stats.service');

import { BaseCommand as BaseCommandMock } from '../__mocks__/base.command';
import { triggerCommand } from '../__mocks__/utils';
import { BaseCommand } from '../base.command';
jest.mock('../base.command');

import { sendMessageHTML } from '../../common';
jest.mock('../../common/utils/utils');
import { Template } from './common';
import { of } from 'rxjs';

describe('Add', () => {
  let command: AddCommand;

  // Telegram bot instance
  let bot;
  let npmStatsService: NpmStatsService;
  let usersService: UsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NpmStatsService,
        UsersService,
      ],
    }).compile();

    npmStatsService = module.get<NpmStatsService>(NpmStatsService);
    usersService = module.get<UsersService>(UsersService);

    bot = new TelegramBot('randomToken');
    command = new AddCommand(bot, npmStatsService, usersService);
  });

  it('should be defined', () => {
    expect(command).toBeDefined();
  });

  describe('Command', () => {
    const buildMessageReceived = (msg: string) => ({
        chat: { id: 123 },
        text: `/add ${msg}`,
        message_id: 321,
      } as TelegramBot.Message);

    it('should init base command with the right parameters', () => {
      expect((command as unknown as BaseCommandMock).bot).toEqual(bot);
      expect((command as unknown as BaseCommandMock).COMMAND).toEqual(AddCommand.COMMAND);
    });

    describe('PackageSlug Parameter', () => {
      it('should validate the package slug', () => {
        const slug = 'angular';
        const msg = buildMessageReceived(`     ${slug}`);

        triggerCommand(command, msg, null);

        expect((npmStatsService as unknown as NpmStatsServiceMock).slugToValidate).toEqual(slug);
      });

      it('should indicate that the command is malformed', () => {
        const slug = '';
        const msg = buildMessageReceived('');

        triggerCommand(command, msg, null);

        expect(sendMessageHTML).toHaveBeenCalledWith(
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

        triggerCommand(command, msg, null);
      });

      describe('Valid Package', () => {
        let spyAddPackageSpy: jasmine.Spy;

        beforeEach(() => {
          spyAddPackageSpy = spyOn(usersService, 'addPackage').and.returnValue(of({}));
        });

        it('should store in the DB the package', () => {
          (npmStatsService as unknown as NpmStatsServiceMock).validateSlugSuccess();

          expect(spyAddPackageSpy).toHaveBeenCalledWith(msg.chat.id, slug);
        });

        it('should send that the package is valid after write on DB', () => {
          (npmStatsService as unknown as NpmStatsServiceMock).validateSlugSuccess();

          expect(sendMessageHTML).toHaveBeenCalledWith(
            bot,
            msg.chat.id,
            Template.success(slug),
            msg.message_id,
          );
        });
      });

      describe('Invalid Package', () => {
        it('should send that the package wrong, was not found', () => {
          (npmStatsService as unknown as NpmStatsServiceMock).validateSlugFalse();

          expect(sendMessageHTML).toHaveBeenCalledWith(
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
