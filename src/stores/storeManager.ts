export interface Store {
  actions: StringKeyObject;
  mutations: StringKeyObject;
  states: StringKeyObject;
  getters: StringKeyObject;
}

export interface ActionContext {
  commit: <T>(mutationName: string, payload: T) => void;
  getters: <T>(getterName: string, payload?: T) => T;
}

export interface MutationContext<T> {
  states: T;
}

export interface GetterContext<T> {
  states: T;
}

interface Events {
  [key: string]: Array<() => void>;
}

interface StringKeyObject {
  // TODO: 🔥 Fix any type
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
}

/**
 * Publish and Subscribe class
 */
class PubSub {
  private events: Events = {};
  /**
   * Subscribe event
   */
  subscribe(
    eventName: string,
    callback: () => void | Promise<void>
  ): () => void {
    if (!Object.prototype.hasOwnProperty.call(this.events, eventName)) {
      this.events[eventName] = [];
    }
    this.events[eventName].push(callback);
    const unsubscribe = () => {
      this.events[eventName] = this.events[eventName].filter(
        (event: () => void) => callback !== event
      );
    };
    return unsubscribe;
  }
  /**
   * Publish the event
   */
  publish(eventName: string): void {
    if (!Object.prototype.hasOwnProperty.call(this.events, eventName)) {
      return;
    }
    this.events[eventName].forEach((callback) => callback());
  }
}

/**
 * StoreManager class for bundle each components
 */
export class StoreManager {
  private events: PubSub;
  private actions: StringKeyObject;
  private mutations: StringKeyObject;
  private states: StringKeyObject;
  private _getters: StringKeyObject;
  constructor(stores: Store) {
    const { actions, mutations, states, getters } = stores;
    if (!actions || !mutations || !states || !getters) {
      throw new Error('You must add actions, mutations, states, getters');
    }
    this.events = new PubSub();
    this.actions = actions;
    this.mutations = mutations;
    this.states = states;
    this._getters = getters;
  }
  /**
   * Dispatch action event
   */
  async dispatch<T>(actionName: string, payload?: T): Promise<void> {
    const action = this.findNestedObj(this.actions, actionName);
    if (typeof action !== 'function') {
      console.error(`Action: actionName doesn't exist => ${actionName}`);
      throw new Error(`Action: actionName doesn't exist => ${actionName}`);
    }
    const context: ActionContext = {
      commit: this.commit.bind(this),
      // TODO: 🔥 Fix any type
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      getters: this.getters.bind(this),
    };
    // TODO: 🔥 Fix any type
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return await action(context, payload);
  }
  /**
   * Commit that modifies the states
   */
  commit<T>(mutationName: string, payload?: T): void {
    const mutation = this.findNestedObj(this.mutations, mutationName);
    if (typeof mutation !== 'function') {
      console.error(`Mutation: mutationName doesn't exist => ${mutationName}`);
      throw new Error(
        `Mutation: mutationName doesn't exist => ${mutationName}`
      );
    }
    const context = {
      states: this.states,
    };
    // TODO: 🔥 Fix any type
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const eventName: string = mutation(context, payload);
    this.events.publish(eventName);
  }

  /**
   * Get state
   */
  getters<T>(getterName: string): T;
  getters<T, U>(getterName: string, payload?: U): T;
  getters<T, U>(getterName: string, payload?: U): T {
    const getter = this.findNestedObj(this._getters, getterName);
    if (typeof getter !== 'function') {
      console.error(`Getter: getterName doesn't exist => ${getterName}`);
      throw new Error(`Getter: getterName doesn't exist => ${getterName}`);
    }
    const context = {
      states: this.states,
    };
    // TODO: 🔥 Fix any type
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return getter(context, payload);
  }
  /**
   * Subscribe event
   */
  subscribe(
    eventName: string,
    callback: () => void | Promise<void>
  ): () => void {
    return this.events.subscribe(eventName, callback);
  }

  /**
   * Find nested object
   * @see: Oliver Steele’s pattern
   * https://medium.com/@flexdinesh/deny-widiyastanto-oliver-steeles-pattern-works-based-on-short-circuit-assignment-f55b46b9a015
   * https://dev.to/flexdinesh/accessing-nested-objects-in-javascript--9m4
   */
  private findNestedObj(obj: StringKeyObject, name: string): StringKeyObject {
    const paths = name.split('.');
    // TODO: 🔥 Fix any type
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return paths.reduce((object, path) => (object || {})[path], obj);
  }
}
