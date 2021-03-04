import TradeAPI from '../../apis';
import { ActionContext } from 'stores/storeManager';
import appContext from '../../context';

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
    const _priceRcords = context.getters<number[]>('trade.priceRecords');
    if (_priceRcords.length < MAX_RECORD_SIZE && price) {
      const priceRecords = _priceRcords.concat();
      priceRecords.unshift(price);
      context.commit('trade.priceRecords', { priceRecords });
      return;
    }
    const priceRecords = _priceRcords.concat();
    priceRecords.unshift(price);
    priceRecords.pop();
    context.commit('trade.priceRecords', { priceRecords });
  },

  /**
   * Buy currency
   * @param payload
   * @param size
   */
  buy: async (
    context: ActionContext,
    payload: { size: number }
  ): Promise<void> => {
    if (appContext.config.sandboxMode) {
      return Promise.resolve();
    }
    await tradeApi.buy(payload.size);
  },

  /**
   * Sell currency
   * @param payload
   * @param size
   */
  sell: async (
    context: ActionContext,
    payload: { size: number }
  ): Promise<void> => {
    if (appContext.config.sandboxMode) {
      return Promise.resolve();
    }
    await tradeApi.sell(payload.size);
  },
};
