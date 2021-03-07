export interface Config {
  sandboxMode: boolean;
  orderSizeBTC: number;
  intervalSec: number;
}

export interface TradeContext {
  trade: {
    isReady: boolean,
    priceRecords: number[];
    myPricePosition: number,
    benefit: number
    totalBenefit: number
  };
}
