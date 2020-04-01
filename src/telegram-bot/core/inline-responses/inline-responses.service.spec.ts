import { Test, TestingModule } from '@nestjs/testing';
import TelegramBot = require('node-telegram-bot-api');

import { InlineResponsesService } from './inline-responses.service';

import { BotService } from '../bot/bot.service';
import { KeyBoardEventsKeys, InlineQueryMetadataGenerator } from './common';
jest.mock('../bot/bot.service');

describe('InlineResponsesService', () => {
  let service: InlineResponsesService;

  let botService: BotService;
  let bot;

  let event1Fn: jest.Mock;
  let event2Fn: jest.Mock;

  const buildQuery = (
    eventName: string,
    metadata: any,
    chatId = 1,
    messageId = 2,
  ): TelegramBot.CallbackQuery =>
    ({
      id: 'random query id',
      data: InlineQueryMetadataGenerator(
        eventName as KeyBoardEventsKeys,
        metadata,
      ),
      message: {
        chat: {
          id: chatId,
        },
        message_id: messageId,
      },
    } as TelegramBot.CallbackQuery);

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [InlineResponsesService, BotService],
    }).compile();

    botService = module.get<BotService>(BotService);
    service = module.get<InlineResponsesService>(InlineResponsesService);

    bot = botService.bot;
  });

  beforeEach(() => {
    event1Fn = jest.fn();
    event2Fn = jest.fn();

    service.addKeyBoardSubscriber('event1' as KeyBoardEventsKeys, event1Fn);
    service.addKeyBoardSubscriber('event2' as KeyBoardEventsKeys, event2Fn);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should notify the right subscriber when a callback_query event occurs', () => {
    const metadataToSend = '@angular/cli';
    const queryToSend = buildQuery('event1', metadataToSend);

    bot.triggerOn('callback_query', queryToSend);

    expect(event1Fn).toHaveBeenCalledWith(metadataToSend, queryToSend);
    expect(event2Fn).not.toHaveBeenCalled();
  });
});
