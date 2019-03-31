import * as TelegramBot from 'node-telegram-bot-api';

import { BaseCommand } from '../base.command';
import { BaseCommand as BaseCommandMock } from './base.command';

export function triggerCommand(command: BaseCommand, msg: TelegramBot.Message, match: RegExpExecArray) {
  (command as unknown as BaseCommandMock)
    .commandFunctionPublic(msg, match);
}
