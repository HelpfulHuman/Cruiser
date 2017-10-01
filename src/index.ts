export interface NextFunction<T> {
  (state: T): T;
}

export interface Middleware<T> {
  (newState: T, next: NextFunction<T>): T;
}

export interface Subscriber<T> {
  (newState: T);
}

export interface Reducer<T> {
  (state: T): T;
  (state: T): object;
}

export interface Store<T> {
  getState(): T;
  reduce(reducer: Reducer<T>);
  subscribe(subscriber: Subscriber<T>): void;
  unsubscribe(subscriber: Subscriber<T>): void;
}

/**
 * Create a new store object for interacting with current state model
 * and for managing state model mutations.
 */
export function createStore<T>(initialState: T, ...middleware: Middleware<T>[]): Store<T> {
  if (typeof initialState !== "object") {
    throw new Error("Bad argument: Store state MUST be an object.");
  }

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
   * informs subscribers of the change.
   */
  function reduce(reducer: Reducer<T>) {
    if (typeof reducer !== "function") {
      throw new Error("Bad argument: reducer must be a function");
    }
    // Alter the current state of the store using the given reducer
    currentState = runMiddleware(currentState, reducer) as T;

    // Inform subscribers of the state change
    for (var i = 0; i < subscribers.length; i++) {
      subscribers[i](currentState);
    }
  }

  /**
   * Subscribes the given function to state changes and returns an "unsubscribe"
   * method in case an anonymous function is given.
   */
  function subscribe(subscriber: Subscriber<T>) {
    // Validate that a valid function was given
    if (typeof subscriber !== "function") {
      throw new Error("Bad Argument: subscriber must be a function");
    }

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
  function unsubscribe(subscriber: Subscriber<T>) {
    var i = subscribers.indexOf(subscriber);
    if (i !== -1) {
      subscribers.splice(i, 1);
    }
  }

  return { getState, reduce, subscribe, unsubscribe };
}

/**
 * Creates and returns a single middleware function using multiple functions.
 */
export function composeMiddleware<T>(middleware: Middleware<T>[]) {
  for (var i = 0; i < middleware.length; i++) {
    if (typeof middleware[i] !== "function" || middleware[i].length !== 2) {
      throw new Error("Bad argument: Middleware must be function(object, function) -> object.");
    }
  }

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
        if (typeof result !== "object") {
          throw new Error(`An object was expected to return from your middleware/reducer but "${fn.name}" returned a type of "${typeof result}" instead.`);
        }
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