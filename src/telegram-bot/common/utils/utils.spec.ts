import * as TelegramBot from 'node-telegram-bot-api';
import { sendMessageHTML } from './utils';

describe('Utils', () => {
  describe('sendMessageHTML', () => {
    let bot;
    let chatID: number;
    let message: string;
    let replyToMessageId: number;
    let botSendMessageSpy: jasmine.Spy;

    beforeEach(() => {
      bot = new TelegramBot('randomToken');

      chatID = 123;
      message = '<code>Hello World</code>';
      replyToMessageId = 321;
    });

    // spies
    beforeEach(() => {
      const voidPromise = new Promise(() => Promise.resolve(true));

      botSendMessageSpy = spyOn(bot, 'sendMessage').and.returnValue(voidPromise);
    });

    it('should always indicate the parse mode is HTML', () => {
      const optionsUsed = { parse_mode: 'HTML' };

      sendMessageHTML(bot, chatID, message);

      expect(botSendMessageSpy).toHaveBeenCalledWith(
        jasmine.any(Number),
        jasmine.any(String),
        optionsUsed,
      );
    });

    it('should send the message to the correct chat', () => {
      sendMessageHTML(bot, chatID, message);

      expect(botSendMessageSpy).toHaveBeenCalledWith(
        chatID,
        message,
        jasmine.any(Object),
      );
    });

    it('should send the message as a reply', () => {
      const optionsUsed = {
        parse_mode: 'HTML',
        reply_to_message_id: replyToMessageId,
      };

      sendMessageHTML(bot, chatID, message, replyToMessageId);

      expect(botSendMessageSpy).toHaveBeenCalledWith(
        jasmine.any(Number),
        jasmine.any(String),
        optionsUsed,
      );
    });
  });
});
