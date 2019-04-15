import * as TelegramBot from 'node-telegram-bot-api';

export abstract class BaseCommand {
  /**
   * Use it to call the abstract function
   */
  get commandFunctionPublic() {
    return this.commandFunction;
  }

  constructor(
    public bot: TelegramBot,
    public readonly COMMAND: RegExp,
  ) {
  }

  triggerCommand(msg: TelegramBot.Message, match: RegExpExecArray = null) {
    this.commandFunction(msg, match);
  }

  /**
   * Define in this method what the command is going to do
   */
  protected abstract commandFunction(msg: TelegramBot.Message, match: RegExpExecArray);
}
