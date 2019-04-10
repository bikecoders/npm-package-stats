import * as TelegramBot from 'node-telegram-bot-api';

/**
 * Send a message or a reply to a conversation
 *
 * @param chatId The chat ID or the user conversation to send the message
 * @param message The message itself
 * @param replyToMessageId Inside the chat, send a reply message
 */
export function sendMessageHTML(bot: TelegramBot, chatId: string | number, message: string, replyToMessageId?: number) {
  bot.sendMessage(chatId, message, {
    parse_mode: 'HTML',
    reply_to_message_id: replyToMessageId,
  });
}
