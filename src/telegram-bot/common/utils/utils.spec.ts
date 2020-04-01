import * as TelegramBot from 'node-telegram-bot-api';

import { Observable, NEVER, Subscription } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { sendMessage } from './utils';

describe('Utils', () => {
  describe('sendMessage', () => {
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
      botSendMessageSpy = spyOn(bot, 'sendMessage').and.callThrough();
    });

    it('should always indicate the parse mode is HTML', () => {
      const optionsUsed: TelegramBot.SendMessageOptions = {
        parse_mode: 'HTML',
      };

      sendMessage(bot, chatID, message);

      expect(botSendMessageSpy).toHaveBeenCalledWith(
        jasmine.any(Number),
        jasmine.any(String),
        optionsUsed,
      );
    });

    it('should send the message to the correct chat', () => {
      sendMessage(bot, chatID, message);

      expect(botSendMessageSpy).toHaveBeenCalledWith(
        chatID,
        message,
        jasmine.any(Object),
      );
    });

    describe('Reply', () => {
      it('should send the message as a reply', () => {
        const optionsUsed: TelegramBot.SendMessageOptions = {
          parse_mode: 'HTML',
          reply_to_message_id: replyToMessageId,
        };

        sendMessage(bot, chatID, message, replyToMessageId);

        expect(botSendMessageSpy).toHaveBeenCalledWith(
          jasmine.any(Number),
          jasmine.any(String),
          optionsUsed,
        );
      });
    });

    describe('Inline Keyboard', () => {
      const buildKey = (text: string): TelegramBot.InlineKeyboardButton => ({
        text,
        callback_data: text,
      });

      it('should the message as an Inline Keyboard', () => {
        const keyboard: TelegramBot.InlineKeyboardButton[][] = [
          [buildKey('1'), buildKey('2')],
          [buildKey('3'), buildKey('4')],
        ];
        const optionsUsed: TelegramBot.SendMessageOptions = {
          parse_mode: 'HTML',
          reply_to_message_id: null,
          reply_markup: {
            inline_keyboard: keyboard,
          },
        };

        sendMessage(bot, chatID, message, null, keyboard);

        expect(botSendMessageSpy).toHaveBeenCalledWith(
          jasmine.any(Number),
          jasmine.any(String),
          optionsUsed,
        );
      });
    });

    describe('Function Return', () => {
      let sent$: Observable<TelegramBot.Message | any>;

      beforeEach(() => {
        sent$ = sendMessage(bot, chatID, message);
      });

      it('should return an observable that emits the message when is sent', () => {
        expect(sent$ instanceof Observable).toBeTruthy();
      });

      it('should return the msg sent', done => {
        let messageSent: TelegramBot.Message;

        sent$.subscribe({
          next: msg => {
            messageSent = msg;

            expect(messageSent).not.toEqual(message);
            expect(messageSent.chat.id).toEqual(chatID);
          },
          complete: () => done(),
        });

        bot.triggerMessageSent();
      });
    });

    describe('Error Handling', () => {
      let sent$: Observable<TelegramBot.Message | any>;

      beforeEach(() => {
        sent$ = sendMessage(bot, chatID, message);
      });

      describe('Error 403', () => {
        let triggered: boolean;
        let subscription: Subscription;

        beforeEach(async () => {
          triggered = false;
          subscription = sent$.subscribe(() => (triggered = true));

          bot.triggerMessageSentError403();

          // Wait for completion or emit
          await sent$.toPromise();
        });

        it('should trigger nothing', () => {
          expect(triggered).toBeFalsy();
        });

        it('should close the observable', () => {
          expect(subscription.closed).toBeTruthy();
        });
      });

      describe('Any Error', () => {
        let triggered: boolean;
        let errorTriggered: boolean;

        beforeEach(async () => {
          triggered = false;
          errorTriggered = false;

          sent$
            .pipe(
              catchError(() => {
                errorTriggered = true;
                return NEVER;
              }),
            )
            .subscribe(() => (triggered = true));

          bot.triggerMessageSentErrorAny();
        });

        it('should not trigger any value on next', () => {
          expect(triggered).toBeFalsy();
        });

        it('should throw an error', () => {
          expect(errorTriggered).toBeTruthy();
        });
      });
    });
  });
});
