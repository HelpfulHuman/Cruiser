export interface NextFunction<T> {
  (state: T): T;
}

export interface Middleware<T> {
  (newState: T, next: NextFunction<T>): T;
}

export interface Subscriber<T> {
  (newState: T): void;
}

export interface Unsubscriber {
  (): void;
}

export interface Reducer<T> {
  (state: T): object|T;
}

export interface BoundReducer<T> {
  (...args: any[]): T;
}

export interface Store<T> {
  getState(): T;
  reduce(reducer: Reducer<T>): T;
  dispatch(reducer: Reducer<T>): T;
  bindReducer(reducer: Reducer<T>): BoundReducer<T>;
  subscribe(subscriber: Subscriber<T>): void;
  unsubscribe(subscriber: Subscriber<T>): void;
}

/**
 * Throws an error if the given value isn't an object.
 */
function assertObject(val: any, message: string): void {
  if (typeof val !== "object") {
    throw new Error(message);
  }
}

/**
 * Throws an error if the given value isn't a function.
 */
function assertFunc(val: any, message: string): void {
  if (typeof val !== "function") {
    throw new Error(message);
  }
}

/**
 * Create a new store object for interacting with current state model
 * and for managing state model mutations.
 */
export function createStore<T>(initialState: T, ...middleware: Middleware<T>[]): Store<T> {
  assertObject(initialState, "Bad argument: Store state MUST be an object.");

  var currentState    = initialState;
  var subscribers     = [];
  var runMiddleware   = composeMiddleware(middleware);

  /**
   * Returns the store's most current state.
   */
  function getState(): T {
    return currentState;
  }

  /**
   * Passes the current state to the given reducer, updates the stored state and
   * informs subscribers of the change.  Returns the new state immediately.
   */
  function reduce(reducer: Reducer<T>): T {
    assertFunc(reducer, "Bad argument: reducer must be a function");

    // Alter the current state of the store using the given reducer
    currentState = runMiddleware(currentState, reducer) as T;

    // Inform subscribers of the state change
    for (var i = 0; i < subscribers.length; i++) {
      subscribers[i](currentState);
    }

    // Return the new state
    return currentState;
  }

  /**
   * Subscribes the given function to state changes and returns an "unsubscribe"
   * method in case an anonymous function is given.
   */
  function subscribe(subscriber: Subscriber<T>): Unsubscriber {
    assertFunc(subscriber, "Bad Argument: subscriber must be a function");

    // Only subscribe the given function if it's the first time it's being added
    if (subscribers.indexOf(subscriber) === -1) {
      subscribers.push(subscriber);
    }

    // Return an anonymous unsubscribe function
    return unsubscribe.bind(null, subscriber);
  }

  /**
   * Unsubscribes the given function from state changes.
   */
  function unsubscribe(subscriber: Subscriber<T>): void {
    var i = subscribers.indexOf(subscriber);
    if (i !== -1) {
      subscribers.splice(i, 1);
    }
  }

  /**
   * Hard-bind a reducer to the store.
   */
  function bindReducer(reducer: Reducer<T>): BoundReducer<T> {
    return function (...args: any[]): T {
      return reduce(state => reducer(state, ...args));
    };
  }

  return { getState, reduce, dispatch: reduce, bindReducer, subscribe, unsubscribe };
}

/**
 * Creates and returns a single middleware function using multiple functions.
 */
export function composeMiddleware<T>(middleware: Middleware<T>[]) {
  middleware.forEach(fn => assertFunc(fn, "Bad Argument: Middleware(s) must be functions."));

  return function (state, reducer) {
    // Add the reducer to the middleware stack
    var remaining = middleware.concat(reducer);
    // Create a next function that invokes the next middleware in the chain.
    function next (value: T): T {
      try {
        // Get the next function in the stack
        var fn = remaining.shift();
        // Capture and check the result
        var result = fn(value, next);
        // Validate that the result is an object!
        assertObject(result, `An object was expected to return from your middleware/reducer but "${typeof result}" was returned instead.`);
        // Return the result
        return result;
      } catch (err) {
        console.error(err);
        return value;
      }
    }
    // Invoke the first middleware method in the stack and return the result
    return next(state);
  };
};