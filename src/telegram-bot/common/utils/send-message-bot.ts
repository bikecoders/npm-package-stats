import * as TelegramBot from 'node-telegram-bot-api';
import { Observable, Subject } from 'rxjs';

/**
 * Send a message or a reply to a conversation
 *
 * @param chatId The chat ID or the user conversation to send the message
 * @param message The message itself
 * @param replyToMessageId Inside the chat, send a reply message
 *
 * @returns An observable that emits when the message was sent
 */
export function sendMessageHTML(
  bot: TelegramBot,
  chatId: number,
  message: string,
  additionalOptions?: TelegramBot.SendMessageOptions,
  replyToMessageId?: number,
): Observable<TelegramBot.Message> {
  return sendMessage(bot, chatId, message, {
    parse_mode: 'HTML',
    reply_to_message_id: replyToMessageId,
    ...additionalOptions,
  });
}

export function sendMessageHTMLInlineKeyboard(
  bot: TelegramBot,
  chatId: number,
  message: string,
  replyToMessageId?: number,
) {
  const keyBoardOptions: TelegramBot.SendMessageOptions = {
    reply_markup: {
      inline_keyboard: [
        [{ text: 'a', callback_data: 'your press a', url: 'https://www.google.com/search?q=a' }],
        [{ text: 'b', callback_data: '/start' }],
        [{ text: 'c', callback_data: 'your press c' }],
      ],
    } as TelegramBot.InlineKeyboardMarkup
  };

  return sendMessageHTML(bot, chatId, message, keyBoardOptions, replyToMessageId);
}

export function sendMessage(
  bot: TelegramBot,
  chatId: number,
  message: string,
  options: TelegramBot.SendMessageOptions,
): Observable<TelegramBot.Message> {
  const sub = new Subject<TelegramBot.Message>();

  bot.sendMessage(chatId, message, options)
    .then((msg) => {
      sub.next(msg);
      sub.complete();
    })
    .catch((err) => {
      if (err.response.body.error_code !== 403) {
        sub.error(err);
      }

      sub.complete();
    });

  return sub.asObservable();
}
