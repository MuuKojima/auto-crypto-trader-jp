import store from '../stores';
import { BaseTradeAlgorithm } from './baseAlgorithm';

const MAX_RECORDE_SIZE = 3;

/**
 * Logic to sell if it rises 3 times in a row, and buy if it falls 3 times in a row
 */
export class ThreeTimesUpAndDownAlgorithm extends BaseTradeAlgorithm {
  private latestPrice = 0;
  private prevPrice = 0;
  private oldestPrice = 0;
  private myPricePosition = 0;
  private totalBenefit = 0;

  /**
   * Dressup lifecycle
   */
  async dressup(): Promise<void> {
    await super.dressup();
  }

  /**
   * Ready for subscribing
   */
  ready(): void {
    this.latestPrice = store.getters<number>('trade.latestPrice');
    this.prevPrice = store.getters<number>('trade.prevPrice');
    this.oldestPrice = store.getters<number, { size: number }>(
      'trade.oldestPriceByMaxSize',
      { size: MAX_RECORDE_SIZE }
    );
    store.subscribe('trade', async () => {
      this.latestPrice = store.getters<number>('trade.latestPrice');
      this.prevPrice = store.getters<number>('trade.prevPrice');
      this.oldestPrice = store.getters<number, { size: number }>(
        'trade.oldestPriceByMaxSize',
        { size: MAX_RECORDE_SIZE }
      );
      await this.think();
    });
  }

  /**
   * Think sell or buy
   */
  async think(): Promise<void> {
    if (this.myPricePosition) {
      this.isUpTrend() && (await this.createSellOrder(this.orderSizeBTC));
    } else {
      this.isDownTrend() && (await this.createBuyOrder(this.orderSizeBTC));
    }
  }

  /**
   * Whether the value has risen three times in a row
   */
  private isUpTrend() {
    return (
      this.latestPrice > this.prevPrice && this.prevPrice > this.oldestPrice
    );
  }

  /**
   * Whether the value has dropped three times in a row
   */
  private isDownTrend() {
    return (
      this.latestPrice < this.prevPrice && this.prevPrice < this.oldestPrice
    );
  }

  /**
   * Sell
   * 1. Sell order
   * 2. Update total benefit
   * 3. Show console for repors
   * 4. Clear my position
   * @param size
   */
  private async createSellOrder(size: number): Promise<void> {
    const orderPrice = this.latestPrice * size;
    await store.dispatch('trade.marketSell', { size });
    // Order report
    const benefit = orderPrice - this.myPricePosition;
    this.totalBenefit += benefit;
    console.log(`[TRADING] 💰 ${orderPrice} yen`);
    // Diff report
    const upOrDown = benefit > 0 ? '😆' : '😰';
    console.log(
      `[TRADING] ---- ${upOrDown} diff: ${benefit} yen ${upOrDown} ----`
    );
    console.log(`[TRADING] ---- 📊 total: ${this.totalBenefit} yen 📊 ----`);
    // Clear my position
    this.myPricePosition = 0;
  }

  /**
   * Buy
   * 1. Buy order
   * 2. Update my postion
   * 3. Show console for order price
   * @param size
   */
  private async createBuyOrder(size: number): Promise<void> {
    const orderPrice = this.latestPrice * size;
    await store.dispatch('trade.marketBuy', { size });
    this.myPricePosition = orderPrice;
    console.log(`[TRADING] 🛍 ${orderPrice} yen`);
    console.log(this.myPricePosition);
  }
}
