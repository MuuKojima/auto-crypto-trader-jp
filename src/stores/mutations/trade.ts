import { MutationContext } from '../storeManager';
import { TradeContext } from '../../types/stores';

const PUBLISHED_NAME = 'trade';

export const trade = {
  priceRecords: (
    context: MutationContext<TradeContext>,
    payload: { priceRecords: number[] }
  ): string => {
    context.states.trade.priceRecords = payload.priceRecords;
    return PUBLISHED_NAME;
  },
};
