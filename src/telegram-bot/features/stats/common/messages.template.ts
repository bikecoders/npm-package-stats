import { INMPStats } from '../../../../core/npm-stats/shared/api-npm.model';
import { Utils } from '../../../../common';

export const downloadsFormat = (downloads: number): string => {
  return new Intl.NumberFormat('en-US').format(downloads);
};

export const stat = (stats: INMPStats) =>
  `The stats of the package <a href="${Utils.buildNPMLink(stats.package)}">${
    stats.package
  }</a> are:

📈
NPM Downloads: ${downloadsFormat(stats.downloads)}`;

export const statInline = (stats: INMPStats) =>
  `NPM Package yesterday's downloads of <a href="${Utils.buildNPMLink(
    stats.package,
  )}">${stats.package}</a>📦 are:
----- <b>${downloadsFormat(stats.downloads)}</b> -----`;

export const disclaimer = `The following stats are from yesterday`;
