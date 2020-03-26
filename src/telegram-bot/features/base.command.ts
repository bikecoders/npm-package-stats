import * as TelegramBot from 'node-telegram-bot-api';

/**
 * The base command class
 * Extend this class and implement the commandFunction method
 * to star listening the messages of the client on Telegram.
 *
 * Only just instantiating the class is listening your command
 */
export abstract class BaseCommand {
  /**
   * Constructor. Here we call the commandFunction function to start listening
   * the commands for Telegram
   *
   * @param bot The TelegramBot instance
   * @param COMMAND The regex of you command
   */
  constructor(protected bot: TelegramBot, protected readonly COMMAND: RegExp) {
    this.bot.onText(this.COMMAND, (msg, match) =>
      this.commandFunction(msg, match),
    );
  }

  /**
   * Define in this method what the command is going to do
   */
  protected abstract commandFunction(
    msg: TelegramBot.Message,
    match: RegExpExecArray,
  );
}
