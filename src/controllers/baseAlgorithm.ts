import { sleep } from '../utils';
import store from '../stores';
import context from '../context';

/**
 * Base class for trade algorithm
 */
export class BaseTradeAlgorithm {
  private config = context.config;
  protected intervalSec = this.config.intervalSec;
  protected orderSizeBTC = this.config.orderSizeBTC;

  /**
   * Dressup each lifecycle
   * ready(), think(), dance()
   */
  async dressup(): Promise<void> {
    this.ready();
    await this.think();
    await this.dance();
  }

  /**
   * Ready for subscribing
   */
  protected ready(): void {
    // Override here
  }

  /**
   * Think sell or buy or standby
   */
  protected async think(): Promise<void> {
    // Override here
  }

  /**
   * Dance endlessly
   * Fetch prices then sleeping for interval
   */
  protected async dance(): Promise<void> {
    // Override here if needed
    for (;;) {
      await store.dispatch('trade.fetch');
      await sleep(this.intervalSec);
    }
  }
}
