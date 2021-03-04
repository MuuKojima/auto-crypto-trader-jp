export interface TradeApi {
  fetchPrices(): Promise<number | undefined>;
  buy(btcSize: number): Promise<void>;
  sell(btcSize: number): Promise<void>;
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
