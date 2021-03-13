export interface TradeApi {
  fetchPrices(): Promise<number | undefined>;
  buy(btcSize: number, price: number): Promise<void>;
  sell(btcSize: number, price: number): Promise<void>;
  marketBuy(btcSize: number): Promise<void>;
  marketSell(btcSize: number): Promise<void>;
}

export interface BitflyerFetchResponse {
  ltp: number;
}

export interface BitflyerBuyAndSellResponse {
  info: { child_order_acceptance_id: string };
  id: string;
}

export interface BitflyerErrorResponse {
  status: number;
  error_message: string;
}

export interface LiquidFetchResponse {
  last_traded_price: number;
}
