import TelegramBot = require('node-telegram-bot-api');

import { Publisher } from '../../../../common/utils/observer-pattern/observer-pattern';
import { KeyBoardEventsKeys } from '../common';

export class InlineResponsesService {
  private keyBoardsPublisher: Publisher;

  constructor() {
    this.keyBoardsPublisher = new Publisher();
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

  triggerCallbackQuery(
    event: string,
    metadata: any,
    callbackQuery: TelegramBot.CallbackQuery,
  ) {
    this.keyBoardsPublisher.notifySubscriber(event, metadata, callbackQuery);
  }
}
