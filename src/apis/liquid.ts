import axios from 'axios';
// import { sign, Algorithm } from 'jsonwebtoken';
// import * as jwt from 'json-web-token';
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
// const X_QUOINE_API_AUTH = 'X-Quoine-Auth';
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
    const liquid = new ccxt.liquid({
      apiKey: this.apiKey,
      secret: this.apiSecret
    })
    // const path = '/orders/';
    // const authPayload = {
    //   path,
    //   nonce: Date.now().toString(),
    //   token_id: this.apiKey
    // };
    // const signature: string | undefined = await new Promise((resolve, reject) => {
    //   jwt.encode(this.apiSecret, authPayload, 'HS256', function (err, res) {
    //     if (err) {
    //       console.log('🔥 エラー');
    //     } else {
    //       resolve(res);
    //     }
    //   });
    // });
    // const body = JSON.stringify({
    //   "order": {
    //     "order_type": "market",
    //     "product_id": 5,
    //     side,
    //     "quantity": btcSize,
    //   }
    // });
    // const config = {
    //   body,
    //   headers: {
    //     [X_QUOINE_API_VERSION.key]: X_QUOINE_API_VERSION.val,
    //     [X_QUOINE_API_AUTH]: signature
    //   },
    //   'Content-Type' : 'application/json'
    // };
    // const url = `${END_POINT}${path}`;
    // const res = await axios
    //   .post(url, config)
    //   .catch((err) => {
    //     console.error('🚨 TradeError: ', new Error(err));
    //     throw err;
    //   });
    const res = await liquid.createMarketOrder('BTC/JPY', side, btcSize)
      .catch((err) => {
        console.error('🚨 TradeError: ', new Error(err));
        throw err;
      });
    // Logging
    logging.printOrderSuccess(String(res.price));
  }
}
