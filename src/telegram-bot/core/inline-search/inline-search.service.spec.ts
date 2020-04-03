import { Test, TestingModule } from '@nestjs/testing';
import { of } from 'rxjs';

import { InlineSearchService } from './inline-search.service';
import { BotService } from '../bot/bot.service';
jest.mock('../bot/bot.service');
import { NpmStatsService } from '../../../core/npm-stats/npm-stats.service';
import { NpmStatsService as NpmStatsServiceMock } from '../../../core/npm-stats/__mocks__/npm-stats.service';
import TelegramBot = require('node-telegram-bot-api');
jest.mock('../../../core/npm-stats/npm-stats.service');
import { generateInlineQueryMessage } from '../../../__mocks__/data';
import { answerSingleArticleInlineQuery } from '../../../telegram-bot/common';
jest.mock('../../../telegram-bot/common');

describe('InlineSearchService', () => {
  let service: InlineSearchService;

  let botService: BotService;
  let npmStatsService: NpmStatsService;
  let bot;

  let query: TelegramBot.InlineQuery;
  let packageSlug: string;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [InlineSearchService, BotService, NpmStatsService],
    }).compile();

    botService = module.get<BotService>(BotService);
    npmStatsService = module.get<NpmStatsService>(NpmStatsService);
    service = module.get<InlineSearchService>(InlineSearchService);

    bot = botService.bot;
  });

  beforeEach(() => {
    query = generateInlineQueryMessage();
    packageSlug = query.query.trim().split(' ')[0];

    bot.triggerOn('inline_query', query);

    ((answerSingleArticleInlineQuery as unknown) as jest.SpyInstance).mockImplementation(
      () => of(true),
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should validate the package slug', () => {
    expect(npmStatsService.validateSlug).toHaveBeenCalledWith(packageSlug);
  });

  describe('Valid Package', () => {
    beforeEach(() => {
      ((npmStatsService as unknown) as NpmStatsServiceMock).validateSlugSuccess();
    });

    it('should get the stats for yesterday', () => {
      expect(npmStatsService.getStatsForYesterday).toHaveBeenCalledWith(
        packageSlug,
      );
    });

    it('should answer the inline query with the stats for yesterday', () => {
      ((npmStatsService as unknown) as NpmStatsServiceMock).getStatsForYesterdaySuccess();

      expect(answerSingleArticleInlineQuery).toHaveBeenCalledWith(
        bot,
        query,
        packageSlug,
        `Yesterday's Downloads of "${packageSlug}" 📦`,
        jasmine.any(String),
        jasmine.any(String),
      );
    });
  });

  describe('Invalid Package', () => {
    beforeEach(() => {
      ((npmStatsService as unknown) as NpmStatsServiceMock).validateSlugFalse();
    });

    it("should answer the inline query indicating that the package doesn't exits", () => {
      expect(answerSingleArticleInlineQuery).toHaveBeenCalledWith(
        bot,
        query,
        '0',
        `Package "${packageSlug}" doesn't exists`,
        jasmine.any(String),
        jasmine.any(String),
      );
    });
  });
});
