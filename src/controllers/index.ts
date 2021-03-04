import { ThreeTimesUpAndDownAlgorithm } from './threeTimesUpAndDownAlgorithm';
import { ALGORITHM_ID_MAP } from '../constants';

class TradeAlgorithm {
  init(algorithmId: string) {
    switch (algorithmId) {
      case ALGORITHM_ID_MAP.threeTimesUpAndDown:
        return new ThreeTimesUpAndDownAlgorithm();
      default:
        return new ThreeTimesUpAndDownAlgorithm();
    }
  }
}

export = new TradeAlgorithm();
