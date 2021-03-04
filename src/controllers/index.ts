import { ThreeTimesUpAndDownAlgorithm } from './threeTimesUpAndDownAlgorithm';
import { TakuyaAlgorithm } from './takuyaAlgorithm';
import { ALGORITHM_ID_MAP } from '../constants';

class TradeAlgorithm {
  init(algorithmId: string) {
    switch (algorithmId) {
      case ALGORITHM_ID_MAP.threeTimesUpAndDown:
        return new ThreeTimesUpAndDownAlgorithm();
      case ALGORITHM_ID_MAP.takuya:
        return new TakuyaAlgorithm();
      default:
        return new ThreeTimesUpAndDownAlgorithm();
    }
  }
}

export = new TradeAlgorithm();
