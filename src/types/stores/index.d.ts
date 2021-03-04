export interface Config {
  sandboxMode: boolean;
  orderSizeBTC: number;
  intervalSec: number;
}

export interface TradeContext {
  trade: {
    priceRecords: number[];
  };
}
