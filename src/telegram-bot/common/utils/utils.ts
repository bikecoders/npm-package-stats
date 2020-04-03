import * as TelegramBot from 'node-telegram-bot-api';

import { Subject, Observable, from } from 'rxjs';

function buildReplyMarkUp(
  inlineKeyboard: TelegramBot.InlineKeyboardButton[][],
  forceReply: boolean,
): Pick<TelegramBot.SendBasicOptions, 'reply_markup'> {
  if (inlineKeyboard) {
    return {
      reply_markup: {
        inline_keyboard: inlineKeyboard,
      },
    };
  } else if (forceReply) {
    return {
      reply_markup: {
        force_reply: true,
      },
    };
  } else {
    return {};
  }
}

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
  forceReply = false,
) {
  const sub = new Subject<TelegramBot.Message>();

  const inlineKeyboardOption = buildReplyMarkUp(inlineKeyboard, forceReply);

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

export function answerSingleArticleInlineQuery(
  bot: TelegramBot,
  query: TelegramBot.InlineQuery,
  responseCacheId: string,
  title: string,
  description: string,
  messageText: string,
): Observable<boolean> {
  return from(
    bot.answerInlineQuery(query.id, [
      {
        id: responseCacheId,
        type: 'article',
        title,
        description,
        input_message_content: {
          message_text: messageText,
          parse_mode: 'HTML',
        },
      } as TelegramBot.InlineQueryResultArticle,
    ]),
  );
}
