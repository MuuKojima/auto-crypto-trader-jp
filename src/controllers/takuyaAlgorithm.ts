import store from '../stores';
import { BaseTradeAlgorithm } from './baseAlgorithm';
import { elapsedSecFromNow } from '../utils';
import { RSI } from 'technicalindicators';

const COMPARE_INTERVAL_SEC = 10;
const LOSS_CUT_DIFF_YEN = 20;
const TAKE_GAIN_DIFF_YEN = 50;

const POSITION_STATUS = {
  tooLoss: 'tooLoss',
  enoughGain: 'enoughGain',
  other: 'other',
} as const;

const RSI_STATUS = {
  notEnoughData: 'notEnoughData',
  isOnUpTrend: 'isOnUpTrend',
  isOnDownTrend: 'isOnDownTrend',
  other: 'other',
} as const;

/**
 * Logic to sell if it rises 3 times in a row, and buy if it falls 3 times in a row
 * + Loss-cut function
 */
export class TakuyaAlgorithm extends BaseTradeAlgorithm {
  private shortRSI = new RSI({
    values: [],
    period: (5 * 60) / this.intervalSec,
  }); // 5 min
  private mediumRSI = new RSI({
    values: [],
    period: (30 * 60) / this.intervalSec,
  }); // 30 min
  private longRSI = new RSI({
    values: [],
    period: (60 * 60) / this.intervalSec,
  }); // 60 min

  private isReady = false;
  private myPricePosition = 0;
  private benefit = 0;
  private latestPrice = 0;
  private secondPrice = 0;
  private thirdPrice = 0;
  private lastComparedTime = Date.now();

  private currentShortRSI: number | undefined;
  private currentMediumRSI: number | undefined;
  private currentLongRSI: number | undefined;

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
        'trade.nthPriceByWatch',
        { nth: watchLength - 1 }
      );
      this.thirdPrice = store.getters<number, { nth: number }>(
        'trade.nthPriceByWatch',
        { nth: (watchLength - 1) * 2 }
      );

      this.currentShortRSI = this.shortRSI.nextValue(this.latestPrice);
      this.currentMediumRSI = this.mediumRSI.nextValue(this.latestPrice);
      this.currentLongRSI = this.longRSI.nextValue(this.latestPrice);

      this.isReady && (await this.think());
    });
  }

  /**
   * Think sell or buy or standby
   */
  async think(): Promise<void> {
    this.printRSIs();

    if (!this.myPricePosition) {
      const rsiStatus = this.checkRSIStatus();
      switch (rsiStatus) {
        case RSI_STATUS.notEnoughData:
          return;
        case RSI_STATUS.other:
          return;
        case RSI_STATUS.isOnDownTrend:
          // TODO: Do Inversed Logic
          return;
        case RSI_STATUS.isOnUpTrend:
          // can go
          break;
      }
    }

    // check
    if (this.myPricePosition) {
      const status = this.checkPositionStatus();
      switch (status) {
        case POSITION_STATUS.tooLoss:
          // loss cut
          await store.dispatch('trade.marketSell');
          break;
        case POSITION_STATUS.enoughGain:
          // take gain
          await store.dispatch('trade.marketSell');
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
   * True: 300 < 400 && 400 < 500
   */
  private isDownTrend() {
    return (
      this.latestPrice < this.secondPrice && this.secondPrice < this.thirdPrice
    );
  }

  /**
   * Check postion status
   */
  private checkPositionStatus(): keyof typeof POSITION_STATUS {
    const gain = this.latestPrice * this.orderSizeBTC - this.myPricePosition;
    const loss = -gain;
    console.log(`[CheckPositionStatus] gain: ${gain}`);
    if (loss > LOSS_CUT_DIFF_YEN) {
      console.log('🛡 toLoss!!');
      return POSITION_STATUS.tooLoss;
    }
    if (gain > TAKE_GAIN_DIFF_YEN) {
      console.log('👌 enough gain!');
      return POSITION_STATUS.enoughGain;
    }
    return POSITION_STATUS.other;
  }

  private checkRSIStatus(): keyof typeof RSI_STATUS {
    if (
      !this.currentShortRSI ||
      !this.currentMediumRSI ||
      !this.currentLongRSI
    ) {
      return RSI_STATUS.notEnoughData;
    }
    const short = this.currentShortRSI;
    const mid = this.currentMediumRSI;
    const long = this.currentLongRSI;
    if (short < 40 || mid < 45 || long < 30) {
      return RSI_STATUS.isOnDownTrend;
    }
    if (short > 55 && mid > 55) {
      return RSI_STATUS.isOnUpTrend;
    }
    if (mid > 50 && long > 50) {
      return RSI_STATUS.isOnUpTrend;
    }
    return RSI_STATUS.other;
  }

  private printRSIs(): void {
    console.log(
      `short: ${this.currentShortRSI ?? '---'} | medium: ${
        this.currentMediumRSI ?? '---'
      } | long: ${this.currentLongRSI ?? '---'}`
    );
  }
}
