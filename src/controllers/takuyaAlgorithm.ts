import store from '../stores';
import { BaseTradeAlgorithm } from './baseAlgorithm';
import { elapsedSecFromNow } from '../utils';

const COMPARE_INTERVAL_SEC = 30;
const LOSS_CUT_DIFF_YEN = 50;
const TAKE_GAIN_DIFF_YEN = 30;

/**
 * Logic to sell if it rises 3 times in a row, and buy if it falls 3 times in a row
 * + Loss-cut function
 */
export class TakuyaAlgorithm extends BaseTradeAlgorithm {
  private latestPrice = 0;
  private secondPrice = 0;
  private thirdPrice = 0;

  private isIncreasedLatestPriceComparedToPreviousOne = false;
  private lastComparedTime = Date.now();
  private myPricePosition = 0;
  private totalBenefit = 0;

  private POSITION_STATUS = {
    tooLoss: 'toLoss',
    enoughGain: 'enoughGain',
  } as const;

  /**
   * Ready for subscribing
   */
  ready(): void {
    this.latestPrice = store.getters<number>('trade.latestPrice');
    this.isIncreasedLatestPriceComparedToPreviousOne = store.getters<boolean>(
      'trade.isIncreasedLatestPriceComparedToPreviousOne'
    );
    store.subscribe('trade', async () => {
      this.latestPrice = store.getters<number>('trade.latestPrice');
      this.isIncreasedLatestPriceComparedToPreviousOne = store.getters<boolean>(
        'trade.isIncreasedLatestPriceComparedToPreviousOne'
      );
      const watchLength = Math.round(COMPARE_INTERVAL_SEC / this.intervalSec);
      this.secondPrice = store.getters<number, { nth: number }>(
        'trade.nthPrice',
        { nth: watchLength }
      );
      this.thirdPrice = store.getters<number, { nth: number }>(
        'trade.nthPrice',
        { nth: watchLength * 2 }
      );
      await this.think();
    });
  }

  /**
   * Think sell or buy
   */
  async think(): Promise<void> {
    console.log(
      `[THINK] ${this.latestPrice} yen ${
        this.isIncreasedLatestPriceComparedToPreviousOne ? '↑' : '↓'
      } (orderSize: ${this.orderSizeBTC * this.latestPrice} yen)`
    );

    // check
    if (this.myPricePosition) {
      const status = this.checkPositionStatus();
      switch (status) {
        case this.POSITION_STATUS.tooLoss:
          // loss cut
          await this.createSellOrder(this.orderSizeBTC);
          break;
        case this.POSITION_STATUS.enoughGain:
          // take gain
          await this.createSellOrder(this.orderSizeBTC);
          break;
        default:
          break;
      }
    }

    // compare
    const isTimeToCompare =
      elapsedSecFromNow(this.lastComparedTime) > COMPARE_INTERVAL_SEC;
    if (isTimeToCompare) {
      this.lastComparedTime = Date.now();
      console.log(
        `[COMPARE] ${this.latestPrice} yen ${
          this.secondPrice > this.thirdPrice ? '🔼' : '🔻'
        } (orderSize: ${this.orderSizeBTC * this.latestPrice} yen)`
      );
      if (this.myPricePosition) {
        this.isUpTrend() && (await this.createSellOrder(this.orderSizeBTC));
      } else {
        this.isDownTrend() && (await this.createBuyOrder(this.orderSizeBTC));
      }
    }
  }

  /**
   * Dance endlessly
   * Fetch prices then interval
   */
  async dance(): Promise<void> {
    await super.dance();
  }

  /**
   * Whether the value has risen three times in a row
   */
  private isUpTrend() {
    return (
      this.latestPrice > this.secondPrice && this.secondPrice > this.thirdPrice
    );
  }

  /**
   * Whether the value has dropped three times in a row
   */
  private isDownTrend() {
    return (
      this.latestPrice < this.secondPrice && this.secondPrice < this.thirdPrice
    );
  }

  private checkPositionStatus(): string {
    const gain = this.latestPrice * this.orderSizeBTC - this.myPricePosition;
    const loss = -gain;

    console.log(`[CheckPositionStatus] gain: ${gain}`);

    if (loss > LOSS_CUT_DIFF_YEN) {
      console.log('🛡 toLoss!!');
      return this.POSITION_STATUS.tooLoss;
    }
    if (gain > TAKE_GAIN_DIFF_YEN) {
      console.log('👌 enough gain!');
      return this.POSITION_STATUS.enoughGain;
    }
    return '';
  }

  /**
   * Sell
   * 1. Sell order
   * 2. Update total benefit
   * 3. Show console for repors
   * 4. Clear my position
   * @param size {number}
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
   * @param size {number}
   */
  private async createBuyOrder(size: number): Promise<void> {
    const orderPrice = this.latestPrice * size;
    await store.dispatch('trade.marketBuy', { size });
    this.myPricePosition = orderPrice;
    console.log(`[TRADING] 🛍 ${orderPrice} yen`);
    console.log(this.myPricePosition);
  }
}
