import { BitflyerApi } from './bitflyer';
import { LiquidApi } from './liquid';
import { SERVICE_ID_MAP } from '../constants';

class TradeApi {
  init(serviceId: string, apiKey: string, apiSecret: string) {
    switch (serviceId) {
      case SERVICE_ID_MAP.bitflyer:
        return new BitflyerApi(apiKey, apiSecret);
      case SERVICE_ID_MAP.liquid:
        return new LiquidApi(apiKey, apiSecret);
      default:
        return new BitflyerApi(apiKey, apiSecret);
    }
  }
}

export = new TradeApi();
