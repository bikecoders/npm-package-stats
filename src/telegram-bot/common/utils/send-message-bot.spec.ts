import * as TelegramBot from 'node-telegram-bot-api';

import { Observable, NEVER, Subscription } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { sendMessageHTML } from './send-message-bot';

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
    botSendMessageSpy = spyOn(bot, 'sendMessage').and.callThrough();
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

  describe('Reply', () => {
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

  describe('Return', () => {
    let sent$: Observable<TelegramBot.Message | any>;

    beforeEach(() => {
      sent$ = sendMessageHTML(bot, chatID, message);
    });

    it('should return an observable that emits the message when is sent', () => {
      expect(sent$ instanceof Observable).toBeTruthy();
    });

    it('should return the msg sent', (done) => {
      let messageSent: TelegramBot.Message;

      sent$.subscribe({
        next: (msg) => {
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
      sent$ = sendMessageHTML(bot, chatID, message);
    });

    describe('Error 403', () => {
      let triggered: boolean;
      let subscription: Subscription;

      beforeEach(async () => {
        triggered = false;
        subscription = sent$.subscribe(() => triggered = true);

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

      let subscription: Subscription;

      beforeEach(async () => {
        triggered = false;
        errorTriggered = false;

        subscription = sent$.pipe(
          catchError((err) => {
            errorTriggered = true;
            return NEVER;
          }),
        )
          .subscribe(() => triggered = true);

        bot.triggerMessageSentErrorAny();

        // Wait for completion or emit, need the catch, if it's not there
        // the test is going to explode, the error is riced
        // tslint:disable-next-line: no-empty
        await sent$.toPromise().catch(() => { });
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
