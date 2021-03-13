import axios from 'axios';
import * as ccxt from 'ccxt';
import { logging } from '../logs';
import {
  LiquidFetchResponse,
  TradeApi,
} from '../types/apis';

const END_POINT = 'https://api.liquid.com';
const PRODUCT_JPY_ID = 5;
const X_QUOINE_API_VERSION = {
  key: 'X-Quoine-API-Version',
  val: 2
} as const;

const TRADE_TYPE = {
  buy: 'buy',
  sell: 'sell'
} as const;

/**
 * LiquidApi
 * @see: https://developers.liquid.com/
 */
export class LiquidApi implements TradeApi {
  private apiKey;
  private apiSecret;
  private liquid;

  /**
   * Constructor
   * @param apiKey
   * @param apiSecret
   */
  constructor(apiKey: string, apiSecret: string) {
    this.apiKey = apiKey;
    this.apiSecret = apiSecret;
    this.liquid = new ccxt.liquid({
      apiKey: this.apiKey,
      secret: this.apiSecret
    })
  }

  /**
   * Fetch prices
   */
  async fetchPrices(): Promise<number | undefined> {
    const url = `${END_POINT}/products/${PRODUCT_JPY_ID}`;
    const config = {
      headers: {
        [X_QUOINE_API_VERSION.key]: X_QUOINE_API_VERSION.val,
      },
    };
    const res = await axios
      .get<LiquidFetchResponse>(url, config)
      .catch((err) => {
        throw err;
      });
    return res.data.last_traded_price;
  }

  /**
   * Buy at limit price
   */
  async buy(
  ): Promise<void> {
    // do nothing
  }

  /**
   * Sell at limit price
   */
  async sell(
  ): Promise<void> {
    // do nothing
  }

  /**
   * Market buy
   * @param btcSize
   */
  async marketBuy(
    btcSize: number
  ): Promise<void> {
    return await this.sendChildOrder('buy', btcSize);
  }

  /**
   * Market sell
   * @param btcSize
   */
  async marketSell(
    btcSize: number,
  ): Promise<void> {
    return await this.sendChildOrder('sell', btcSize);
  }

  /**
   * Send child order
   * @param side
   * @param btcSize
   */
  private async sendChildOrder(side: keyof typeof TRADE_TYPE, btcSize: number): Promise<void> {
    const res = await this.liquid.createMarketOrder('BTC/JPY', side, btcSize)
      .catch((err) => {
        console.error('🚨 TradeError: ', err);
        throw err;
      });
    // Logging
    logging.printOrderSuccess(String(res.price));
  }
}
