import TelegramBot = require('node-telegram-bot-api');

import { predeterminedChatId } from './user.mock-data';
import {
  InlineQueryMetadataGenerator,
  KeyBoardEventsKeys,
} from '../../telegram-bot/core/inline-responses/common';

export const predeterminedMessageId = 123123123;

export const generateTelegramBotMessage = (
  text = 'some text',
  messageId = predeterminedMessageId,
  chatId = predeterminedChatId,
): TelegramBot.Message =>
  ({
    chat: { id: chatId },
    text,
    message_id: messageId,
  } as TelegramBot.Message);

export const generateCallbackQueryMessage = (
  event: KeyBoardEventsKeys,
  metadata: any,
  text = 'some text',
  messageId = predeterminedMessageId,
  chatId = predeterminedChatId,
): TelegramBot.CallbackQuery =>
  ({
    id: 'callbackQuery Id',
    message: generateTelegramBotMessage(text, chatId, messageId),
    data: InlineQueryMetadataGenerator(event, metadata),
  } as TelegramBot.CallbackQuery);
