import { nextTick } from "./nextTick";

export type StoreOptions = {
  /**
   * When `true`, logging will be enabled showing all actions that are dispatched to this store.
   * _Defaults to `true`._
   */
  // debug: boolean;
  /**
   * Optionally configure a debounce duration used to buffer actions.  This means that actions that
   * are received during the debouncing period will be collected and won't be processed until no new
   * actions are dispatched during the debounce duration.  It is highly recommended to keep this interval
   * value small (less than `150` milliseconds). Setting this value to `0` will disable all buffering.
   * _Defaults to `25`._
   */
  bufferInterval: number;
};

const defaultOptions: StoreOptions = {
  // debug: true,
  bufferInterval: 25,
};

// export type CallContext = {
//   /** The name of the action that made the change. */
//   action: string;
//   /** The arguments that the action was called with. */
//   payload: unknown[];
//   /** The resulting state after  */
// }[];

export type Subscriber<Model> = (state: Readonly<Model>) => void;

export type Action<Model> = (state: Model, ...args: unknown[]) => Model;

type OmitFirst<T extends unknown[]> =
  T["length"] extends 0 ? [] :
  (((...b: T) => void) extends (a: unknown, ...b: infer I) => void ? I : []);

export type Dispatcher<Model, ActionFunc extends Action<Model> = Action<Model>> =
  (action: ActionFunc, ...args: OmitFirst<Parameters<ActionFunc>>) => void;

/**
 * Describes the methods that are available for a Cruiser store.
 */
export interface IStore<Model> {
  /**
   * Will be `true` if the store was created with a `debounce` value that was greater than `0`.
   */
  readonly buffered: boolean;
  /**
   * Dispatches an action to the store in order to affect the current state of the store.  Will
   * be processed atomically and batched (when `batch` is enabled for the store).
   */
  dispatch: Dispatcher<Model, Action<Model>>;
  /**
   * Returns the current state of the store as a readonly reference.
   */
  getState(): Readonly<Model>;
  /**
   * Immediately replaces the current state in the store regardless of queue.
   */
  setState(state: Model): void;
  /**
   * Adds a function that will be informed of changes and provided with the most relevant state at
   * the moment that the subscriber is updated.  Returns a function that can be used unsubscribe the
   * listener.  _Note: A function pointer will only be added once to the store, subsequent calls will
   * still return an unsubscribe function to remove said function pointer._
   */
  subscribe(subscriber: Subscriber<Model>): { (): boolean };
}

/**
 * Creates a new Cruiser store.
 */
export function createStore<Model>(initialState: Model, opts: Partial<StoreOptions> = {}): IStore<Model> {
  // Configuration options used to define store behaviour.
  const { bufferInterval: debounce } = { ...defaultOptions, ...opts };

  // Whether or not the store is buffered.
  const buffered = debounce > 0;

  // The current state of our store.
  let state = { ...initialState };

  // The list of subscribers for the store.
  let subscribers: Subscriber<Model>[] = [];

  // The dispatcher method that will be used for this store.
  let dispatch: Dispatcher<Model>;

  if (buffered) {
    // Buffer of actions to process in a batch.
    let timer: null | number | NodeJS.Timeout;
    let buffer: [Action<Model>, unknown[]][] = [];

    const processBuffer = () => {
      timer = null;

      let nextState = state;
      let next = buffer.shift();
      while (next) {
        nextState = next[0](nextState, ...next[1]);
        next = buffer.shift();
      }

      _update(nextState);
    };

    dispatch = <Fn extends Action<Model>>(action: Fn, ...args: OmitFirst<Parameters<Fn>>) => {
      buffer.push([action, args]);
      clearTimeout(timer as NodeJS.Timeout);
      timer = setTimeout(processBuffer, debounce);
    };

  } else {

    dispatch = <Fn extends Action<Model>>(action: Fn, ...args: OmitFirst<Parameters<Fn>>) => {
      _update(action(state, ...args));
    };

  }

  // tslint:disable-next-line: completed-docs
  function _update(_state: Model) {
    state = _state;
    for (let sub of subscribers) {
      nextTick(() => sub(_state));
    }
  }

  // tslint:disable-next-line: completed-docs
  function subscribe(subscriber: Subscriber<Model>) {
    if (subscribers.indexOf(subscriber) === -1) {
      subscribers.push(subscriber);
    }

    return function () {
      const i = subscribers.indexOf(subscriber);
      if (i === -1) { return false; }
      subscribers.splice(i, 1);
      return true;
    };
  }

  // tslint:disable-next-line: completed-docs
  function getState() {
    return state;
  }

  // tslint:disable-next-line: completed-docs
  function setState(state: Model) {
    _update(state);
  }

  return { buffered, getState, setState, subscribe, dispatch };
}