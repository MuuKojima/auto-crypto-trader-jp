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
  private POSITION_STATUS = {
    tooLoss: 'tooLoss',
    enoughGain: 'enoughGain',
  } as const;

  private isReady = false;
  private myPricePosition = 0;
  private benefit = 0;
  private latestPrice = 0;
  private secondPrice = 0;
  private thirdPrice = 0;
  private lastComparedTime = Date.now();

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
    this.benefit = store.getters<number>('trade.benefit');
    this.latestPrice = store.getters<number>('trade.latestPrice');
    store.subscribe('trade', async () => {
      this.isReady = store.getters<boolean>('trade.isReady');
      this.myPricePosition = store.getters<number>('trade.myPricePosition');
      this.benefit = store.getters<number>('trade.benefit');
      this.latestPrice = store.getters<number>('trade.latestPrice');
      const watchLength = Math.round(COMPARE_INTERVAL_SEC / this.intervalSec);
      this.secondPrice = store.getters<number, { nth: number }>(
        'trade.nthPrice',
        { nth: watchLength }
      );
      this.thirdPrice = store.getters<number, { nth: number }>(
        'trade.nthPrice',
        { nth: watchLength * 2 }
      );
      this.isReady && (await this.think());
    });
  }

  /**
   * Think sell or buy or standby
   */
  async think(): Promise<void> {
    // check
    if (this.myPricePosition) {
      const status = this.checkPositionStatus();
      switch (status) {
        case this.POSITION_STATUS.tooLoss:
          // loss cut
          await store.dispatch('trade.marketSell');
          break;
        case this.POSITION_STATUS.enoughGain:
          // take gain
          await store.dispatch('trade.marketSell');
          break;
        default:
          break;
      }
    }

    if (this.myPricePosition) {
      this.isUpTrend() && (await store.dispatch('trade.marketSell'));
    } else {
      this.isDownTrend() && (await store.dispatch('trade.marketBuy'));
    }

    // compare
    const isTimeToCompare =
      elapsedSecFromNow(this.lastComparedTime) > COMPARE_INTERVAL_SEC;
    if (isTimeToCompare) {
      this.lastComparedTime = Date.now();
      if (this.myPricePosition) {
        this.isUpTrend() && (await store.dispatch('trade.marketSell'));
      } else {
        this.isDownTrend() && (await store.dispatch('trade.marketBuy'));
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

  /**
   * Check postion status
   */
  private checkPositionStatus(): string {
    const gain = this.benefit;
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
}
