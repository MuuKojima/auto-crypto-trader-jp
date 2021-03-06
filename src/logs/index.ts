import { COMPARED_PRICE_STATUS } from '../constants';
import { ActionContext } from '../stores/storeManager';

const COMPARED_PRICE_STATUS_ICON = {
  up: '🔼',
  down: '🔻',
  same: '--',
} as const;

const printMarketPriceStatus = (context: ActionContext): void => {
  const latestPrice = context.getters<number>('trade.latestPrice');
  const priceStatus = context.getters<keyof typeof COMPARED_PRICE_STATUS>('trade.statusForLatestPriceComparedToPreviousPrice');
  let statusIcon: valueof<typeof COMPARED_PRICE_STATUS_ICON> = COMPARED_PRICE_STATUS_ICON.same;
  switch(priceStatus) {
    case COMPARED_PRICE_STATUS.up:
      statusIcon = COMPARED_PRICE_STATUS_ICON.up;
      break;
    case COMPARED_PRICE_STATUS.down:
      statusIcon = COMPARED_PRICE_STATUS_ICON.down;
      break;
    default:
      break;
  }
  console.log(`[TRADING] ${statusIcon}  ${latestPrice} yen`);
}

export const logging = {
  printMarketPriceStatus
};
