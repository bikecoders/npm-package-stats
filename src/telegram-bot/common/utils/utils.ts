import * as TelegramBot from 'node-telegram-bot-api';

import { Subject } from 'rxjs';

/**
 * Send a message or a reply to a conversation
 *
 * @param TelegramBot The instance of the bot
 * @param chatId The chat ID or the user conversation to send the message
 * @param message The message itself
 * @param replyToMessageId Inside the chat, send a reply message
 *
 * @returns An observable that emits when the message was sent
 */
export function sendMessage(
  bot: TelegramBot,
  chatId: number,
  message: string,
  replyToMessageId?: number,
  inlineKeyboard?: TelegramBot.InlineKeyboardButton[][],
) {
  const sub = new Subject<TelegramBot.Message>();

  const inlineKeyboardOption: TelegramBot.SendBasicOptions = inlineKeyboard
    ? {
        reply_markup: {
          inline_keyboard: inlineKeyboard,
        },
      }
    : {};

  bot
    .sendMessage(chatId, message, {
      parse_mode: 'HTML',
      reply_to_message_id: replyToMessageId,
      ...inlineKeyboardOption,
    })
    .then(msg => {
      sub.next(msg);
      sub.complete();
    })
    .catch(err => {
      if (err.response.body.error_code !== 403) {
        sub.error(err);
      }

      sub.complete();
    });

  return sub.asObservable();
}
