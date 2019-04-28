import { INMPStats } from '../../../../shared/npm-stats/shared/api-npm.model';
import { Utils } from '../../../../common';

export const stat = (stats: INMPStats) =>
`The stats of the package <a href="${Utils.buildNPMLink(stats.package)}">${stats.package}</a> are:

📈
NPM Downloads: ${new Intl.NumberFormat('en-US').format(stats.downloads)}`;

export const disclaimer = `The following stats are from yesterday`;
