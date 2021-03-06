import TradeAPI from '../../apis';
import appContext from '../../context';
import { ActionContext } from '../../stores/storeManager';
import { logging } from '../../logs';

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
    logging.printMarketPriceStatus(context);
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
    if (!appContext.config.sandboxMode) {
      await tradeApi.marketBuy(payload.size);
    }
    // Logging
    logging.printOrderPrice(context, payload.size);
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
    if (!appContext.config.sandboxMode) {
      await tradeApi.marketSell(payload.size);
      return;
    }
  },
};
