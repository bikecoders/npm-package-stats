import { Injectable } from '@nestjs/common';
import TelegramBot = require('node-telegram-bot-api');
import { map, mergeMap } from 'rxjs/operators';
import { of, EMPTY } from 'rxjs';

import { BaseCommand } from '../base.command';
import { UsersService } from '../../../core/users/service/users.service';
import { BotService } from '../../../telegram-bot/core/bot/bot.service';
import { sendMessage } from '../../../telegram-bot/common';
import { Template } from './common';
import {
  InlineQueryMetadataGenerator,
  KeyBoardEventsKeys,
} from '../../core/inline-responses/common';
import { InlineResponsesService } from '../../core/inline-responses/inline-responses.service';
import { User, IPackage } from '../../../core/users/shared/models';

@Injectable()
export class RemoveFeature extends BaseCommand {
  public static readonly COMMAND = /\/remove_package/;

  constructor(
    botService: BotService,
    private userService: UsersService,
    inlineResponsesService: InlineResponsesService,
  ) {
    super(botService.bot, RemoveFeature.COMMAND);

    inlineResponsesService.addKeyBoardSubscriber(
      KeyBoardEventsKeys.DELETE_PACKAGE,
      this.deletePackageOnKeyboardSelection.bind(this),
    );
  }

  protected commandFunction(msg: TelegramBot.Message) {
    const chatId = msg.chat.id;

    this.userService
      .getUser(chatId)
      .pipe(
        map(user => user.packagesIterative),
        // Verify that has packages
        mergeMap(packages => {
          if (packages.length === 0) {
            return sendMessage(this.bot, chatId, Template.noPackage).pipe(
              mergeMap(() => EMPTY),
            );
          } else {
            return of(packages);
          }
        }),
        mergeMap(packages => {
          const keyboard = this.generateKeyboard(packages);

          return sendMessage(
            this.bot,
            chatId,
            Template.selectPackageToDelete,
            msg.message_id,
            keyboard,
          );
        }),
      )
      .subscribe();
  }

  private deletePackageOnKeyboardSelection(
    npmPackageSlug: string,
    callBackQuery: TelegramBot.CallbackQuery,
  ) {
    this.userService
      .getUser(callBackQuery.message.chat.id)
      .pipe(
        mergeMap(user => {
          if (user.hasPackage(npmPackageSlug)) {
            return this.userService
              .removePackage(callBackQuery.message.chat.id, npmPackageSlug)
              .pipe(
                mergeMap(userUpdated => {
                  // Response
                  this.bot.answerCallbackQuery({
                    callback_query_id: callBackQuery.id,
                    show_alert: true,
                    text: Template.packageRemoved(npmPackageSlug),
                  });

                  // Update package list
                  this.editMessagesKeyboardOnResponse(
                    userUpdated,
                    callBackQuery,
                  );

                  return EMPTY;
                }),
              );
          } else {
            this.bot.answerCallbackQuery({
              callback_query_id: callBackQuery.id,
              show_alert: true,
              text: Template.packageNoLongerYours(npmPackageSlug),
            });

            return EMPTY;
          }
        }),
      )
      .subscribe();
  }

  private editMessagesKeyboardOnResponse(
    user: User,
    callBackQuery: TelegramBot.CallbackQuery,
  ) {
    // Edit the main Message when there is no packages
    if (user.nPackages === 0) {
      this.bot.editMessageText(Template.noPackage, {
        chat_id: callBackQuery.message.chat.id,
        message_id: callBackQuery.message.message_id,
      });
    } else {
      // Edit the keyboard
      this.bot.editMessageReplyMarkup(
        {
          inline_keyboard: this.generateKeyboard(user.packagesIterative),
        },
        {
          chat_id: callBackQuery.message.chat.id,
          message_id: callBackQuery.message.message_id,
        },
      );
    }
  }

  private generateKeyboard(
    packages: IPackage[],
  ): TelegramBot.InlineKeyboardButton[][] {
    return packages.map((pckg): TelegramBot.InlineKeyboardButton[] => [
      {
        text: pckg.npmSlug,
        callback_data: InlineQueryMetadataGenerator(
          KeyBoardEventsKeys.DELETE_PACKAGE,
          pckg.npmSlug,
        ),
      },
    ]);
  }
}
