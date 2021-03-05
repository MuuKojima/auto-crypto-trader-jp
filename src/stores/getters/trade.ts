import { GetterContext } from '../storeManager';
import { TradeContext } from '../../types/stores';

export const trade = {
  /**
   * All price record
   * e.g.
   * Input: [500, 400, 300, 200, 100]
   * Output: [500, 400, 300, 200, 100]
   * @param context
   */
  priceRecords: (context: GetterContext<TradeContext>): number[] => {
    return context.states.trade.priceRecords;
  },

  /**
   * Price records by max size
   * e.g. size = 3
   * Input: [500, 400, 300, 200, 100]
   * Output: [500, 400, 300]
   * @param context
   * @param payload
   */
  priceRecordsByMaxSize: (
    context: GetterContext<TradeContext>,
    payload: { size: number }
  ): number[] => {
    const priceRecords = context.states.trade.priceRecords;
    if (priceRecords.length <= payload.size) {
      return priceRecords;
    }
    return priceRecords.slice(0, payload.size);
  },

  /**
   * Latest price
   * e.g.
   * Input: [500, 400, 300, 200, 100]
   * Output: 500
   * @param context
   */
  latestPrice: (context: GetterContext<TradeContext>): number => {
    return context.states.trade.priceRecords[0];
  },

  /**
   * Prev price
   * e.g.
   * Input: [500, 400, 300, 200, 100]
   * Output: 400
   * @param context
   */
  prevPrice: (context: GetterContext<TradeContext>): number => {
    return context.states.trade.priceRecords[1];
  },

  /**
   * Oldest price
   * e.g.
   * Input: [500, 400, 300, 200, 100]
   * Output: 100
   * @param context
   */
  oldestPrice: (context: GetterContext<TradeContext>): number => {
    const priceRecords = context.states.trade.priceRecords;
    const oldestPrice = priceRecords[priceRecords.length - 1];
    return oldestPrice;
  },

  /**
   * Oldest price by max size
   * e.g. size = 3
   * Input: [500, 400, 300, 200, 100]
   * Output: 300
   * @param context
   * @param payload
   */
  oldestPriceByMaxSize: (
    context: GetterContext<TradeContext>,
    payload: { size: number }
  ): number => {
    const priceRecords = context.states.trade.priceRecords;
    if (priceRecords.length <= payload.size) {
      return priceRecords[priceRecords.length - 1];
    }
    const _priceRecords = priceRecords.slice(0, payload.size);
    const oldestPrice = _priceRecords[_priceRecords.length - 1];
    return oldestPrice;
  },

  /**
   * nth price
   * e.g. nth = 0
   * Input: [500, 400, 300, 200, 100]
   * Output: 500
   * @param context
   * @param payload
   */
  nthPrice: (
    context: GetterContext<TradeContext>,
    payload: { nth: number }
  ): number => {
    const priceRecords = context.states.trade.priceRecords;
    if (priceRecords.length <= payload.nth) {
      return priceRecords[priceRecords.length - 1];
    }
    const _priceRecords = priceRecords.slice(0, payload.nth);
    const price = _priceRecords[_priceRecords.length - 1];
    return price;
  },

  /**
   * Whether latest price risen compared to the previous one
   * e.g.
   * Input: [500, 400, 300, 200, 100]
   * Output: true
   * @param context
   */
  isIncreasedLatestPriceComparedToPreviousOne: (
    context: GetterContext<TradeContext>
  ): boolean => {
    const latestPrice = context.states.trade.priceRecords[0];
    const prevPrice = context.states.trade.priceRecords[1];
    return latestPrice > prevPrice;
  },
};
