import { COMPARED_PRICE_STATUS } from '../../constants';
import { GetterContext } from '../storeManager';
import { TradeContext } from '../../types/stores';

export const trade = {
  /**
   * Ready to trade
   */
  isReady: (context: GetterContext<TradeContext>): boolean => {
    return context.states.trade.isReady;
  },

  /**
   * My price position
   * @param context
   */
  myPricePosition: (
    context: GetterContext<TradeContext>
  ): number => {
    return context.states.trade.myPricePosition;
  },

  /**
   * Benefit
   * @param context
   */
  benefit: (
    context: GetterContext<TradeContext>
  ): number => {
    return context.states.trade.benefit;
  },

  /**
   * Total benefit
   * @param context
   */
  totalBenefit: (
    context: GetterContext<TradeContext>
  ): number => {
    return context.states.trade.totalBenefit;
  },

  /**
   * All price record
   * e.g.
   * Resource: [500, 400, 300, 200, 100]
   * Output: [500, 400, 300, 200, 100]
   * @param context
   */
  priceRecords: (context: GetterContext<TradeContext>): number[] => {
    return context.states.trade.priceRecords;
  },

  /**
   * Latest price
   * e.g.
   * Resource: [500, 400, 300, 200, 100]
   * Output: 500
   * @param context
   */
  latestPrice: (context: GetterContext<TradeContext>): number => {
    return context.states.trade.priceRecords[0];
  },

  /**
   * nth price
   * e.g. nth = 2
   * Resource: [500, 400, 300, 200, 100]
   * Output: 300
   * @param context
   * @param payload
   */
  nthPrice: (
    context: GetterContext<TradeContext>,
    payload: { nth: number }
  ): number => {
    return context.states.trade.priceRecords[payload.nth];
  },

  /**
   * nth price by watch
   * e.g. nth = 0
   * Resource: [500, 400, 300, 200, 100]
   * Output: 500
   * @param context
   * @param payload
   */
  nthPriceByWatch: (
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
   * Resource: [500, 400, 300, 200, 100]
   * Output: true
   * @param context
   */
  isIncreasedLatestPriceComparedToPreviousPrice: (
    context: GetterContext<TradeContext>
  ): boolean => {
    const latestPrice = context.states.trade.priceRecords[0];
    const prevPrice = context.states.trade.priceRecords[1];
    return latestPrice > prevPrice;
  },

  /**
   * Returns the status of the current price compared to the previous price.
   * e.g.
   * Resource: [500, 400, 300, 200, 100]
   * Output: up | down | same
   * @param context
   */
  statusForLatestPriceComparedToPreviousPrice: (
    context: GetterContext<TradeContext>
  ): keyof typeof COMPARED_PRICE_STATUS => {
    const latestPrice = context.states.trade.priceRecords[0];
    const prevPrice = context.states.trade.priceRecords[1];
    if (latestPrice > prevPrice) {
      return COMPARED_PRICE_STATUS.up
    } else if (latestPrice < prevPrice) {
      return COMPARED_PRICE_STATUS.down
    } else {
      return COMPARED_PRICE_STATUS.same
    };
  }
};
