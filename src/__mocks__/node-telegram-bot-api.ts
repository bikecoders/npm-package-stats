import * as TelegramBotReal from 'node-telegram-bot-api';
import { Subject } from 'rxjs';

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

  constructor(token: string, constructorOptions?) {
    this.token = token;
    this.constructorOptions = constructorOptions;
  }

  getOnTexts(regex: RegExp): onTextCallback {
    return this.onTextsValue[regex.toString()];
  }

  onText(regex: RegExp, callback: onTextCallback) {
    this.onTextsValue[regex.toString()] = callback;
  }

  sendMessage(chatId: number, message: string, options): Promise<TelegramBotReal.Message> {
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

    msgQueued.indicator$.error(this.errorConstructor(errCode ? errCode : 12345));
    msgQueued.indicator$.complete();
  }

  triggerMessageSentError403() {
    this.triggerMessageSentErrorAny(403);
  }

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
