import { KojimationAlgorithm } from './kojimationAlgorithm';
import { ThreeTimesUpAndDownAlgorithm } from './threeTimesUpAndDownAlgorithm';
import { TakuyaAlgorithm } from './takuyaAlgorithm';
import { ALGORITHM_ID_MAP } from '../constants';

class TradeAlgorithm {
  init(algorithmId: valueof<typeof ALGORITHM_ID_MAP>) {
    switch (algorithmId) {
      case ALGORITHM_ID_MAP.threeTimesUpAndDown:
        return new ThreeTimesUpAndDownAlgorithm();
      case ALGORITHM_ID_MAP.takuya:
        return new TakuyaAlgorithm();
      case ALGORITHM_ID_MAP.kojimation:
        return new KojimationAlgorithm();
      default:
        return new ThreeTimesUpAndDownAlgorithm();
    }
  }
}

export = new TradeAlgorithm();
