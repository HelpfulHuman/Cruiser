/**
 * Creates and returns a new store for an application model.
 *
 * @param {*} initialState
 */
export function createStore (initialState = {}) {
  var currentState = initialState;
  var subscribers = [];
  var store = {
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
      currentState = reducer(currentState);
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
