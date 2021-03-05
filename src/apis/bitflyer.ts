import axios, { AxiosError } from 'axios';
import * as crypto from 'crypto';
import {
  BitflyerBuyAndSellResponse,
  BitflyerErrorResponse,
  BitflyerFetchResponse,
  TradeApi,
} from '../types/apis';

const END_POINT = 'https://api.bitflyer.com/v1';
const MARKET_SYMBOL = 'FX_BTC_JPY';

/**
 * BitflyerApi
 * @see: https://lightning.bitflyer.com/docs?lang=ja
 */
export class BitflyerApi implements TradeApi {
  private apiKey;
  private apiSecret;

  /**
   * Constructor
   * @param apiKey
   * @param apiSecret
   */
  constructor(apiKey: string, apiSecret: string) {
    this.apiKey = apiKey;
    this.apiSecret = apiSecret;
  }

  /**
   * Fetch
   */
  async fetchPrices(): Promise<number | undefined> {
    const url = `${END_POINT}/ticker`;
    const res = await axios
      .get<BitflyerFetchResponse>(url)
      .catch((err: AxiosError<BitflyerErrorResponse>) => {
        if (err.response !== undefined) {
          const errorMessage = `${err.response.data.status} : ${err.response.data.error_message}`;
          console.error('TradeError: ', errorMessage);
        }
        throw err;
      });
    return res.data.ltp;
  }

  /**
   * Buy
   * @param btcSize
   * @param body
   */
  async buy(btcSize: number, price: number): Promise<void> {
    await this.sendChildOrder(btcSize, {
      product_code: MARKET_SYMBOL,
      child_order_type: 'LIMIT',
      side: 'BUY',
      size: btcSize,
      price: price,
      minute_to_expire: 10,
    });
  }

  /**
   * Sell
   * @param btcSize
   * @param body
   */
  async sell(btcSize: number, price: number): Promise<void> {
    await this.sendChildOrder(btcSize, {
      product_code: MARKET_SYMBOL,
      child_order_type: 'LIMIT',
      side: 'SELL',
      size: btcSize,
      price: price,
      minute_to_expire: 10,
    });
  }

  /**
   * Market Buy
   * @param btcSize
   * @param body
   */
  async marketBuy(btcSize: number): Promise<void> {
    await this.sendChildOrder(btcSize, {
      product_code: MARKET_SYMBOL,
      child_order_type: 'MARKET',
      side: 'BUY',
      size: btcSize,
      minute_to_expire: 10,
    });
  }

  /**
   * Market Sell
   * @param btcSize
   * @param body
   */
  async marketSell(btcSize: number): Promise<void> {
    await this.sendChildOrder(btcSize, {
      product_code: MARKET_SYMBOL,
      child_order_type: 'MARKET',
      side: 'SELL',
      size: btcSize,
      minute_to_expire: 10,
    });
  }

  /**
   * Send Child Order
   * @param btcSize
   * @param body
   */
  private async sendChildOrder(btcSize: number, body: any): Promise<void> {
    const timestamp = Date.now().toString();
    const data = JSON.stringify(body);
    const text = `${timestamp}POST/v1/me/sendchildorder'${data}`;
    const sign = crypto
      .createHmac('sha256', this.apiSecret)
      .update(text)
      .digest('hex');
    const url = `${END_POINT}/me/sendchildorder`;
    const config = {
      headers: {
        'ACCESS-KEY': this.apiKey,
        'ACCESS-TIMESTAMP': timestamp,
        'ACCESS-SIGN': sign,
        'Content-Type': 'application/json',
      },
    };
    const res = await axios
      .post<BitflyerBuyAndSellResponse>(url, data, config)
      .catch((err: AxiosError<BitflyerErrorResponse>) => {
        if (err.response !== undefined) {
          const errorMessage = `${err.response.data.status} : ${err.response.data.error_message}`;
          console.error('TradeError: ', errorMessage);
        }
        throw err;
      });
    console.log('order', res);
  }
}
