import { Injectable } from '@nestjs/common';
import { mergeMap } from 'rxjs/operators';

import { BotService } from '../bot/bot.service';
import { NpmStatsService } from '../../../core/npm-stats/npm-stats.service';
import { Template as statsTemplate } from '../../../telegram-bot/features/stats/common';
import { answerSingleArticleInlineQuery } from '../../../telegram-bot/common';

@Injectable()
export class InlineSearchService {
  constructor(
    private botService: BotService,
    private npmStatsService: NpmStatsService,
  ) {
    this.botService.bot.on('inline_query', query => {
      const packageSlug = query.query.trim().split(' ')[0] || '';

      if (packageSlug === '') return;

      this.npmStatsService
        .validateSlug(packageSlug)
        .pipe(
          mergeMap(packageValid => {
            if (packageValid) {
              return this.npmStatsService
                .getStatsForYesterday(packageSlug)
                .pipe(
                  mergeMap(stats => {
                    debugger;

                    return answerSingleArticleInlineQuery(
                      this.botService.bot,
                      query,
                      packageSlug,
                      `Yesterday's Downloads of "${packageSlug}" 📦`,
                      statsTemplate.downloadsFormat(stats.downloads),
                      statsTemplate.statInline(stats),
                    );
                  }),
                );
            } else {
              return answerSingleArticleInlineQuery(
                this.botService.bot,
                query,
                '0',
                `Package "${packageSlug}" doesn't exists`,
                '',
                `Package <code>${packageSlug}</code> doesn't exists 🤷‍♂️`,
              );
            }
          }),
        )
        .subscribe();
    });
  }
}
