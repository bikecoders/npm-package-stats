import * as TelegramBot from 'node-telegram-bot-api';

import { BaseCommand } from './base.command';
import { generateTelegramBotMessage } from '../../__mocks__/data/telegram-bot-message.mock-data';

describe('Base Command', () => {
  class SomeCommand extends BaseCommand {
    static readonly COMMAND = /\/random/;

    matchTriggered: RegExpExecArray;
    msgTriggered: TelegramBot.Message;
    wasCalled = false;

    constructor(botInstance: TelegramBot) {
      super(botInstance, SomeCommand.COMMAND);
    }

    protected commandFunction(
      msg: TelegramBot.Message,
      match: RegExpExecArray,
    ) {
      this.wasCalled = true;
      this.msgTriggered = msg;
      this.matchTriggered = match;
    }
  }

  let someCommand: SomeCommand;
  // bot instance
  let bot: any;

  beforeEach(() => {
    bot = new TelegramBot('randomToken');
    someCommand = new SomeCommand(bot);
  });

  it('should be defined', () => {
    expect(someCommand).toBeDefined();
  });

  it('should attach right command to the bot command listener', () => {
    expect(bot.getOnTexts(SomeCommand.COMMAND)).toBeTruthy();
  });

  it('should call command function when the right text arrived', () => {
    const msgToSend = generateTelegramBotMessage();
    const matchToSend: RegExpExecArray = {} as RegExpExecArray;

    bot.triggerCallbackOnText(SomeCommand.COMMAND, msgToSend, matchToSend);

    expect(someCommand.wasCalled).toBeTruthy();
    expect(someCommand.msgTriggered).toBe(msgToSend);
    expect(someCommand.matchTriggered).toBe(matchToSend);
  });
});
