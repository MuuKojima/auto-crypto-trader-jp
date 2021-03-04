import { StoreManager, Store } from './storeManager';

import actions from './actions';
import getters from './getters';
import mutations from './mutations';
import states from './states';

const stores: Store = {
  actions,
  mutations,
  getters,
  states,
};
export = new StoreManager(stores);
