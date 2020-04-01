import { Injectable } from '@nestjs/common';
import TelegramBot = require('node-telegram-bot-api');

import { Publisher } from '../../../common/utils/observer-pattern/observer-pattern';
import { BotService } from '../bot/bot.service';
import { IKeyBoardEvent, KeyBoardEventsKeys } from './common';

@Injectable()
export class InlineResponsesService {
  private keyBoardsPublisher: Publisher;

  constructor(private botService: BotService) {
    this.keyBoardsPublisher = new Publisher();

    this.botService.bot.on('callback_query', query => {
      const data = JSON.parse(query.data) as IKeyBoardEvent;

      this.keyBoardsPublisher.notifySubscriber(data.id, data.metadata, query);
    });
  }

  addKeyBoardSubscriber(
    event: KeyBoardEventsKeys,
    executor: (metadata: any, callbackQuery: TelegramBot.CallbackQuery) => void,
  ) {
    this.keyBoardsPublisher.addSubscriber(
      (event as unknown) as string,
      executor,
    );
  }
}
