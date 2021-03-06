import * as TelegramBotReal from 'node-telegram-bot-api';
import { Subject } from 'rxjs';
import { Publisher } from '../common/utils/observer-pattern/observer-pattern';

type onTextCallback = (msg: TelegramBotReal.Message, match) => void;

interface IOnTextTelegramBot {
  [id: string]: onTextCallback;
}

interface IMessageQueue {
  message: string;
  chatId: number;
  indicator$: Subject<TelegramBotReal.Message>;
}

class TelegramBot {
  public token: string;
  public constructorOptions;

  private onTextsValue: IOnTextTelegramBot = {};

  private messageQueue: IMessageQueue[] = [];

  private publisher: Publisher;

  constructor(token: string, constructorOptions?) {
    this.token = token;
    this.constructorOptions = constructorOptions;
    this.publisher = new Publisher();
  }

  getOnTexts(regex: RegExp): onTextCallback {
    return this.onTextsValue[regex.toString()];
  }

  onText(regex: RegExp, callback: onTextCallback) {
    this.onTextsValue[regex.toString()] = callback;
  }

  sendMessage(
    chatId: number,
    message: string,
  ): Promise<TelegramBotReal.Message> {
    const messageProm$ = new Subject<TelegramBotReal.Message>();

    this.messageQueue.push({
      chatId,
      message,
      indicator$: messageProm$,
    });

    return messageProm$.toPromise();
  }

  triggerCallbackOnText(id: RegExp, msg: TelegramBotReal.Message, match?) {
    this.onTextsValue[id.toString()](msg, match);
  }

  triggerMessageSent() {
    const msgQueued = this.messageQueue.pop();
    const msg = {
      message_id: Math.random(),
      date: new Date().getTime(),
      text: msgQueued.message,
      chat: {
        id: msgQueued.chatId,
      } as TelegramBotReal.Chat,
    } as TelegramBotReal.Message;

    msgQueued.indicator$.next(msg);
    msgQueued.indicator$.complete();
  }

  triggerMessageSentErrorAny(errCode?: number) {
    const msgQueued = this.messageQueue.pop();

    msgQueued.indicator$.error(
      this.errorConstructor(errCode ? errCode : 12345),
    );
    msgQueued.indicator$.complete();
  }

  triggerMessageSentError403() {
    this.triggerMessageSentErrorAny(403);
  }

  on(event: string, listener: (query: TelegramBotReal.CallbackQuery) => void) {
    this.publisher.addSubscriber(event, listener);
  }

  triggerOn(event: string, param: TelegramBotReal.CallbackQuery) {
    this.publisher.notifySubscriber(event, param);
  }

  answerInlineQuery = jest.fn().mockImplementation(() => Promise.resolve());
  answerCallbackQuery = jest.fn().mockImplementation(() => Promise.resolve());
  editMessageReplyMarkup = jest
    .fn()
    .mockImplementation(() => Promise.resolve());
  editMessageText = jest.fn().mockImplementation(() => Promise.resolve());

  onReplyToMessagePublisher = new Publisher();
  onReplyToMessageNotify = (msg: TelegramBotReal.Message) => {
    this.onReplyToMessagePublisher.notifySubscriber(
      `${msg.chat.id}${msg.message_id}`,
      msg,
    );
  };
  onReplyToMessage = jest
    .fn()
    .mockImplementation(
      (
        chatId: number,
        messageId: number,
        callback: (msg: TelegramBotReal.Message) => void,
      ) => {
        this.onReplyToMessagePublisher.addSubscriber(
          `${chatId}${messageId}`,
          callback,
        );
      },
    );

  private errorConstructor(errCode: number) {
    return {
      response: {
        body: {
          error_code: errCode,
        },
      },
    };
  }
}

export = TelegramBot;
