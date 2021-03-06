import { MutationContext } from '../storeManager';
import { TradeContext } from '../../types/stores';

const PUBLISHED_NAME = 'trade';

export const trade = {
  isReady: (
    context: MutationContext<TradeContext>,
    payload: { isReady: boolean }
  ): string => {
    context.states.trade.isReady = payload.isReady;
    return PUBLISHED_NAME;
  },

  priceRecords: (
    context: MutationContext<TradeContext>,
    payload: { priceRecords: number[] }
  ): string => {
    context.states.trade.priceRecords = payload.priceRecords;
    return PUBLISHED_NAME;
  },

  myPricePosition: (
    context: MutationContext<TradeContext>,
    payload: { myPricePosition: number }
  ): string => {
    context.states.trade.myPricePosition = payload.myPricePosition;
    return PUBLISHED_NAME;
  },

  totalBenefit: (
    context: MutationContext<TradeContext>,
    payload: { totalBenefit: number }
  ): string => {
    context.states.trade.totalBenefit = payload.totalBenefit;
    return PUBLISHED_NAME;
  }
};
