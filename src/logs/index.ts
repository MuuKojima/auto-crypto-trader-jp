import { COMPARED_PRICE_STATUS } from '../constants';
import { ActionContext } from '../stores/storeManager';

const LOG_PREFIX = '[TRADING]';
const PRICE_UNIT = 'yen';
const COMPARED_PRICE_STATUS_ICON = {
  up: '🔼',
  down: '🔻',
  same: '--',
} as const;
const BUY_ICON = '🛍';

/**
 * Print the status of the current price compared to the previous price.
 * @param context
 */
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
  console.log(`${LOG_PREFIX} ${statusIcon}  ${latestPrice} ${PRICE_UNIT}`);
}

/**
 * Print order price
 * @param context
 * @param size
 */
const printOrderPrice = (context: ActionContext, size: number): void => {
  const latestPrice = context.getters<number>('trade.latestPrice');
  const orderPrice = latestPrice * size;
  console.log(`${LOG_PREFIX} ${BUY_ICON}  ${orderPrice} ${PRICE_UNIT}`);
}


export const logging = {
  printMarketPriceStatus,
  printOrderPrice
};
