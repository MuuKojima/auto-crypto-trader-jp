import axios, { AxiosError } from 'axios';
import * as crypto from 'crypto';
import { logging } from '../logs';
import {
  BitflyerBuyAndSellResponse,
  BitflyerErrorResponse,
  LiquidFetchResponse,
  TradeApi,
} from '../types/apis';

const END_POINT = 'https://api.liquid.com/products';
const PRODUCT_JPY_ID = '5';

interface OrderRequestBody {
  product_code: string;
  child_order_type: string;
  side: string;
  size: number;
  price?: number;
  minute_to_expire: number | undefined;
}

/**
 * LiquidApi
 * @see: https://developers.liquid.com/
 */
export class LiquidApi implements TradeApi {
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
   * Fetch prices
   */
  async fetchPrices(): Promise<number | undefined> {
    const url = `${END_POINT}/${PRODUCT_JPY_ID}`;
    const config = {
      headers: {
        'X-Quoine-API-Version': 2,
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
   * @param btcSize
   * @param price
   * @param minute_to_expire
   */
  async buy(
    btcSize: number,
    price: number,
    minute_to_expire: number | undefined = undefined
  ): Promise<void> {
    await this.sendChildOrder({
      product_code: PRODUCT_JPY_ID,
      child_order_type: 'LIMIT',
      side: 'BUY',
      size: btcSize,
      price,
      minute_to_expire,
    });
  }

  /**
   * Sell at limit price
   * @param btcSize
   * @param price
   * @param minute_to_expire
   */
  async sell(
    btcSize: number,
    price: number,
    minute_to_expire: number | undefined = undefined
  ): Promise<void> {
    await this.sendChildOrder({
      product_code: PRODUCT_JPY_ID,
      child_order_type: 'LIMIT',
      side: 'SELL',
      size: btcSize,
      price,
      minute_to_expire,
    });
  }

  /**
   * Market buy
   * @param btcSize
   * @param body
   */
  async marketBuy(
    btcSize: number,
    minute_to_expire: number | undefined = undefined
  ): Promise<void> {
    await this.sendChildOrder({
      product_code: PRODUCT_JPY_ID,
      child_order_type: 'MARKET',
      side: 'BUY',
      size: btcSize,
      minute_to_expire,
    });
  }

  /**
   * Market sell
   * @param btcSize
   * @param body
   */
  async marketSell(
    btcSize: number,
    minute_to_expire: number | undefined = undefined
  ): Promise<void> {
    await this.sendChildOrder({
      product_code: PRODUCT_JPY_ID,
      child_order_type: 'MARKET',
      side: 'SELL',
      size: btcSize,
      minute_to_expire,
    });
  }

  /**
   * Send child order
   * @param body
   */
  private async sendChildOrder(body: OrderRequestBody): Promise<void> {
    const timestamp = Date.now().toString();
    const data = JSON.stringify(body);
    const text = `${timestamp}POST/v1/me/sendchildorder${data}`;
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
    // Logging
    logging.printOrderSuccess(String(res));
  }
}
