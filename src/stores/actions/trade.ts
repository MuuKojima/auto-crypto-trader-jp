import TradeAPI from '../../apis';
import appContext from '../../context';
import { ActionContext } from '../../stores/storeManager';
import { COMPARED_PRICE_STATUS, COMPARED_PRICE_STATUS_ICON } from '../../constants';

const MAX_RECORD_SIZE = 1000;

const tradeApi = TradeAPI.init(
  process.env.SERVICE_ID,
  process.env.API_KEY || '',
  process.env.API_SECRET || ''
);

export const trade = {
  /**
   * Fetch current market information
   * @param context
   */
  fetch: async (context: ActionContext): Promise<void> => {
    const price = await tradeApi.fetchPrices();
    if (!price) {
      return;
    }
    const priceRecords = context.getters<number[]>('trade.priceRecords').concat();
    // If the maximum value is exceeded, remove the tail after adding the head.
    if (priceRecords.length > MAX_RECORD_SIZE) {
      priceRecords.unshift(price);
      priceRecords.pop();
      context.commit('trade.priceRecords', { priceRecords });
      return;
    }
    // Add to head
    priceRecords.unshift(price);
    context.commit('trade.priceRecords', { priceRecords });
    // Logging
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
  },

  /**
   * Buy currency
   * @param context
   * @param payload
   */
  marketBuy: async (
    context: ActionContext,
    payload: { size: number }
  ): Promise<void> => {
    if (appContext.config.sandboxMode) {
      return;
    }
    await tradeApi.marketBuy(payload.size);
  },

   /**
    * Sell currency
    * @param context
    * @param payload
    */
  marketSell: async (
    context: ActionContext,
    payload: { size: number }
  ): Promise<void> => {
    if (appContext.config.sandboxMode) {
      return;
    }
    await tradeApi.marketSell(payload.size);
  },
};
