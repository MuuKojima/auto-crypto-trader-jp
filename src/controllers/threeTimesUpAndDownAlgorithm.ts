import store from '../stores';
import { BaseTradeAlgorithm } from './baseAlgorithm';

const MAX_RECORDE_SIZE = 3;

/**
 * Logic to sell if it rises 3 times in a row, and buy if it falls 3 times in a row
 */
export class ThreeTimesUpAndDownAlgorithm extends BaseTradeAlgorithm {
  private isReady = false;
  private latestPrice = 0;
  private secondPrice = 0;
  private thirdPrice = 0;
  private myPricePosition = 0;

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
    this.latestPrice = store.getters<number>('trade.latestPrice');
    this.secondPrice = store.getters<number>('trade.prevPrice');
    this.thirdPrice = store.getters<number, { size: number }>(
      'trade.oldestPriceByMaxSize',
      { size: MAX_RECORDE_SIZE }
    );
    store.subscribe('trade', async () => {
      this.isReady = store.getters<boolean>('trade.isReady');
      this.myPricePosition = store.getters<number>('trade.myPricePosition');
      this.latestPrice = store.getters<number>('trade.latestPrice');
      this.secondPrice = store.getters<number>('trade.prevPrice');
      this.thirdPrice = store.getters<number, { size: number }>(
        'trade.oldestPriceByMaxSize',
        { size: MAX_RECORDE_SIZE }
      );
      this.isReady && (await this.think());
    });
  }

  /**
   * Think sell or buy or standby or standby
   */
  async think(): Promise<void> {
    if (this.myPricePosition) {
      this.isUpTrend() &&
        (await store.dispatch('trade.marketSell'));
    } else {
      this.isDownTrend() &&
        (await store.dispatch('trade.marketBuy'));
    }
  }

  /**
   * Whether the value has risen three times in a row
   * e.g.
   * True: 500 > 400 && 400 > 300
   */
  private isUpTrend() {
    return (
      this.latestPrice > this.secondPrice && this.secondPrice > this.thirdPrice
    );
  }

  /**
   * Whether the value has dropped three times in a row
   * e.g.
   * True: 300 > 400 && 400 > 500
   */
  private isDownTrend() {
    return (
      this.latestPrice < this.secondPrice && this.secondPrice < this.thirdPrice
    );
  }
}
