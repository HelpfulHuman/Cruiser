/**
 * Creates and returns a new store for an application model.
 *
 * @param {*} initialState
 */
export function createStore (initialState = {}, ...middleware) {

  if (typeof initialState !== "object") {
    throw new Error("Bad argument: Store state MUST be an object.");
  }

  var currentState = initialState;
  var middleware   = composeMiddleware(middleware);
  var subscribers  = [];
  var store        = {
    /**
     * Subscribes the given function to state changes and returns an "unsubscribe"
     * method in case an anonymous function is given.
     *
     * @param  {Function} subscriber
     * @return {Function}
     */
    subscribe (subscriber) {
      // Validate that a valid function was given
      if (typeof subscriber !== "function") {
        throw new Error("Bad Argument: subscriber must be a function");
      }

      // Only subscribe the given function if it's the first time it's being added
      if (subscribers.indexOf(subscriber) === -1) {
        subscribers.push(subscriber);
      }

      // Return an anonymous unsubscribe function
      return store.unsubscribe.bind(null, subscriber);
    },
    /**
     * Unsubscribes the given function from state changes.
     *
     * @param {Function} subscriber
     */
    unsubscribe (subscriber) {
      var i = subscribers.indexOf(subscriber);
      if (i !== -1) {
        subscribers.splice(i, 1);
      }
    },
    /**
     * Returns the store's most current state.
     *
     * @return {*}
     */
    getState () {
      return currentState;
    },
    /**
     * Passes the current state to the given reducer, updates the stored state and
     * informs subscribers of the change.
     *
     * @param {Function} reducer
     */
    reduce (reducer) {
      if (typeof reducer !== "function") {
        throw new Error("Bad argument: reducer must be a function");
      }
      // Alter the current state of the store using the given reducer
      currentState = middleware(currentState, reducer);
      // Inform subscribers of the state change
      for (var i = 0; i < subscribers.length; i++) {
        subscribers[i](currentState);
      }
    },
    /**
     * Alias for "reduce()".
     *
     * @param {Function} reducer
     */
    dispatch (reducer) {
      store.reduce(reducer);
    },
  };

  return store;
}

/**
 * Creates and returns a single middleware function using multiple functions.
 *
 * @param  {Array<Function>} fns
 * @return {Function}
 */
export function composeMiddleware (middleware) {
  for (var i = 0; i < middleware.length; i++) {
    if (typeof middleware[i] !== "function" || middleware[i].length !== 2) {
      throw new Error("Bad argument: Middleware must be function(object, function) -> object.");
    }
  }

  return function (state, reducer) {
    // Add the reducer to the middleware stack
    var remaining = middleware.concat(reducer);
    // Create a next function that invokes the next middleware in the chain.
    var next = function (value) {
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
    }
    // Invoke the first middleware method in the stack and return the result
    return next(state);
  };
};