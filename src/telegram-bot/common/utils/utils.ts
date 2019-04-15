import * as TelegramBot from 'node-telegram-bot-api';
import { Observable, from } from 'rxjs';

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
  replyToMessageId?: number,
): Observable<TelegramBot.Message> {
  const msjPromise = bot.sendMessage(chatId, message, {
    parse_mode: 'HTML',
    reply_to_message_id: replyToMessageId,
  });

  return from(msjPromise);
}
