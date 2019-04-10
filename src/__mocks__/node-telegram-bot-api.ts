import * as TelegramBotReal from 'node-telegram-bot-api';

type onTextCallback = (msg: TelegramBotReal.Message, match) => void;

interface IOnTextTelegramBot {
  [id: string]: onTextCallback;
}

class TelegramBot {
  public token: string;
  public constructorOptions;

  private onTextsValue: IOnTextTelegramBot = {};

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

  // tslint:disable-next-line: no-empty
  sendMessage(chatId: string | number, message: string, options) { }

  triggerCallbackOnText(id: RegExp, msg: TelegramBotReal.Message, match?) {
    this.onTextsValue[id.toString()](msg, match);
  }
}

export = TelegramBot;
