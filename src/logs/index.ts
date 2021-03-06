import { COMPARED_PRICE_STATUS } from '../constants';
import { ActionContext } from '../stores/storeManager';

const LOG_PREFIX = '[TRADING]';
const PRICE_UNIT = 'yen';
const COMPARED_PRICE_STATUS_ICON = {
  up: '🔼',
  down: '🔻',
  same: '--',
} as const;
const TRADE_ICON = {
  buy: '🛍',
  sell: '💰'
}
const BENEFIT_ICON = {
  smile: '😆',
  sweat: '😰'
} as const;
const GRAPH_ICON = '📊';


/**
 * Print the status of the current price compared to the previous price
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
 * Print my price position
 * @param orderPrice
 */
const printMyPricePosition = (printMyPricePosition: number): void => {
  console.log(`${LOG_PREFIX} ${TRADE_ICON.buy}   ${printMyPricePosition} ${PRICE_UNIT}`);
}

/**
 * Print sell price
 * @param context
 */
const printSellPrice = (orderPrice: number): void => {
  console.log(`${LOG_PREFIX} ${TRADE_ICON.sell} ${orderPrice} ${PRICE_UNIT}`);
}

/**
 * Print benefit
 * @param context
 */
const printBenefit = (benefit: number): void => {
  const icon = benefit > 0 ? BENEFIT_ICON.smile : BENEFIT_ICON.sweat;
  console.log(
    `${LOG_PREFIX} ---- ${icon} diff: ${benefit} ${PRICE_UNIT} ${icon} ----`
  );
}

/**
 * Print total benefit
 * @param context
 */
const printTotalBenefit = (totalBenefit: number): void => {
  console.log(`${LOG_PREFIX} ---- ${GRAPH_ICON} total: ${totalBenefit} ${PRICE_UNIT} ${GRAPH_ICON} ----`);
}

export const logging = {
  printMarketPriceStatus,
  printMyPricePosition,
  printSellPrice,
  printBenefit,
  printTotalBenefit
};
