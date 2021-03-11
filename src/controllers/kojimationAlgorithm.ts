import store from '../stores';
import { BaseTradeAlgorithm } from './baseAlgorithm';

/**
 * Logic to sell if it rises 4 times in a row, and buy if it falls 3 times in a row
 */
export class KojimationAlgorithm extends BaseTradeAlgorithm {
  private isReady = false;
  private myPricePosition = 0;
  private latestPrice = 0;
  private secondPrice = 0;
  private thirdPrice = 0;
  private fourthPrice = 0;

  /**
   * Dressup each lifecycle
   * ready(), think(), dance()
   */
  async dressup(): Promise<void> {
    await super.dressup();
  }

  /**
   * Ready for subscribing
   */
  ready(): void {
    this.isReady = store.getters<boolean>('trade.isReady');
    this.myPricePosition = store.getters<number>('trade.myPricePosition');
    this.latestPrice = store.getters<number, { nth: number }>(
      'trade.nthPrice',
      { nth: 0 }
    );
    this.secondPrice = store.getters<number, { nth: number }>(
      'trade.nthPrice',
      { nth: 1 }
    );
    this.thirdPrice = store.getters<number, { nth: number }>(
      'trade.nthPrice',
      { nth: 2 }
    );
    this.fourthPrice = store.getters<number, { nth: number }>(
      'trade.nthPrice',
      { nth: 3 }
    );
    store.subscribe('trade', async () => {
      this.isReady = store.getters<boolean>('trade.isReady');
      this.myPricePosition = store.getters<number>('trade.myPricePosition');
      this.latestPrice = store.getters<number, { nth: number }>(
        'trade.nthPrice',
        { nth: 0 }
      );
      this.secondPrice = store.getters<number, { nth: number }>(
        'trade.nthPrice',
        { nth: 1 }
      );
      this.thirdPrice = store.getters<number, { nth: number }>(
        'trade.nthPrice',
        { nth: 2 }
      );
      this.fourthPrice = store.getters<number, { nth: number }>(
        'trade.nthPrice',
        { nth: 3 }
      );
      this.isReady && (await this.think());
    });
  }

  /**
   * Think sell or buy or standby or standby
   */
  async think(): Promise<void> {
    if (this.myPricePosition) {
      this.isUpTrend() && (await store.dispatch('trade.marketSell'));
    } else {
      this.isDownTrend() && (await store.dispatch('trade.marketBuy'));
    }
  }

  /**
   * Whether the value has risen three times in a row
   * e.g.
   * True: 500 > 400 && 400 > 300 && 300 > 200
   */
  private isUpTrend() {
    return (
      this.latestPrice > this.secondPrice && this.secondPrice > this.thirdPrice && this.thirdPrice > this.fourthPrice
    );
  }

  /**
   * Whether the value has dropped three times in a row
   * e.g.
   * True: 300 < 400 && 400 < 500
   */
  private isDownTrend() {
    return (
      this.latestPrice < this.secondPrice && this.secondPrice < this.thirdPrice
    );
  }
}
