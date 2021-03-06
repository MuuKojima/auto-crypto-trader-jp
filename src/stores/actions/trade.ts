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
   * Ready to trade
   * @param context
   * @param payload
   */
  isReady: async (context: ActionContext, payload: { isReady: boolean }): Promise<void> => {
    const {
      isReady
    } = payload;
    context.commit('trade.isReady', { isReady });
  },

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
    const {
      size
    } = payload;
    // Prevent double order
    context.commit('trade.isReady', { isReady: false });
    if (!appContext.config.sandboxMode) {
      await tradeApi.marketBuy(size);
    }
    const latestPrice = context.getters<number>('trade.latestPrice');
    const myPricePosition = Math.floor(latestPrice * size);
    context.commit('trade.myPricePosition', { myPricePosition });
    // Ready to trade
    context.commit('trade.isReady', { isReady: true });
    // Logging
    logging.printMyPricePosition(myPricePosition);
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
    const {
      size
    } = payload;
    // Prevent double order
    context.commit('trade.isReady', { isReady: false });
    if (!appContext.config.sandboxMode) {
      await tradeApi.marketSell(size);
    }
    const myPricePosition = context.getters<number>('trade.myPricePosition');
    const latestPrice = context.getters<number>('trade.latestPrice');
    const orderPrice = latestPrice * size;
    const clearMyPricePosition = 0;
    const benefit = orderPrice - myPricePosition;
    const prevTotalBenefit = context.getters<number>('trade.totalBenefit');
    const totalBenefit = prevTotalBenefit + benefit;
    context.commit('trade.totalBenefit', { totalBenefit });
    // Clear postion
    context.commit('trade.myPricePosition', { clearMyPricePosition });
    // Ready to trade
    context.commit('trade.isReady', { isReady: true });
    // Logging
    logging.printSellPrice(orderPrice);
    logging.printBenefit(benefit);
    logging.printTotalBenefit(totalBenefit);
  },
};
